import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {MySqlDataSource} from '../datasources';
import {User, UserRelations, VerificationCode} from '../models';
import {VerificationCodeRepository} from './OTP.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly verificationCodes: HasManyRepositoryFactory<VerificationCode, typeof User.prototype.id>;

  constructor(
    @inject('datasources.MySql') dataSource: MySqlDataSource,
    @repository.getter('VerificationCodeRepository') protected verificationCodeRepositoryGetter: Getter<VerificationCodeRepository>,
  ) {
    super(User, dataSource);
    this.verificationCodes = this.createHasManyRepositoryFactoryFor('verificationCodes', verificationCodeRepositoryGetter,);
    this.registerInclusionResolver('verificationCodes', this.verificationCodes.inclusionResolver);
  }
}
