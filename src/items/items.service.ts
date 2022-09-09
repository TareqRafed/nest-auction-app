import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemsDTO } from './dto/items.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async getItems() {
    const items = await this.prisma.item.findMany();
    return items;
  }

  async createItem(ownerId: number, item: ItemsDTO) {
    const newItem = await this.prisma.item.create({
      data: {
        ownerId: ownerId,
        name: item.name,
        description: item.description,
        image: item.image,
      },
    });

    return newItem;
  }
}
