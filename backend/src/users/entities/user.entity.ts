import { Exclude } from 'class-transformer';
import { IsEmail, IsString, IsUrl, Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '../../_shared';
import { Offer } from '../../offers/entities/offer.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity()
export class User extends BaseEntity {
  @Column({
    unique: true,
  })
  @IsString({ message: 'User.username: поле обязательно для заполнения' })
  @Length(2, 30, {
    message: 'User.username: длина должна быть от 2 до 30 символов',
  })
  username: string;

  @Column({ default: 'Пока ничего не рассказал о себе' })
  @IsString({
    message: 'User.about: должно быть строкой',
  })
  @Length(2, 200, {
    message: 'User.about: длина должна быть от 2 до 200 символов',
  })
  about: string;

  @Column({ default: 'https://i.pravatar.cc/300' })
  @IsUrl({}, { message: 'User.avatar: должно быть валидным URL' })
  avatar: string;

  @Column({ unique: true, nullable: false })
  @IsEmail({}, { message: 'User.email: должен быть валидным email адресом' })
  @Exclude()
  email: string;

  @Column()
  @IsString({ message: 'User.password: должно быть строкой' })
  @Exclude()
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
