import {Model, model, property} from '@loopback/repository';

@model()
export class Notification extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: ['email', 'sms', 'whatsapp'],
    },
  })
  channel: 'email' | 'sms' | 'whatsapp';

  @property({
    type: 'string',
    required: true,
  })
  destination: string;


  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // describe navigational properties here
}

export type NotificationWithRelations = Notification & NotificationRelations;
