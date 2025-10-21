import {Model, model, property} from '@loopback/repository';

@model()
export class OtpLogin extends Model {
  @property({
    type: 'string',
    required: true,
  })
  otpCode: string;


  constructor(data?: Partial<OtpLogin>) {
    super(data);
  }
}

export interface OtpLoginRelations {
  // describe navigational properties here
}

export type OtpLoginWithRelations = OtpLogin & OtpLoginRelations;
