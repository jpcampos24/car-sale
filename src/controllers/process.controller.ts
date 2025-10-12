import {authenticate} from '@loopback/authentication';
import {get} from '@loopback/rest';

@authenticate('jwt')
export class ProcessController {
  constructor() {}

  @get('/api/v1/process/restricted', {
    responses: {
      '200': {
        description: 'Respuesta exitosa del proceso restringido v1',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                version: {type: 'string'},
                message: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async restrictedProcessV1(): Promise<object> {
    return {
      version: 'v1',
      message: 'Acceso exitoso.',
    };
  }

  @get('/api/v2/process/restricted', {
    responses: {
      '200': {
        description: 'Respuesta exitosa del proceso restringido v2',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                version: {type: 'string'},
                message: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async restrictedProcessV2(): Promise<object> {
    return {
      version: 'v2',
      message: 'Acceso exitoso.',
    };
  }
}
