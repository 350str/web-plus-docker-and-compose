import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'User.username: поле обязательно для заполнения' })
  @Length(2, 30, {
    message: 'User.username: длина должна быть от 2 до 30 символов',
  })
  username: string;

  @IsString({
    message: 'User.about: должно быть строкой',
  })
  @Length(2, 200, {
    message: 'User.about: длина должна быть от 2 до 200 символов',
  })
  @IsOptional()
  about?: string;

  @IsUrl({}, { message: 'User.avatar: должно быть валидным URL' })
  @IsOptional()
  avatar?: string;

  @IsEmail({}, { message: 'User.email: должен быть валидным email адресом' })
  email: string;

  @IsString({ message: 'User.password: должно быть строкой' })
  password: string;
}
