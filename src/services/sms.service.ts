import {BindingScope, injectable} from '@loopback/core';
import twilio, {Twilio} from 'twilio';

@injectable({scope: BindingScope.TRANSIENT})
export class SmsService {
  private twilioClient: Twilio;
  private twilioPhoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Las credenciales de Twilio no están configuradas!');
    }

    this.twilioClient = twilio(accountSid, authToken);
    this.twilioPhoneNumber = twilioPhoneNumber;
  }

  async sendSms(to: string, body: string) {
    try {
      const message = await this.twilioClient.messages.create({
        from: this.twilioPhoneNumber,
        to: to,
        body: body,
      });
      console.log('Mensaje de Twilio enviado con SID:', message.sid);
      return message;
    } catch (error) {
      console.error('Error al enviar SMS con Twilio:', error);
      throw error;
    }
  }
}
