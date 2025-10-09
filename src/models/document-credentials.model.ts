import {Model, model, property} from '@loopback/repository';

@model()
export class DocumentCredentials extends Model {
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


  constructor(data?: Partial<DocumentCredentials>) {
    super(data);
  }
}

export interface DocumentCredentialsRelations {
  // describe navigational properties here
}

export type DocumentCredentialsWithRelations = DocumentCredentials & DocumentCredentialsRelations;
