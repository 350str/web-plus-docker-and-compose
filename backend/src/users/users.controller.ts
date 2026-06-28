import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';

import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req) {
    return this.usersService.findOne({ id: req.user.id }, true);
  }

  @Patch('me')
  @UseInterceptors(ClassSerializerInterceptor)
  updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne({ id: req.user.id }, updateUserDto);
  }

  @Get(':username')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('username') username: string) {
    return this.usersService.findOne({ username });
  }

  @Get('me/wishes')
  @UseInterceptors(ClassSerializerInterceptor)
  async getMeWishes(@Req() req) {
    const user = await this.usersService.findOne({ id: req.user.id });

    return user.wishes;
  }

  @Get(':username/wishes')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneWishes(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });

    return user.wishes;
  }

  @Post('find')
  @UseInterceptors(ClassSerializerInterceptor)
  find(@Body() body: SearchUserDto) {
    return this.usersService.findMany(body);
  }
}
