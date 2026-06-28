import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create({ itemId, ...createOfferDto }: CreateOfferDto, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException('Нельзя скидываться на свой подарок');
    }

    const remaining = wish.price - wish.raised;
    if (createOfferDto.amount > remaining) {
      throw new BadRequestException(
        `Сумма слишком большая. Осталось собрать: ${remaining}`,
      );
    }

    return this.offerRepository.manager.transaction(async (manager) => {
      const offer = manager.create(Offer, {
        ...createOfferDto,
        item: { id: wish.id },
        user,
      });

      const savedOffer = await manager.save(offer);

      await manager.increment(
        Wish,
        { id: wish.id },
        'raised',
        createOfferDto.amount,
      );

      return manager.findOne(Offer, {
        where: { id: savedOffer.id },
        relations: ['user', 'item'],
      });
    });
  }

  async findOne(filter: FindOptionsWhere<Offer>) {
    const offer = await this.offerRepository.findOne({
      where: filter,
      relations: ['user', 'item'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer не найден`);
    }
    const { user, ...offerWithoutUser } = offer;

    return offerWithoutUser.hidden
      ? offerWithoutUser
      : { ...offerWithoutUser, user };
  }

  async findAll(filter: FindOptionsWhere<Offer>) {
    return this.offerRepository
      .find({
        where: filter,
        relations: ['user', 'item'],
      })
      .then((offers) =>
        offers.map(({ user, ...offerWithoutUser }) =>
          offerWithoutUser.hidden
            ? offerWithoutUser
            : { ...offerWithoutUser, user },
        ),
      );
  }
}
