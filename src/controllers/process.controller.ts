import {authenticate} from '@loopback/authentication';
import {get} from '@loopback/rest';

@authenticate('jwt')
export class ProcessController {
  constructor() { }

  @get('/api/v1/process/secure-access', {
    responses: {
      '200': {
        description: 'Acceso exitoso al proceso seguro versión 1',
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
  async handleSecureProcessV1(): Promise<object> {
    return {
      version: 'v1',
      message: 'Acceso exitoso.',
    };
  }

  @get('/api/v2/process/secure-access', {
    responses: {
      '200': {
        description: 'Acceso exitoso al proceso seguro versión 2',
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
  async handleSecureProcessV2(): Promise<object> {
    return {
      version: 'v2',
      message: 'Acceso exitoso.',
    };
  }
}
