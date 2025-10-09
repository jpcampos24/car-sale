import {Model, model, property} from '@loopback/repository';

@model()
export class EmailCredentials extends Model {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;


  constructor(data?: Partial<EmailCredentials>) {
    super(data);
  }
}

export interface EmailCredentialsRelations {
  // describe navigational properties here
}

export type EmailCredentialsWithRelations = EmailCredentials & EmailCredentialsRelations;
