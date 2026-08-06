import { Controller, Get } from '@nestjs/common';
import { MenuService } from './menu.service';
import {ApiOkResponse, ApiResponse} from "@nestjs/swagger";
import {CourseResponse} from "../courses/dto/responses/course.response";
import {StudentMenuResponse} from "./dto/responses/student-menu.response";
import {ApiResponseDto} from "../../common/dto/responses/api.response";
import {RoundMenuResponse} from "./dto/responses/round-menu.response";

@Controller('staff-dashboard/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('students')
  @ApiOkResponse({ type: StudentMenuResponse, isArray: true })
  async getStudentsMenu(): Promise<ApiResponseDto<StudentMenuResponse[]>> {
    const data = await this.menuService.getStudentsMenu();
    return ApiResponseDto.success(data);
  }

  @Get('rounds')
  @ApiOkResponse({ type: RoundMenuResponse, isArray: true })
  async getRoundsMenu(): Promise<ApiResponseDto<RoundMenuResponse[]>> {
    const data = await this.menuService.getRoundsMenu();
    return ApiResponseDto.success(data);
  }
}
