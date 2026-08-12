import { Controller, Get } from '@nestjs/common';
import { MenuService } from './menu.service';
import {ApiOkResponse, ApiResponse} from "@nestjs/swagger";
import {RoundMenuResponse} from "./dto/responses/round-menu.response";
import {ApiResponseDto} from "../../../common/dto/responses/api.response";

@Controller('website/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}


  @Get('rounds')
  @ApiOkResponse({ type: RoundMenuResponse, isArray: true })
  async getRoundsMenu(): Promise<ApiResponseDto<RoundMenuResponse[]>> {
    const data = await this.menuService.getRoundsMenu();
    return ApiResponseDto.success(data);
  }
}
