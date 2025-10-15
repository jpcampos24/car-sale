import {BindingScope, injectable} from '@loopback/core';
import twilio, {Twilio} from 'twilio';
import {MessageInstance} from 'twilio/lib/rest/api/v2010/account/message';

@injectable({scope: BindingScope.TRANSIENT})
export class SmsService {
  private twilioClient: Twilio;
  private twilioPhoneNumber: string;
  private twilioWhatsappNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber || !twilioWhatsappNumber) {
      throw new Error('Las credenciales de Twilio no están configuradas!');
    }

    this.twilioClient = twilio(accountSid, authToken);
    this.twilioPhoneNumber = twilioPhoneNumber;
    this.twilioWhatsappNumber = twilioWhatsappNumber;
  }

  private async _sendMessage(
    from: string,
    to: string,
    otp: string,
    channel: 'SMS' | 'WhatsApp',
  ): Promise<MessageInstance> {
    try {
      const body = `Tu código de verificación de acceso es: ${otp}`
      const message = await this.twilioClient.messages.create({
        from: from,
        to: to,
        body: body,
      });
      console.log(`Mensaje de ${channel} enviado con SID:`, message.sid);

      return message;
    } catch (error) {
      const errorAsAny = error as any;
      console.error(`Error al enviar ${channel} con Twilio:`, errorAsAny.message);

      throw error;
    }
  }

  async sendSms(to: string, otp: string): Promise<MessageInstance> {
    return this._sendMessage(this.twilioPhoneNumber, to, otp, 'SMS');
  }

  async sendWhatsapp(to: string, otp: string): Promise<MessageInstance> {
    const formattedFrom = this.twilioWhatsappNumber;
    const formattedTo = `whatsapp:${to}`;

    return this._sendMessage(formattedFrom, formattedTo, otp, 'WhatsApp');
  }
}
