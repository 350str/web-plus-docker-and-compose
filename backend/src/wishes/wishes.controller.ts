import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
@UseInterceptors(ClassSerializerInterceptor)
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  last() {
    return this.wishesService.findMany({
      take: 40,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  @Get('top')
  top() {
    return this.wishesService.findMany({
      take: 10,
      order: {
        raised: 'DESC',
      },
    });
  }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createWishDto: CreateWishDto, @Req() req) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @UseGuards(JwtGuard)
  @Get()
  findMany() {
    return this.wishesService.findMany();
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  removeOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.wishesService.removeOne({ id }, req.user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  updateOne(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.updateOne({ id }, updateWishDto, req.user);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  copyOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.wishesService.copyOne({ id }, req.user);
  }
}
