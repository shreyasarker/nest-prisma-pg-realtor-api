import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsPositive,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

export class HomeResponseDto {
  id: number;
  address: string;

  @Exclude()
  number_of_bedrooms: number;

  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @Exclude()
  number_of_bathrooms: number;

  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  city: string;

  @Exclude()
  listed_date: Date;

  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listed_date;
  }

  price: number;
  image: string;

  @Exclude()
  land_size: number;

  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }

  @Exclude()
  property_type: PropertyType;

  @Expose({ name: 'propertyType' })
  propertyType() {
    return this.property_type;
  }

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  number_of_bedrooms: number;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  number_of_bathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsDate()
  @IsNotEmpty()
  listed_date: Date;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  land_size: number;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  property_type: PropertyType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  number_of_bedrooms?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  number_of_bathrooms?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  listed_date?: Date;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  land_size?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  @IsNotEmpty()
  property_type?: PropertyType;
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
