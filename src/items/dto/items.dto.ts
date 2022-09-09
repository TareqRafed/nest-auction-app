import { IsNotEmpty, IsString } from 'class-validator';

export class ItemsDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  image: string;
}
