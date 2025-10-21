import {UserService as IUserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {sign} from 'jsonwebtoken';
import type {StringValue} from "ms";
import {Credentialsv1, Credentialsv2, OtpLogin, User} from '../models';
import {UserRepository, VerificationCodeRepository} from '../repositories';

export class AuthService implements IUserService<User, Credentialsv1> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(VerificationCodeRepository) public verificationCodeRepository: VerificationCodeRepository,
  ) { }

  async verifyCredentials(credentials: Credentialsv1): Promise<User> {
    return this._verifyUserByField({document: credentials.document}, credentials.password);
  }

  async verifyCredentialsByEmail(credentials: Credentialsv2): Promise<User> {
    return this._verifyUserByField({email: credentials.email}, credentials.password);
  }

  async verifyOtpCode(code: OtpLogin): Promise<User> {
    const {otpCode} = code;

    const otpRecord = await this.verificationCodeRepository.findOne({
      where: {code: otpCode},
    });

    if (!otpRecord) {
      throw new HttpErrors.Unauthorized('Código OTP no válido.');
    }

    const now = new Date();

    if (otpRecord.expiration < now) {
      await this._deleteVerificationCode(otpRecord.id);
      throw new HttpErrors.Unauthorized('El código OTP ha expirado.');
    }

    const userId = otpRecord.userId;
    await this._deleteVerificationCode(otpRecord.id);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.NotFound('Se ha presentado un error.');
    }

    return user
  }

  async findUserWithOrCondition(fieldValue: string): Promise<User> {
    const uniqueFields: (keyof User)[] = [
      'email',
      'phone',
    ];

    const orConditions = uniqueFields.map(field => ({[field]: fieldValue}));

    const user = await this.userRepository.findOne({
      where: {
        or: orConditions,
      },
    });

    if (!user) {
      throw new HttpErrors.NotFound('Se ha presentado un error.');
    }

    return user;
  }

  private async _deleteVerificationCode(id: number | undefined) {
    await this.verificationCodeRepository.deleteById(id);
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

    const passwordMatched = password == foundUser.password;

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

    if (!jwtSecret) {
      throw new HttpErrors.InternalServerError('No se ha configurado el secreto de JWT.');
    }

    return sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    });
  }
}
