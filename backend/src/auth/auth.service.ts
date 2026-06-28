import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { id: user.id };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne({ username });

    const matched = await bcrypt.compare(password, user.password);

    if (matched) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;

      return result;
    }

    return null;
  }
}
