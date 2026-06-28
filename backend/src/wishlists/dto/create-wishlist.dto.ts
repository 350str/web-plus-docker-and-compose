import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString({ message: 'Wishlist.name: должно быть строкой' })
  @Length(1, 250, {
    message: 'Wishlist.name: длина должна быть от 1 до 250 символов',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Wishlist.description: должно быть строкой' })
  @Length(1, 1500, {
    message: 'Wishlist.description: длина должна быть от 1 до 1500 символов',
  })
  description?: string;

  @IsString({ message: 'Wishlist.image: должно быть строкой' })
  @IsUrl({}, { message: 'Wishlist.image: должно быть валидным URL' })
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  itemsId: number[];
}
