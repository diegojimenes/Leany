import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { AddAddressDto } from './dto/add-address.dto';

@ApiTags('Trainers')
@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trainer' })
  @ApiResponse({ status: 201, description: 'Trainer created successfully.' })
  create(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainerService.create(createTrainerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainers' })
  findAll() {
    return this.trainerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trainer by ID' })
  findOne(@Param('id') id: string) {
    return this.trainerService.findOne(id);
  }

  @Post(':id/address')
  @ApiOperation({ summary: 'Add an address to a trainer via CEP' })
  addAddress(@Param('id') id: string, @Body() addAddressDto: AddAddressDto) {
    return this.trainerService.addAddress(id, addAddressDto.cep);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a trainer' })
  @ApiResponse({ status: 204, description: 'Trainer deleted successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict if trainer has active teams.',
  })
  remove(@Param('id') id: string) {
    return this.trainerService.remove(id);
  }
}
