/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';//clase de TypeORM que nos permite acceder a la base de datos.
import { MuseumEntity } from './museum.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class MuseumService {
    constructor(
        @InjectRepository(MuseumEntity)
        private readonly museumRepository: Repository<MuseumEntity> //la instancia que generamos nos permitirá acceder a la tabla de la entidad en la base de datos
    ){}

    async findAll(): Promise<MuseumEntity[]> {
        return await this.museumRepository.find({ relations: ["artworks", "exhibitions"] });
    }

    async findOne(id: string): Promise<MuseumEntity> {
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id}, relations: ["artworks", "exhibitions"] } );
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
   
        return museum;
    }

    async create(museum: MuseumEntity): Promise<MuseumEntity> {
        return await this.museumRepository.save(museum);
    }

    async update(id: string, museum: MuseumEntity): Promise<MuseumEntity> {
        const persistedMuseum: MuseumEntity = await this.museumRepository.findOne({where:{id}});//verificar que museo exista
        if (!persistedMuseum)//verificar si si encontro el museo  
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
        
        return await this.museumRepository.save({...persistedMuseum, ...museum});
    }

    async delete(id: string) {
        const museum: MuseumEntity = await this.museumRepository.findOne({where:{id}});
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
      
        await this.museumRepository.remove(museum);
    }
}
