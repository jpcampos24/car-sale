import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {MySqlDataSource} from '../datasources';
import {User, VerificationCode, VerificationCodeRelations} from '../models';
import {UserRepository} from './user.repository';

export class VerificationCodeRepository extends DefaultCrudRepository<
  VerificationCode,
  typeof VerificationCode.prototype.id,
  VerificationCodeRelations
> {
  public readonly user: BelongsToAccessor<User, typeof VerificationCode.prototype.id>;

  constructor(
    @inject('datasources.MySql') dataSource: MySqlDataSource,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(VerificationCode, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
