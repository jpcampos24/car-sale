import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Crypto} from '../models';
import {CryptoRepository} from '../repositories';

@authenticate('jwt')
export class CryptoController {
  constructor(
    @repository(CryptoRepository)
    public cryptoRepository : CryptoRepository,
  ) {}

  @post('/api/v1/cryptos')
  @response(200, {
    description: 'Crypto model instance',
    content: {'application/json': {schema: getModelSchemaRef(Crypto)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Crypto, {
            title: 'NewCrypto',
            exclude: ['id'],
          }),
        },
      },
    })
    crypto: Omit<Crypto, 'id'>,
  ): Promise<Crypto> {
    return this.cryptoRepository.create(crypto);
  }

  @get('/cryptos/count')
  @response(200, {
    description: 'Crypto model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Crypto) where?: Where<Crypto>,
  ): Promise<Count> {
    return this.cryptoRepository.count(where);
  }

  @get('/api/v1/cryptos')
  @response(200, {
    description: 'Array of Crypto model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Crypto, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Crypto) filter?: Filter<Crypto>,
  ): Promise<Crypto[]> {
    return this.cryptoRepository.find(filter);
  }

  @patch('/cryptos')
  @response(200, {
    description: 'Crypto PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Crypto, {partial: true}),
        },
      },
    })
    crypto: Crypto,
    @param.where(Crypto) where?: Where<Crypto>,
  ): Promise<Count> {
    return this.cryptoRepository.updateAll(crypto, where);
  }

  @get('/cryptos/{id}')
  @response(200, {
    description: 'Crypto model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Crypto, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Crypto, {exclude: 'where'}) filter?: FilterExcludingWhere<Crypto>
  ): Promise<Crypto> {
    return this.cryptoRepository.findById(id, filter);
  }

  @patch('/cryptos/{id}')
  @response(204, {
    description: 'Crypto PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Crypto, {partial: true}),
        },
      },
    })
    crypto: Crypto,
  ): Promise<void> {
    await this.cryptoRepository.updateById(id, crypto);
  }

  @put('/cryptos/{id}')
  @response(204, {
    description: 'Crypto PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() crypto: Crypto,
  ): Promise<void> {
    await this.cryptoRepository.replaceById(id, crypto);
  }

  @del('/cryptos/{id}')
  @response(204, {
    description: 'Crypto DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.cryptoRepository.deleteById(id);
  }
}
