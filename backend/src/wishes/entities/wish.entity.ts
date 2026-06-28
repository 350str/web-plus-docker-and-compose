import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../../_shared';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Wish extends BaseEntity {
  @Column()
  @IsString({ message: 'Wish.name: должно быть строкой' })
  @Length(1, 250, {
    message: 'Wish.name: длина должна быть от 1 до 250 символов',
  })
  name: string;

  @Column()
  @IsString({ message: 'Wish.link: должно быть строкой' })
  @IsUrl({}, { message: 'Wish.link: должно быть валидным URL' })
  link: string;

  @Column()
  @IsString({ message: 'Wish.image: должно быть строкой' })
  @IsUrl({}, { message: 'Wish.image: должно быть валидным URL' })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Wish.price: должно быть числом с максимум 2 знаками после запятой',
    },
  )
  @IsPositive({ message: 'Wish.price: должно быть положительным числом' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Wish.raised: должно быть числом с максимум 2 знаками после запятой',
    },
  )
  @IsPositive({ message: 'Wish.raised: должно быть положительным числом' })
  raised: number;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  @Length(1, 1024, {
    message: 'Wish.description: длина должна быть от 1 до 1024 символов',
  })
  description: string;

  @Column({ default: 0 })
  @IsInt({ message: 'Wish.copied: должно быть целым числом' })
  @Min(0, { message: 'Wish.copied: должно быть не меньше 0' })
  copied: number;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}
