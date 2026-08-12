import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import {UserEntity} from "../../../shared/user/entities/user.entity";
import {RoundEntity} from "../../../staff-dashboard/rounds/entities/round.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoundEntity])],
  controllers: [MenuController],
  providers: [MenuService]
})
export class WebsiteMenuModule {}
