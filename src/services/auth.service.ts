import {UserService as IUserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import type {StringValue} from "ms";
import {DocumentCredentials, EmailCredentials, User} from '../models';
import {UserRepository} from '../repositories';

export class AuthService implements IUserService<User, DocumentCredentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  async verifyCredentials(credentials: DocumentCredentials): Promise<User> {
    return this._verifyUserByField({document: credentials.document}, credentials.password);
  }

  async verifyCredentialsByEmail(credentials: EmailCredentials): Promise<User> {
    return this._verifyUserByField({email: credentials.email}, credentials.password);
  }

  private async _verifyUserByField(
    whereCondition: {[key: string]: string},
    password: string,
  ): Promise<User> {

    const foundUser = await this.userRepository.findOne({
      where: whereCondition,
    });

    if (!foundUser) {
      const fieldName = Object.keys(whereCondition)[0];
      const fieldValue = Object.values(whereCondition)[0];

      throw new HttpErrors.Unauthorized(
        `El usuario con ${fieldName} '${fieldValue}' no fue encontrado.`,
      );
    }

    const passwordMatched = await compare(password, foundUser.password);

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Datos incorrectos.');
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

  generateToken(payload: object, expiresIn: StringValue): string {
    const jwtSecret = process.env.JWT_SECRET;
    console.log('--- SECRETO USADO PARA FIRMAR (en AuthController):', `"${jwtSecret}"`);
    if (!jwtSecret) {
      throw new HttpErrors.InternalServerError('No se ha configurado el secreto de JWT.');
    }

    return sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    });
  }
}
