import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Credentialsv1, Credentialsv2, OtpLogin} from '../models';
import {UserRepository, VerificationCodeRepository} from '../repositories';
import {AuthService} from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(VerificationCodeRepository) public verificationCodeRepository: VerificationCodeRepository,
  ) {
    this.authService = new AuthService(this.userRepository, this.verificationCodeRepository);
  }

  @post('api/v1/auth/login-document', {
    responses: {
      '200': {
        description: 'Login con documento, devuelve tokens',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async loginWithDocument(
    @requestBody() credentials: Credentialsv1,
  ): Promise<{accessToken: string; refreshToken: string}> {
    const user = await this.authService.verifyCredentials(credentials);
    const userProfile = this.authService.convertToUserProfile(user);
    const refreshPayload = {id: userProfile[securityId]};
    const accessToken = this.authService.generateToken(userProfile, '1h');
    const refreshToken = this.authService.generateToken(refreshPayload, '8h');

    return {accessToken, refreshToken};
  }

  @post('api/v2/auth/login-email', {
    responses: {
      '200': {
        description: 'Login con email, devuelve tokens',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async loginWithEmail(
    @requestBody() credentials: Credentialsv2,
  ): Promise<{accessToken: string; refreshToken: string}> {
    const user = await this.authService.verifyCredentialsByEmail(credentials);
    const userProfile = this.authService.convertToUserProfile(user);
    const refreshPayload = {id: userProfile[securityId]};
    const accessToken = this.authService.generateToken(userProfile, '1h');
    const refreshToken = this.authService.generateToken(refreshPayload, '8h');

    return {accessToken, refreshToken};
  }

  @post('/api/v3/auth/login-otp', {
    responses: {
      '200': {
        description: 'Login con OTP exitoso, devuelve tokens',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
      '401': {description: 'Código OTP inválido o expirado'},
    },
  })
  async loginWithOtp(
    @requestBody() otpLoginData: OtpLogin,
  ): Promise<{accessToken: string; refreshToken: string}> {
    const user = await this.authService.verifyOtpCode(otpLoginData);
    const userProfile = this.authService.convertToUserProfile(user);
    const refreshPayload = {id: userProfile[securityId]};
    const accessToken = this.authService.generateToken(userProfile, '1h');
    const refreshToken = this.authService.generateToken(refreshPayload, '8h');

    return {accessToken, refreshToken};
  }

  @post('/api/v1/auth/token/validate', {
    responses: {
      '200': {
        description: 'El token es válido. Devuelve el id del usuario.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                isValid: {type: 'boolean'},
                userId: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async validateAccessToken(
    @inject(SecurityBindings.USER) userProfile: UserProfile,
  ): Promise<{isValid: boolean; userId: string}> {
    return {isValid: true, userId: userProfile.id};
  }
}
