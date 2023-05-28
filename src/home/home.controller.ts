import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';
import { User, UserData } from 'src/user/decorators/user.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { property_type: propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }
  @Post()
  storeHome(@Body() body: CreateHomeDto, @User() user: UserData) {
    return this.homeService.storeHome(body, user.id);
  }

  @Put(':id')
  async updateHome(
    @Body() body: UpdateHomeDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserData,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor?.id !== user?.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.updateHome(body, id);
  }

  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserData,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor?.id !== user?.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.deleteHome(id);
  }
}
