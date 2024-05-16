/* eslint-disable prettier/prettier */
import {IsNotEmpty, IsString, IsUrl} from 'class-validator';
export class MuseumDto {

 @IsString()
 @IsNotEmpty()
 readonly name: string;//el atributo no se puede modificar después de haberse inicializado por primera vez.
 
 @IsString()//validar que sea una cadena de caracteres
 @IsNotEmpty()//validar que no esté vacío
 readonly description: string;
 
 @IsString()
 @IsNotEmpty()
 readonly address: string;
 
 @IsString()
 @IsNotEmpty()
 readonly city: string;
 
 @IsUrl()//validar que sea una URL.
 @IsNotEmpty()
 readonly image: string;
}
