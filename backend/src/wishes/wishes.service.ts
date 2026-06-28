import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from 'src/offers/entities/offer.entity';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  create(createWishDto: CreateWishDto, user: User) {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });

    return this.wishRepository.save(wish);
  }

  async findOne(filter: FindOptionsWhere<Wish>) {
    const wish = await this.wishRepository.findOne({
      where: filter,
      relations: ['offers', 'owner'],
    });

    if (!wish) {
      throw new NotFoundException(`Подарок не найден`);
    }

    return wish;
  }

  findMany(filter?: Pick<FindManyOptions<Wish>, 'take' | 'order'>) {
    return this.wishRepository.find({
      ...filter,
      relations: ['offers', 'owner'],
    });
  }

  async removeOne(filter: FindOptionsWhere<Wish>, user: User) {
    const wish = await this.wishRepository.findOne({
      where: filter,
      relations: ['offers', 'owner'],
    });

    if (!wish) {
      throw new NotFoundException(`Подарок не найден`);
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Можно редактировать только свои подарки');
    }

    await this.wishRepository.manager.transaction(async (manager) => {
      if (wish.offers?.length) {
        await manager.delete(Offer, { item: { id: wish.id } });
      }
      await manager.delete(Wish, filter);
    });

    return wish;
  }

  async updateOne(
    filter: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    user: User,
  ) {
    const wish = await this.wishRepository.findOne({
      where: filter,
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Можно редактировать только свои подарки');
    }

    // Для decimal-полей TypeORM с PostgreSQL часто возвращает строку, например "0.00", хотя в сущности указан тип number
    if (Number(updateWishDto.price) && Number(wish.raised)) {
      throw new ForbiddenException(
        'Нельзя менять цену подарка, при наличии желающих скинуться',
      );
    }

    await this.wishRepository.update(filter, updateWishDto);

    return this.wishRepository.findOne({
      where: filter,
      relations: ['offers', 'owner'],
    });
  }

  async copyOne(filter: FindOptionsWhere<Wish>, user: User) {
    const wish = await this.wishRepository.findOne({
      where: filter,
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return await this.wishRepository.manager.transaction(async (manager) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...wishPayload } = wish;

      const copy = manager.create(Wish, {
        ...wishPayload,
        copied: 0,
        raised: 0,
        offers: [],
        owner: user,
      });

      await manager.increment(Wish, filter, 'copied', 1);

      return manager.save(copy);
    });
  }
}
