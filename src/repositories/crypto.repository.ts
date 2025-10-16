import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MySqlDataSource} from '../datasources';
import {Crypto, CryptoRelations} from '../models';

export class CryptoRepository extends DefaultCrudRepository<
  Crypto,
  typeof Crypto.prototype.id,
  CryptoRelations
> {
  constructor(
    @inject('datasources.MySql') dataSource: MySqlDataSource,
  ) {
    super(Crypto, dataSource);
  }
}
