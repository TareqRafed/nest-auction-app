import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../common/decorators';
import { AtGuard } from '../common/guards';
import { ItemsDTO } from './dto/items.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Get()
  @UseGuards(AtGuard)
  getItems() {
    return this.itemsService.getItems();
  }

  @Post()
  @UseGuards(AtGuard)
  createItem(@Body() dto: ItemsDTO, @GetUser('id') ownerId: number) {
    return this.itemsService.createItem(ownerId, dto);
  }
}
