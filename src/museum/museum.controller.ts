/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { MuseumService } from './museum.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { MuseumDto } from './museum.dto';
import { MuseumEntity } from './museum.entity';
import { plainToInstance } from 'class-transformer';

@Controller('museum')//direccion principal sobre la cual se definirán las acciones del controlador
@UseInterceptors(BusinessErrorsInterceptor)
export class MuseumController {
    constructor(private readonly museumService: MuseumService) {}

    @Get()
    async findAll() {
      return await this.museumService.findAll();
    }

    @Get(':museumId')
    async findOne(@Param('museumId') museumId: string) {//parámetro que viene en la URL de la petición se extrae y se convierte en una variable de TypeScript.
      return await this.museumService.findOne(museumId);
    }

    @Post()//método HTTP para agregar un recurso a la colección de recursos
    async create(@Body() museumDto: MuseumDto) {
      const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);//convertir el Dto a Entity.
      return await this.museumService.create(museum);
    }

    @Put(':museumId')
    async update(@Param('museumId') museumId: string, @Body() museumDto: MuseumDto) {
      const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);
      return await this.museumService.update(museumId, museum);
    }

    @Delete(':museumId')
    @HttpCode(204)
    async delete(@Param('museumId') museumId: string) {
      return await this.museumService.delete(museumId);
    }
}
