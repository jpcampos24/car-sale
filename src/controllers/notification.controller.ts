import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Notification} from '../models';
import {NotificationService} from '../services';

@authenticate('jwt')
export class NotificationController {
  constructor(
    @inject('services.NotificationService') private notificationService: NotificationService,
  ) {}

  @post('/api/v1/notifications/send', {
    responses: {
      '200': {
        description: 'Notificación enviada exitosamente',
        content: {'application/json': {schema: {type: 'object'}}},
      },
      '400': {description: 'Petición incorrecta (ej. canal inválido o falta de mensaje)'},
      '404': {description: 'Usuario de destino no encontrado'},
    },
  })
  async sendNotification(
    @inject(SecurityBindings.USER) userProfile: UserProfile,
    @requestBody({
      description: 'Datos de la notificación a enviar',
      required: true,
      content: {
        'application/json': {
          schema: {'x-ts-type': Notification},
        },
      },
    })
    notification: Notification,
  ) {
    return await this.notificationService.send(notification, userProfile.id);
  }
}
