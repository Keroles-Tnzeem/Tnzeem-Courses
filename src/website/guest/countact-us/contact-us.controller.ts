import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Post, UseInterceptors} from "@nestjs/common";
import {OrderResponse} from "../../../staff-dashboard/orders/dto/responses/order.response";
import {CreateGuestOrderRequest} from "./dto/requests/create-guest-order.request";
import {ApiResponseDto} from "../../../common/dto/responses/api.response";
import {ContactUsService} from "./contact-us.service";
import { NoFilesInterceptor } from "@nestjs/platform-express";

@ApiTags('Website - Contact Us')
@Controller('website/contact-us')
export class ContactUsController {
    constructor(private readonly contactUsService: ContactUsService) {}

    @Post()
    @ApiOkResponse({ type: OrderResponse })
    @UseInterceptors(NoFilesInterceptor())
    async createOrder(@Body() dto: CreateGuestOrderRequest): Promise<ApiResponseDto<OrderResponse>> {
        const order = await this.contactUsService.createGuestOrder(dto);
        return ApiResponseDto.success(order);
    }
}