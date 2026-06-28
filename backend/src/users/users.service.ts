import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const getUniqValueError = (error: unknown) => {
  if (
    error instanceof QueryFailedError &&
    error.driverError?.code === '23505'
  ) {
    const detail = error.driverError?.detail || '';
    if (detail.includes('email')) {
      return new ConflictException('Пользователь с таким email уже существует');
    }

    if (detail.includes('username')) {
      return new ConflictException(
        'Пользователь с таким username уже существует',
      );
    }

    return new ConflictException('Нарушение уникальности');
  }

  return error;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = await this.userRepository.save(user);
      return result;
    } catch (error) {
      throw getUniqValueError(error);
    }
  }

  async findOne(
    filter: FindOptionsWhere<User>,
    isPublic?: false,
  ): Promise<User>;
  async findOne(
    filter: FindOptionsWhere<User>,
    isPublic: true,
  ): Promise<Omit<User, 'password'>>;
  async findOne(filter: FindOptionsWhere<User>, isPublic?: boolean) {
    const user = await this.userRepository.findOne({
      where: filter,
      relations: ['wishes'],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь не найден`);
    }

    if (isPublic) {
      delete user.password;
    }

    return user;
  }

  async findMany(searchDto: SearchUserDto) {
    return this.userRepository.find({
      where: [
        { username: ILike(`%${searchDto.query}%`) },
        { email: ILike(`%${searchDto.query}%`) },
      ],
    });
  }

  async updateOne(
    filter: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      const result = await this.userRepository.update(filter, updateUserDto);

      if (result.affected === 0) {
        throw new NotFoundException(`Пользователь не найден`);
      }

      return this.userRepository.findOneBy(filter);
    } catch (error) {
      throw getUniqValueError(error);
    }
  }

  async removeOne(filter: FindOptionsWhere<User>) {
    const user = await this.userRepository.findOneBy(filter);

    if (!user) {
      throw new NotFoundException(`Пользователь не найден`);
    }

    await this.userRepository.delete(filter);

    return user;
  }
}
