import { Controller, Post, Body, Param, ParseEnumPipe, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { UserType } from '@prisma/client';
import { env } from 'process';
import * as bcrypt from 'bcryptjs';
import { User, UserData } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (!UserType.BUYER) {
      if (!body.product_key) {
        throw new UnauthorizedException();
      }
      const validProductKey = `${body.email}-${userType}-${env.PRODUCT_SECRET}`;
      const isValidProductKey = bcrypt.compare(
        validProductKey,
        body.product_key,
      );
      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }
    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { email, user_type }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, user_type);
  }

  @Get('me')
  getAuthUser(@User() user: UserData) {
    return user;
  }
}
