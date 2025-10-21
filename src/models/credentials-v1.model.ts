import {Model, model, property} from '@loopback/repository';

@model()
export class Credentialsv1 extends Model {
  @property({
    type: 'string',
    required: true,
  })
  document: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;


  constructor(data?: Partial<Credentialsv1>) {
    super(data);
  }
}

export interface Credentialsv1Relations {
  // describe navigational properties here
}

export type Credentialsv1WithRelations = Credentialsv1 & Credentialsv1Relations;
