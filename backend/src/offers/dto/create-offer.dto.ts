import { IsBoolean, IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Offer.amount: должно быть числом с максимум 2 знаками после запятой',
    },
  )
  @IsPositive({ message: 'Offer.amount: должно быть больше 0' })
  amount: number;

  @IsBoolean({ message: 'Offer.hidden: должно быть булевым значением' })
  hidden: boolean;

  @IsNumber({}, { message: 'Offer.itemId: должно быть числом' })
  itemId: number;
}
