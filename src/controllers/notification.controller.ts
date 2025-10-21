import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {Notification} from '../models';
import {UserRepository, VerificationCodeRepository} from '../repositories';
import {AuthService, NotificationService} from '../services';

export class NotificationController {
  private authService: AuthService;

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(VerificationCodeRepository) public verificationCodeRepository: VerificationCodeRepository,
    @inject('services.NotificationService') private notificationService: NotificationService,
  ) {
    this.authService = new AuthService(this.userRepository, this.verificationCodeRepository);
  }

  @post('/api/v1/notifications/dispatch', {
    responses: {
      '200': {
        description: 'Notificación enviada exitosamente',
        content: {'application/json': {schema: {type: 'object'}}},
      },
      '400': {description: 'Petición incorrecta (ej. canal inválido o falta de mensaje)'},
      '404': {description: 'Usuario de destino no encontrado'},
    },
  })
  async dispatchNotification(
    @requestBody({
      description: 'Datos de la notificación a enviar',
      required: true,
      content: {
        'application/json': {
          schema: {'x-ts-type': Notification},
        },
      },
    })
    payload: Notification,
  ) {
    const recipient = await this.authService.findUserWithOrCondition(payload.destination);

    if (!recipient.id) {
      throw new HttpErrors.NotFound('Usuario de destino no encontrado.');
    }

    return await this.notificationService.send(payload, recipient.id);
  }
}
