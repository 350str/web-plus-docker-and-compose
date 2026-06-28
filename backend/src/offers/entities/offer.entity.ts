import { IsBoolean, IsNumber, Min } from 'class-validator';
import { BaseEntity } from 'src/_shared';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Offer.amount: должно быть числом с максимум 2 знаками после запятой',
    },
  )
  @Min(0, { message: 'Offer.amount: должно быть не меньше 0' })
  amount: number;

  @Column({ default: false })
  @IsBoolean({ message: 'Offer.hidden: должно быть булевым значением' })
  hidden: boolean;
}
