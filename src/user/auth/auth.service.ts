import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from '../dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface SignupData {
  name: string;
  phone: string;
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
    return user;
  }
}
