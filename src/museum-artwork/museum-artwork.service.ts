/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkEntity } from '../artwork/artwork.entity';
import { MuseumEntity } from '../museum/museum.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class MuseumArtworkService {
    constructor(
        @InjectRepository(MuseumEntity)
        private readonly museumRepository: Repository<MuseumEntity>,
    
        @InjectRepository(ArtworkEntity)
        private readonly artworkRepository: Repository<ArtworkEntity>
    ) {}

    async addArtworkMuseum(museumId: string, artworkId: string): Promise<MuseumEntity> { //agregar la obra de arte a la lista de obras de arte del museo.
        const artwork: ArtworkEntity = await this.artworkRepository.findOne({where: {id: artworkId}});//verificar que la obra de arte con el id dado exista
        if (!artwork)
          throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND);
      
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id: museumId}, relations: ["artworks", "exhibitions"]})//verificar que el museo exista
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
    
        //agregar la obra de arte a la lista de obras de arte del museo 
        //crea una nueva lista que contiene todos los elementos de la lista museum.artworks original, junto con la nueva obra de arte (artwork) que se va a agregar.
        museum.artworks = [...museum.artworks, artwork];//...  desempaquetar todos los elementos de la lista
        return await this.museumRepository.save(museum);//actualizar
      }
    
    async findArtworkByMuseumIdArtworkId(museumId: string, artworkId: string): Promise<ArtworkEntity> {//retornar la obra de arte con el id pasado por parámetro, únicamente si esta se encuentra asociada con el museo con el id dado.
        const artwork: ArtworkEntity = await this.artworkRepository.findOne({where: {id: artworkId}});
        if (!artwork)
          throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)
       
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id: museumId}, relations: ["artworks"]});
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND)
   
        const museumArtwork: ArtworkEntity = museum.artworks.find(e => e.id === artwork.id);//busca en la lista de artwoorks de museo el artwork
   
        if (!museumArtwork)//revisa si existe
          throw new BusinessLogicException("The artwork with the given id is not associated to the museum", BusinessError.PRECONDITION_FAILED)
   
        return museumArtwork;
    }
    
    async findArtworksByMuseumId(museumId: string): Promise<ArtworkEntity[]> {// retornar la lista de obras de arte asociadas a el museo con el id dado por parámetro 
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id: museumId}, relations: ["artworks"]});//verificar que exista
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND)
       
        return museum.artworks;//retornar artworks
    }
    
    async associateArtworksMuseum(museumId: string, artworks: ArtworkEntity[]): Promise<MuseumEntity> {//reemplazar la lista de obras de arte asociadas al museo con el id dado con la lista de obras de arte dadas por parámetro
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id: museumId}, relations: ["artworks"]});
    
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND)//revisar que el museo exista
    
        for (let i = 0; i < artworks.length; i++) {//revisar que existan todos los artworks de la lista
          const artwork: ArtworkEntity = await this.artworkRepository.findOne({where: {id: artworks[i].id}});//sacar el artwork de la base de datos
          if (!artwork)
            throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)//revisar que exista
        }
    
        museum.artworks = artworks;//asignar artworks al museo
        return await this.museumRepository.save(museum);//actualizar museo
      }
    
    async deleteArtworkMuseum(museumId: string, artworkId: string){//eliminar la obra de arte con el id dado de la lista de obras de arte del museo con el id dado
        const artwork: ArtworkEntity = await this.artworkRepository.findOne({where: {id: artworkId}});//revisar que existan
        if (!artwork)
          throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)
    
        const museum: MuseumEntity = await this.museumRepository.findOne({where: {id: museumId}, relations: ["artworks"]});
        if (!museum)
          throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND)
    
        const museumArtwork: ArtworkEntity = museum.artworks.find(e => e.id === artwork.id);//revisar que la obra este entre el museo
    
        if (!museumArtwork)
            throw new BusinessLogicException("The artwork with the given id is not associated to the museum", BusinessError.PRECONDITION_FAILED)
 
        museum.artworks = museum.artworks.filter(e => e.id !== artworkId);//filtrar los artworks diferentes al creado
        await this.museumRepository.save(museum);//reasignar artworks filtrados
    }  
}
