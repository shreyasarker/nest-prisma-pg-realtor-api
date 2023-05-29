import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 1,
    address: '216 N Bowen St, Jackson, MI 49202',
    city: 'Jackson',
    price: 173900,
    image:
      'https://ap.rdcpix.com/f86b52d113ed5b3015681748262c7986l-m3168172625od-w480_h360_x2.webp',
    numberOfBedrooms: 4,
    numberOfBathrooms: 2,
    propertyType: PropertyType.RESIDENTIAL,
    images: [
      {
        url: 'https://ap.rdcpix.com/f86b52d113ed5b3015681748262c7986l-m3168172625od-w480_h360_x2.webp',
      },
    ],
  },
];

const mockGetHomeById = {
  id: 1,
  address: '216 N Bowen St, Jackson, MI 49202',
  city: 'Jackson',
  price: 173900,
  image:
    'https://ap.rdcpix.com/f86b52d113ed5b3015681748262c7986l-m3168172625od-w480_h360_x2.webp',
  numberOfBedrooms: 4,
  numberOfBathrooms: 2,
  propertyType: PropertyType.RESIDENTIAL,
  images: [
    {
      url: 'src1',
    },
  ],
};

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              findFirst: jest.fn().mockReturnValue(mockGetHomeById),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Jackson',
      price: {
        gte: 11111,
        lte: 3333333,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMay with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
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
    });

    it('should throw not found exception if no homes were found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('getHomeById', () => {
    const homeId = 1;

    it('should call prisma home.findUnique by Id', async () => {
      const mockPrismaFindUniqueHome = jest
        .fn()
        .mockReturnValue(mockGetHomeById);

      jest
        .spyOn(prismaService.home, 'findFirst')
        .mockImplementation(mockPrismaFindUniqueHome);

      await service.getHomeById(homeId);
      expect(mockPrismaFindUniqueHome).toBeCalledWith({
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
          id: homeId,
        },
      });
    });

    it('should throw not found exception if no home by id were found', async () => {
      const mockPrismaFindUniqueHome = jest.fn().mockReturnValue(null);

      jest
        .spyOn(prismaService.home, 'findFirst')
        .mockImplementation(mockPrismaFindUniqueHome);

      await expect(service.getHomeById(homeId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
