// En: src/controllers/process.controller.ts

import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get} from '@loopback/rest';
import {EmailService} from '../services/email.service';

//@authenticate('jwt')
export class ProcessController {
  constructor(
    @inject('services.EmailService')
    private emailService: EmailService,
  ) {}

  @get('/api/v1/process/restricted', {
    responses: {
      '200': {
        description: 'Respuesta exitosa del proceso restringido v1',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                version: {type: 'string'},
                message: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async restrictedProcessV1(): Promise<object> {
    return {
      version: 'v1',
      message: 'Acceso exitoso.',
    };
  }

  @get('/api/v2/process/restricted', {
    responses: {
      '200': {
        description: 'Respuesta exitosa del proceso restringido v2',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                version: {type: 'string'},
                message: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async restrictedProcessV2(): Promise<object> {
    return {
      version: 'v2',
      message: 'Acceso exitoso.',
    };
  }

  @get('/sendEmail')
  async sendTestEmail() {
    const mailOptions = {
      from: '"Tu App" <${process.env.SMTP_USER}>', // Dirección del remitente
      to: 'anonimusa415@gmail.com',
      subject: '¡Correo de prueba desde LoopBack!',
      html: '<b>Hola mundo?</b><p>Este es un correo enviado desde nuestra aplicación.</p>',
    };

    try {
      const info = await this.emailService.sendMail(mailOptions);
      console.log('URL de previsualización del correo:', info.previewURL);
      return {success: true, message: 'Correo enviado a Ethereal para previsualización. Revisa tu consola.'};
    } catch (error) {
      return {success: false, message: 'Error al enviar el correo.', error: error.message};
    }
  }
}
