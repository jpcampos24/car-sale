import {BindingScope, injectable} from '@loopback/core';
import {createTransport, Transporter} from 'nodemailer';

@injectable({scope: BindingScope.TRANSIENT})
export class EmailService {
  private static transporter: Transporter;

  constructor() {
    if (!EmailService.transporter) {
      EmailService.transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendMail(destination: string, otp: string) {
    const mailOptions = {
      from: '"Tu App" <tavolopez.dev@gmail.com>',
      to: destination,
      subject: 'Código de verificación',
      html: `<b>Tu código de verificación de acceso es: ${otp}</b>`,
    };

    return EmailService.transporter.sendMail(mailOptions);
  }
}
