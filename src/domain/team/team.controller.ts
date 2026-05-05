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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { TeamMapper } from './mappers/team.mapper';

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    const team = await this.teamService.create(createTeamDto);
    return TeamMapper.toDto(team);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  async findAll() {
    const teams = await this.teamService.findAll();
    return TeamMapper.toDtoList(teams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  async findOne(@Param('id') id: string) {
    const team = await this.teamService.findOne(id);
    return TeamMapper.toDto(team);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team' })
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }

  @Post(':id/pokemon')
  @ApiOperation({ summary: 'Add a pokemon to a team' })
  @ApiResponse({ status: 400, description: 'Max 5 pokemons or duplicated.' })
  async addPokemon(@Param('id') id: string, @Body() addPokemonDto: AddPokemonDto) {
    const team = await this.teamService.addPokemon(id, addPokemonDto.pokemonIdOrName);
    return TeamMapper.toDto(team);
  }

  @Delete(':teamId/pokemon/:pokemonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a pokemon from a team' })
  removePokemon(
    @Param('teamId') teamId: string,
    @Param('pokemonId') pokemonId: string,
  ) {
    return this.teamService.removePokemon(teamId, Number(pokemonId));
  }
}

