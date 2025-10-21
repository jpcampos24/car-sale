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

  async sendEmail(destination: string, otp: string) {
    const mailOptions = {
      from: '"Tu App" <juan.campos@ucp.edu.co>',
      to: destination,
      subject: 'Código de verificación OTP',
      html: `<b>Tu código otp de acceso es: ${otp}</b>`,
    };

    return EmailService.transporter.sendMail(mailOptions);
  }
}
