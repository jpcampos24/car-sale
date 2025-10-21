import {Model, model, property} from '@loopback/repository';

@model()
export class Credentialsv2 extends Model {
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


  constructor(data?: Partial<Credentialsv2>) {
    super(data);
  }
}

export interface Credentialsv2Relations {
  // describe navigational properties here
}

export type Credentialsv2WithRelations = Credentialsv2 & Credentialsv2Relations;
