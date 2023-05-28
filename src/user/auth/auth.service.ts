import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import { env } from 'process';

interface SignupData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SigninData {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ name, phone, email, password }: SignupData) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        user_type: UserType.BUYER,
        name,
        phone,
        email,
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return this.generateJWT(user.id, name);
  }

  async signin({ email, password }: SigninData) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(user.id, user.name);
  }

  private generateJWT(id: number, name: string) {
    const token = jwt.sign(
      {
        name,
        id,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      },
    );
    return token;
  }

  generateProductKey(email: string, userType: UserType) {
    const key = `${email}-${userType}-${env.PRODUCT_SECRET}`;
    return bcrypt.hash(key, 10);
  }
}
