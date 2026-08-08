import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../../../shared/user/entities/user.entity";
import {StaffOrdersModule} from "../../../staff-dashboard/orders/orders.module";
import {ContactUsController} from "./contact-us.controller";
import {ContactUsService} from "./contact-us.service";


@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), StaffOrdersModule],
    controllers: [ContactUsController],
    providers: [ContactUsService],
})
export class ContactUsModule {}