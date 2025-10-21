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
import {Product} from '../models';
import {ProductRepository} from '../repositories';

@authenticate('jwt')
export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepo: ProductRepository,
  ) { }

  @post('/api/v1/products')
  @response(200, {
    description: 'Crear nuevo producto',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async handleCreateProduct(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProduct',
            exclude: ['id'],
          }),
        },
      },
    })
    newProduct: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.productRepo.create(newProduct);
  }

  @get('/products/count')
  @response(200, {
    description: 'Cantidad total de productos',
    content: {'application/json': {schema: CountSchema}},
  })
  async getProductCount(
    @param.where(Product) where?: Where<Product>,
  ): Promise<Count> {
    return this.productRepo.count(where);
  }

  @get('/api/v1/products')
  @response(200, {
    description: 'Lista de productos',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async getProductList(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepo.find(filter);
  }

  @patch('/products')
  @response(200, {
    description: 'Actualización masiva de productos',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateMultipleProducts(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    updateData: Product,
    @param.where(Product) where?: Where<Product>,
  ): Promise<Count> {
    return this.productRepo.updateAll(updateData, where);
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Detalle de producto por ID',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async getProductById(
    @param.path.number('id') id: number,
    @param.filter(Product, {exclude: 'where'}) filter?: FilterExcludingWhere<Product>,
  ): Promise<Product> {
    return this.productRepo.findById(id, filter);
  }

  @patch('/products/{id}')
  @response(204, {
    description: 'Actualización parcial de producto por ID',
  })
  async updateProductById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    updateData: Product,
  ): Promise<void> {
    await this.productRepo.updateById(id, updateData);
  }

  @put('/products/{id}')
  @response(204, {
    description: 'Reemplazo completo de producto por ID',
  })
  async replaceProductById(
    @param.path.number('id') id: number,
    @requestBody() productData: Product,
  ): Promise<void> {
    await this.productRepo.replaceById(id, productData);
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Eliminación de producto por ID',
  })
  async deleteProductById(
    @param.path.number('id') id: number,
  ): Promise<void> {
    await this.productRepo.deleteById(id);
  }
}
