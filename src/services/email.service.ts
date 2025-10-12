import {BindingScope, injectable} from '@loopback/core';
import {createTransport, Transporter} from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

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

  async sendMail(options: Mail.Options) {
    return EmailService.transporter.sendMail(options);
  }
}
