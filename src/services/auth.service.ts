import {UserService as IUserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import type {StringValue} from "ms";
import {DocumentCredentials, User} from '../models';
import {UserRepository} from '../repositories';

export class AuthService implements IUserService<User, DocumentCredentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}


  async verifyCredentials(credentials: DocumentCredentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {document: credentials.document},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(
        `El usuario con el documento ${credentials.document} no fue encontrado.`,
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

  generateToken(payload: object, expiresIn: StringValue): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new HttpErrors.InternalServerError('No se ha configurado el secreto de JWT.');
    }

    return sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    });
  }
}
