import {Entity, model, property} from '@loopback/repository';

@model()
export class Crypto extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  symbol: string;


  constructor(data?: Partial<Crypto>) {
    super(data);
  }
}

export interface CryptoRelations {
  // describe navigational properties here
}

export type CryptoWithRelations = Crypto & CryptoRelations;
