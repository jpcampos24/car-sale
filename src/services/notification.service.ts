// En: src/services/notification.service.ts

import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Notification} from '../models';
import {UserRepository, VerificationCodeRepository} from '../repositories';
import {EmailService} from './email.service';
import {SmsService} from './sms.service';

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationService {
  constructor(
    @inject('services.EmailService') private emailService: EmailService,
    @inject('services.SmsService') private smsService: SmsService,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(VerificationCodeRepository)
    private verificationCodeRepository: VerificationCodeRepository,
  ) { }

  async send(notification: Notification, userId: number): Promise<{success: boolean; message: string}> {
    const verificationCode = this.generateVerificationCode();
    await this.saveVerificationCode(userId, verificationCode)

    switch (notification.channel) {
      case 'email':
        await this.emailService.sendEmail(notification.destination, verificationCode);
        break;
      case 'sms':
        await this.smsService.sendSms(notification.destination, verificationCode);
        break;
      case 'whatsapp':
        await this.smsService.sendWhatsapp(notification.destination, verificationCode);
        break;
      default:
        throw new HttpErrors.BadRequest('Canal de notificación no válido.');
    }

    return {
      success: true,
      message: `Notificación enviada a ${notification.destination}`,
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveVerificationCode(userId: number, code: string) {
    const user = await this.userRepository.findOne({where: {id: userId}});

    if (!user) {
      throw new HttpErrors.NotFound(`Se ha presentado un error por favor intenta de nuevo.`);
    }

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    await this.verificationCodeRepository.deleteAll({userId: user.id});
    await this.verificationCodeRepository.create({
      code: code,
      expiration: expirationTime,
      userId: user.id,
    });
  }
}
