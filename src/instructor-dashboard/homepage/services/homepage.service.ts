import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { TrainerStatistics } from '../entities/trainer-statistics.entity';
import { TrainerStatisticsResponse } from '../dto/responses/trainer-statistics.response';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { TrainerInfoEntity } from '../../../shared/user/entities/trainer-info.entity';
import { TrainerProfileResponse } from '../dto/responses/trainer-profile.response';
import { UpdateTrainerProfileRequest } from '../dto/requests/update-trainer-profile.request';
import { StorageService } from '../../../shared/storage/storage.service';
import { UploadType } from '../../../shared/storage/enums/upload-type.enum';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(TrainerStatistics)
    private readonly statisticsRepository: Repository<TrainerStatistics>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TrainerInfoEntity)
    private readonly trainerInfoRepository: Repository<TrainerInfoEntity>,
    private readonly i18n: I18nService,
    private readonly storageService: StorageService,
  ) {}

  async getTrainerStatistics(trainerId: number): Promise<TrainerStatisticsResponse> {
    const stats = await this.statisticsRepository.findOne({
      where: { trainerId },
    });

    if (!stats) {
      return {
        coursesCount: 0,
        roundsCount: 0,
        ordersCount: 0,
        sessionsCount: 0,
      };
    }

    return {
      coursesCount:  Number(stats.coursesCount)  || 0,
      roundsCount:   Number(stats.roundsCount)   || 0,
      ordersCount:   Number(stats.ordersCount)   || 0,
      sessionsCount: Number(stats.sessionsCount) || 0,
    };
  }

  async getTrainerProfile(trainerId: number): Promise<TrainerProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: trainerId },
      relations: ['trainerInfo'],
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('common.not_found'));
    }

    return TrainerProfileResponse.from(user);
  }

  async updateTrainerProfile(
    trainerId: number,
    data: UpdateTrainerProfileRequest,
    file?: Express.Multer.File,
  ): Promise<TrainerProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: trainerId },
      relations: ['trainerInfo'],
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('common.not_found'));
    }

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email) user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.gender) user.gender = data.gender;
    if (data.password) user.password = await bcrypt.hash(data.password, 10);

    if (file) {
      const uploadResult = await this.storageService.upload(file, UploadType.IMAGE);
      user.img = uploadResult.url;
    }

    await this.userRepository.save(user);

    if (data.age !== undefined || data.numExperience !== undefined || data.experience !== undefined) {
      let trainerInfo = user.trainerInfo;
      if (!trainerInfo) {
        trainerInfo = new TrainerInfoEntity();
        trainerInfo.userId = user.id;
      }
      
      if (data.age !== undefined) trainerInfo.age = data.age;
      if (data.numExperience !== undefined) trainerInfo.numExperience = data.numExperience;
      if (data.experience !== undefined) trainerInfo.experience = data.experience;
      
      await this.trainerInfoRepository.save(trainerInfo);
      user.trainerInfo = trainerInfo;
    }

    return TrainerProfileResponse.from(user);
  }
}
