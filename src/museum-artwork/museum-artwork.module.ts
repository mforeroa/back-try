/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MuseumArtworkService } from './museum-artwork.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from '../artwork/artwork.entity';
import { MuseumEntity } from '../museum/museum.entity';
import { MuseumArtworkController } from './museum-artwork.controller';

@Module({
  providers: [MuseumArtworkService],
  imports: [TypeOrmModule.forFeature([MuseumEntity, ArtworkEntity])],
  controllers: [MuseumArtworkController],
})
export class MuseumArtworkModule {}
