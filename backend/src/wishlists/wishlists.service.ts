import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

const checkWishesExist = (wishes: Wish[], itemsId: number[]) => {
  const foundIds = wishes.map((wish) => wish.id);
  const missingIds = itemsId.filter((id) => !foundIds.includes(id));

  if (missingIds.length > 0) {
    throw new BadRequestException(
      `Подарки с ID ${missingIds.join(', ')} не найдены`,
    );
  }
};

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(
    { itemsId, ...createWishlistDto }: CreateWishlistDto,
    user: User,
  ) {
    const wishes = await this.wishRepository.find({
      where: { id: In(itemsId) },
    });

    checkWishesExist(wishes, itemsId);

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });

    return this.wishlistRepository.save(wishlist);
  }

  findMany(filter?: FindManyOptions<Wishlist>) {
    return this.wishlistRepository.find({
      ...filter,
      relations: ['items', 'owner'],
    });
  }

  async findOne(filter: FindOptionsWhere<Wishlist>) {
    const wishlist = await this.wishlistRepository.findOne({
      where: filter,
      relations: ['items', 'owner'],
    });

    if (!wishlist) {
      throw new NotFoundException(`Список подарков не найден`);
    }

    return wishlist;
  }

  async updateOne(
    filter: FindOptionsWhere<Wishlist>,
    { itemsId, ...updateWishlistDto }: UpdateWishlistDto,
    user: User,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: filter,
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException(
        'Можно редактировать только свой список подарков',
      );
    }

    if (itemsId) {
      const wishes = await this.wishRepository.find({
        where: { id: In(itemsId) },
      });

      checkWishesExist(wishes, itemsId);

      wishlist.items = wishes;
    }

    await this.wishlistRepository.save({ ...wishlist, ...updateWishlistDto });

    return this.wishlistRepository.findOne({
      where: filter,
      relations: ['items', 'owner'],
    });
  }

  async removeOne(filter: FindOptionsWhere<Wishlist>, user: User) {
    const wishlist = await this.wishlistRepository.findOne({
      where: filter,
      relations: ['items', 'owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException(
        'Можно редактировать только свой список подарков',
      );
    }

    await this.wishlistRepository.delete(filter);

    return wishlist;
  }
}
