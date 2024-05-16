/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MuseumArtworkService } from './museum-artwork.service';
import { ArtworkEntity } from '../artwork/artwork.entity';
import { MuseumEntity } from '../museum/museum.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('MuseumArtworkService', () => {
  let service: MuseumArtworkService;
  let museumRepository: Repository<MuseumEntity>;//repo dueña
  let artworkRepository: Repository<ArtworkEntity>;//repo atributo asociado
  let museum: MuseumEntity;//entidad dueño
  let artworksList : ArtworkEntity[];//lista atributos

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MuseumArtworkService],
    }).compile();

    service = module.get<MuseumArtworkService>(MuseumArtworkService);
    museumRepository = module.get<Repository<MuseumEntity>>(getRepositoryToken(MuseumEntity));//para tener acceso al repositorios
    artworkRepository = module.get<Repository<ArtworkEntity>>(getRepositoryToken(ArtworkEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    artworkRepository.clear();//limpiar bases de datos
    museumRepository.clear();

    artworksList = [];
    for(let i = 0; i < 5; i++){
        const artwork: ArtworkEntity = await artworkRepository.save({
          name: faker.company.name(), 
          year: parseInt(faker.string.numeric()),
          description: faker.lorem.sentence(),
          type: "Painting",
          mainImage: faker.image.url()
        })
        artworksList.push(artwork);
    }//generar artworks

    museum = await museumRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      address: faker.location.secondaryAddress(), 
      city: faker.location.city(), 
      image: faker.image.url(),
      artworks: artworksList
    })//crear museo de la asociacion
  }


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //probar metodo add
  it('addArtworkMuseum should add an artwork to a museum', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url()
    });

    const newMuseum: MuseumEntity = await museumRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      address: faker.location.secondaryAddress(), 
      city: faker.location.city(), 
      image: faker.image.url()
    })

    const result: MuseumEntity = await service.addArtworkMuseum(newMuseum.id, newArtwork.id);//usar el servicio
    
    expect(result.artworks.length).toBe(1);//revisar que se haya añadido
    expect(result.artworks[0]).not.toBeNull();
    expect(result.artworks[0].name).toBe(newArtwork.name)
    expect(result.artworks[0].year).toBe(newArtwork.year)
    expect(result.artworks[0].description).toBe(newArtwork.description)
    expect(result.artworks[0].type).toBe(newArtwork.type)
    expect(result.artworks[0].mainImage).toBe(newArtwork.mainImage)
  });

  it('addArtworkMuseum should thrown exception for an invalid artwork', async () => {
    const newMuseum: MuseumEntity = await museumRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      address: faker.location.secondaryAddress(), 
      city: faker.location.city(), 
      image: faker.image.url()
    })

    await expect(() => service.addArtworkMuseum(newMuseum.id, "0")).rejects.toHaveProperty("message", "The artwork with the given id was not found");
  });

  it('addArtworkMuseum should throw an exception for an invalid museum', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url()
    });

    await expect(() => service.addArtworkMuseum("0", newArtwork.id)).rejects.toHaveProperty("message", "The museum with the given id was not found");
  });

  //Probar encontrar artwork en museo
  it('findArtworkByMuseumIdArtworkId should return artwork by museum', async () => {
    const artwork: ArtworkEntity = artworksList[0];
    const storedArtwork: ArtworkEntity = await service.findArtworkByMuseumIdArtworkId(museum.id, artwork.id, )
    expect(storedArtwork).not.toBeNull();
    expect(storedArtwork.name).toBe(artwork.name);
    expect(storedArtwork.year).toBe(artwork.year);
    expect(storedArtwork.description).toBe(artwork.description);
    expect(storedArtwork.type).toBe(artwork.type);
    expect(storedArtwork.mainImage).toBe(artwork.mainImage);
  });

  it('findArtworkByMuseumIdArtworkId should throw an exception for an invalid artwork', async () => {
    await expect(()=> service.findArtworkByMuseumIdArtworkId(museum.id, "0")).rejects.toHaveProperty("message", "The artwork with the given id was not found"); 
  });

  it('findArtworkByMuseumIdArtworkId should throw an exception for an invalid museum', async () => {
    const artwork: ArtworkEntity = artworksList[0]; 
    await expect(()=> service.findArtworkByMuseumIdArtworkId("0", artwork.id)).rejects.toHaveProperty("message", "The museum with the given id was not found"); 
  });

  it('findArtworkByMuseumIdArtworkId should throw an exception for an artwork not associated to the museum', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url()
    });

    await expect(()=> service.findArtworkByMuseumIdArtworkId(museum.id, newArtwork.id)).rejects.toHaveProperty("message", "The artwork with the given id is not associated to the museum"); 
  });

  //probar encontrar obras por museo
  it('findArtworksByMuseumId should return artworks by museum', async ()=>{
    const artworks: ArtworkEntity[] = await service.findArtworksByMuseumId(museum.id);
    expect(artworks.length).toBe(5)
  });

  it('findArtworksByMuseumId should throw an exception for an invalid museum', async () => {
    await expect(()=> service.findArtworksByMuseumId("0")).rejects.toHaveProperty("message", "The museum with the given id was not found"); 
  });
  
  //probar asociar lista de artworks a un museo
  it('associateArtworksMuseum should update artworks list for a museum', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url() 
    });

    const updatedMuseum: MuseumEntity = await service.associateArtworksMuseum(museum.id, [newArtwork]);
    expect(updatedMuseum.artworks.length).toBe(1);//nueva lista solo tiene 1 artwork

    expect(updatedMuseum.artworks[0].name).toBe(newArtwork.name);
    expect(updatedMuseum.artworks[0].year).toBe(newArtwork.year);
    expect(updatedMuseum.artworks[0].description).toBe(newArtwork.description);
    expect(updatedMuseum.artworks[0].type).toBe(newArtwork.type);
    expect(updatedMuseum.artworks[0].mainImage).toBe(newArtwork.mainImage);
  });

  it('associateArtworksMuseum should throw an exception for an invalid museum', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url()
    });

    await expect(()=> service.associateArtworksMuseum("0", [newArtwork])).rejects.toHaveProperty("message", "The museum with the given id was not found"); 
  });

  it('associateArtworksMuseum should throw an exception for an invalid artwork', async () => {
    const newArtwork: ArtworkEntity = artworksList[0];
    newArtwork.id = "0";

    await expect(()=> service.associateArtworksMuseum(museum.id, [newArtwork])).rejects.toHaveProperty("message", "The artwork with the given id was not found"); 
  });

  //probar eliminar obra de arte de un museo
  it('deleteArtworkToMuseum should remove an artwork from a museum', async () => {
    const artwork: ArtworkEntity = artworksList[0];
    
    await service.deleteArtworkMuseum(museum.id, artwork.id);//probar servicio

    // const storedMuseum: MuseumEntity = await museumRepository.findOne({where: {id: museum.id}, relations: ["artworks"]});
    // const deletedArtwork: ArtworkEntity = storedMuseum.artworks.find(a => a.id === artwork.id);

    await expect(()=> service.findArtworkByMuseumIdArtworkId(museum.id, artwork.id)).rejects.toHaveProperty("message", "The artwork with the given id is not associated to the museum"); 
    //expect(deletedArtwork).toBeUndefined();

  });

  it('deleteArtworkToMuseum should thrown an exception for an invalid artwork', async () => {
    await expect(()=> service.deleteArtworkMuseum(museum.id, "0")).rejects.toHaveProperty("message", "The artwork with the given id was not found"); 
  });

  it('deleteArtworkToMuseum should thrown an exception for an invalid museum', async () => {
    const artwork: ArtworkEntity = artworksList[0];
    await expect(()=> service.deleteArtworkMuseum("0", artwork.id)).rejects.toHaveProperty("message", "The museum with the given id was not found"); 
  });

  it('deleteArtworkToMuseum should thrown an exception for an non asocciated artwork', async () => {
    const newArtwork: ArtworkEntity = await artworkRepository.save({
      name: faker.company.name(), 
      year: parseInt(faker.string.numeric()),
      description: faker.lorem.sentence(),
      type: "Painting",
      mainImage: faker.image.url()
    });

    await expect(()=> service.deleteArtworkMuseum(museum.id, newArtwork.id)).rejects.toHaveProperty("message", "The artwork with the given id is not associated to the museum"); 
  }); 

});
