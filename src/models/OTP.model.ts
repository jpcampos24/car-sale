import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from './user.model';

@model()
export class VerificationCode extends Entity {
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
  code: string;

  @property({
    type: 'date',
    required: true,
  })
  expiration: Date;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<VerificationCode>) {
    super(data);
  }
}

export interface VerificationCodeRelations {
  // describe navigational properties here
}

export type VerificationCodeWithRelations = VerificationCode & VerificationCodeRelations;
