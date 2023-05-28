import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesFilters {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  property_type?: PropertyType;
}

interface HomeData {
  address: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  city: string;
  listed_date: Date;
  price: number;
  land_size: number;
  property_type: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeData {
  address?: string;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  city?: string;
  listed_date?: Date;
  price?: number;
  land_size?: number;
  property_type?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filters: GetHomesFilters): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (homes?.length === 0) {
      throw new NotFoundException();
    }

    return homes?.map((home) => {
      const data = { ...home, image: home?.images[0]?.url };
      delete data.images;
      return new HomeResponseDto(data);
    });
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findFirst({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        images: {
          select: {
            url: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }

  async storeHome({
    address,
    number_of_bedrooms,
    number_of_bathrooms,
    city,
    listed_date,
    price,
    land_size,
    property_type,
    images,
  }: HomeData) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bedrooms,
        number_of_bathrooms,
        city,
        listed_date,
        price,
        land_size,
        property_type,
        realtor_id: 4,
        updated_at: new Date(),
      },
    });

    const imageUrls = images.map((image) => {
      return {
        ...image,
        home_id: home.id,
        url: image.url,
        updated_at: new Date(),
      };
    });

    await this.prismaService.image.createMany({
      data: imageUrls,
    });
    return new HomeResponseDto(home);
  }

  async updateHome(data: UpdateHomeData, id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });
    return new HomeResponseDto(updatedHome);
  }
}
