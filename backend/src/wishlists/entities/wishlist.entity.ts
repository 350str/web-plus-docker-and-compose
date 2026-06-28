import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../_shared';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist extends BaseEntity {
  @Column()
  @IsString({ message: 'Wishlist.name: должно быть строкой' })
  @Length(1, 250, {
    message: 'Wishlist.name: длина должна быть от 1 до 250 символов',
  })
  name: string;

  @Column({ nullable: true })
  @IsString({ message: 'Wishlist.description: должно быть строкой' })
  @Length(1, 1500, {
    message: 'Wishlist.description: длина должна быть от 1 до 1500 символов',
  })
  @IsOptional() // во фронтенде этого поля нет, хотя в задании есть - сделал опциональным
  description?: string;

  @Column()
  @IsString({ message: 'Wishlist.image: должно быть строкой' })
  @IsUrl({}, { message: 'Wishlist.image: должно быть валидным URL' })
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}
