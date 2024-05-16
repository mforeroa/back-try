/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MuseumEntity } from './museum.entity';
import { MuseumService } from './museum.service';
import { faker } from '@faker-js/faker';

describe('MuseumService', () => {
 let service: MuseumService;
 let repository: Repository<MuseumEntity>;
 let museumsList: MuseumEntity[];

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [...TypeOrmTestingConfig()],
    providers: [MuseumService],
  }).compile();

  service = module.get<MuseumService>(MuseumService);
  repository = module.get<Repository<MuseumEntity>>(getRepositoryToken(MuseumEntity));//para tener acceso al repositorio 
 await seedDatabase();
});

 const seedDatabase = async () => {
  repository.clear();//borra datos repo
  museumsList = []; //inicializa arreglo
  for(let i = 0; i < 5; i++){//inserta 5 museos
      const museum: MuseumEntity = await repository.save({//datos aleatorios con faker
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      address: faker.location.secondaryAddress(),
      city: faker.location.city(),
      image: faker.image.url()})
      museumsList.push(museum);
  }
}
  
 it('should be defined', () => {
   expect(service).toBeDefined();
 });

 it('findAll should return all museums', async () => {
  const museums: MuseumEntity[] = await service.findAll();
  expect(museums).not.toBeNull();
  expect(museums).toHaveLength(museumsList.length);
});

it('findOne should return a museum by id', async () => {
  const storedMuseum: MuseumEntity = museumsList[0];//primer museo de la lista
  const museum: MuseumEntity = await service.findOne(storedMuseum.id);//encontrar el museo por id
  expect(museum).not.toBeNull();//que no sea nulo
  expect(museum.name).toEqual(storedMuseum.name)//que tenga los mismos atributos
  expect(museum.description).toEqual(storedMuseum.description)
  expect(museum.address).toEqual(storedMuseum.address)
  expect(museum.city).toEqual(storedMuseum.city)
  expect(museum.image).toEqual(storedMuseum.image)
});

it('findOne should throw an exception for an invalid museum', async () => {
  await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
});

it('create should return a new museum', async () => {
  const museum: MuseumEntity = {
    id: "",
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    address: faker.location.secondaryAddress(),
    city: faker.location.city(),
    image: faker.image.url(),
    exhibitions: [],
    artworks: []
  }//se define un nuevo museo

  const newMuseum: MuseumEntity = await service.create(museum);//se crea el nuevo museo con la entidad creada
  expect(newMuseum).not.toBeNull();

  const storedMuseum: MuseumEntity = await repository.findOne({where: {id: newMuseum.id}})
  expect(storedMuseum).not.toBeNull();
  expect(storedMuseum.name).toEqual(newMuseum.name)
  expect(storedMuseum.description).toEqual(newMuseum.description)
  expect(storedMuseum.address).toEqual(newMuseum.address)
  expect(storedMuseum.city).toEqual(newMuseum.city)
  expect(storedMuseum.image).toEqual(newMuseum.image)//revisar que haya quedado bien creado
});

it('update should modify a museum', async () => {
  const museum: MuseumEntity = museumsList[0];//primer mueso en la lista
  museum.name = "New name";//actualiza datos
  museum.address = "New address";
   const updatedMuseum: MuseumEntity = await service.update(museum.id, museum);//llama al metodo update y lo actualiza
  expect(updatedMuseum).not.toBeNull();//se espera que no retorne nulo
   const storedMuseum: MuseumEntity = await repository.findOne({ where: { id: museum.id } })//se busca el museo
  expect(storedMuseum).not.toBeNull();//se revisa que exista
  expect(storedMuseum.name).toEqual(museum.name)//se revisa que se haya actualizado la info
  expect(storedMuseum.address).toEqual(museum.address)
});

it('update should throw an exception for an invalid museum', async () => {
  let museum: MuseumEntity = museumsList[0];//se toma el primer museo de la lista
  museum = {
    ...museum, name: "New name", address: "New address"
  }
  await expect(() => service.update("0", museum)).rejects.toHaveProperty("message", "The museum with the given id was not found")//que reciba excepcion si el museo que intenta actualizar no existe
});

it('delete should remove a museum', async () => {
  const museum: MuseumEntity = museumsList[0];//primer museo de la lista
  await service.delete(museum.id);//por lo que es un metodo asincronico

  const deletedMuseum: MuseumEntity = await repository.findOne({ where: { id: museum.id } })//buscar museo eliminado
  expect(deletedMuseum).toBeNull();//esperar que efectivamentre se haya eliminado
});

it('delete should throw an exception for an invalid museum', async () => {
  await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
});

});


