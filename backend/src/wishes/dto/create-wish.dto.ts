import { IsNumber, IsPositive, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishDto {
  @IsString({ message: 'Wish.name: должно быть строкой' })
  @Length(1, 250, {
    message: 'Wish.name: длина должна быть от 1 до 250 символов',
  })
  name: string;

  @IsString({ message: 'Wish.link: должно быть строкой' })
  @IsUrl({}, { message: 'Wish.link: должно быть валидным URL' })
  link: string;

  @IsString({ message: 'Wish.image: должно быть строкой' })
  @IsUrl({}, { message: 'Wish.image: должно быть валидным URL' })
  image: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Wish.price: должно быть числом с максимум 2 знаками после запятой',
    },
  )
  @IsPositive({ message: 'Wish.price: должно быть положительным числом' })
  price: number;

  @Length(1, 1024, {
    message: 'Wish.description: длина должна быть от 1 до 1024 символов',
  })
  description: string;
}
