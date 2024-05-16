/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArtworkEntity } from '../artwork/artwork.entity';
import { ExhibitionEntity } from '../exhibition/exhibition.entity';

@Entity()//indica que la clase es una entidad que será mapeada a una tabla en la base de datos
export class MuseumEntity {
    @PrimaryGeneratedColumn('uuid')// indica que el atributo id es la llave primaria de la clase. Valor de esta llave se genera automáticamente. A esta anotación se le envía por parámetro el tipo de ID que se usará para la entidad, que en este caso será ‘uuid'.
    id: string;
   
    @Column()//indica que el atributo de la clase se mapea a una columna de la tabla en la base de datos
    name: string;
    
    @Column()
    description: string;
    
    @Column()
    address: string;
    
    @Column()
    city: string;
   
    @Column()
    image: string;

    @OneToMany(() => ExhibitionEntity, exhibition => exhibition.museum)
    exhibitions: ExhibitionEntity[];
 
    @OneToMany(() => ArtworkEntity, artwork => artwork.museum)
    artworks: ArtworkEntity[];
}
