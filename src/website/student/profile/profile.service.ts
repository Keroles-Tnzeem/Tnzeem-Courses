import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../../shared/user/enums/user-type.enum';
import { getLang } from '../../../common/helpers/lang.helper';
import { StorageService } from '../../../shared/storage/storage.service';
import { UploadType } from '../../../shared/storage/enums/upload-type.enum';
import { UpdateStudentProfileRequest } from './dto/requests/update-student-profile.request';
import { StudentProfileResponse } from './dto/responses/student-profile.response';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly i18n: I18nService,
    private readonly storageService: StorageService,
  ) {}

  private async findStudent(studentId: number): Promise<UserEntity> {
    const lang = getLang();
    const user = await this.userRepo.findOne({
      where: { id: studentId, userType: UserTypeEnum.STUDENT },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('errors.USER_NOT_FOUND', { lang }),
      );
    }

    return user;
  }

  async getProfile(studentId: number): Promise<StudentProfileResponse> {
    const user = await this.findStudent(studentId);
    return StudentProfileResponse.from(user);
  }

  async updateProfile(
    studentId: number,
    dto: UpdateStudentProfileRequest,
    img?: Express.Multer.File,
  ): Promise<StudentProfileResponse> {
    const lang = getLang();
    const user = await this.findStudent(studentId);

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException(
          this.i18n.t('errors.EMAIL_TAKEN', { lang }),
        );
      }
      user.email = dto.email;
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.gender) user.gender = dto.gender;

    if (img) {
      const uploadResult = await this.storageService.upload(
        img,
        UploadType.IMAGE,
      );
      user.img = uploadResult.url;
    }

    const saved = await this.userRepo.save(user);
    return StudentProfileResponse.from(saved);
  }
}
