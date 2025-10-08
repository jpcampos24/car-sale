import {UserService as IUserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import {EmailCredentials, User} from '../models';
import {UserRepository} from '../repositories';

export class AuthService implements IUserService<User, EmailCredentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}


  async verifyCredentials(credentials: EmailCredentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(
        `El usuario con el email ${credentials.email} no fue encontrado.`,
      );
    }

    const passwordMatched = await compare(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('La contraseña es incorrecta.');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    const userProfile = {
      [securityId]: user.id!.toString(),
      id: user.id,
      email: user.email,
    };
    return userProfile;
  }
}
