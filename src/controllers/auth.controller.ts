import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {DocumentCredentials, EmailCredentials} from '../models';
import {UserRepository} from '../repositories';
import {AuthService} from '../services/auth.service';

export class AuthController {

  private authService: AuthService;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    this.authService = new AuthService(this.userRepository);
  }

  @post('api/v1/auth/login', {
    responses: {
      '200': {
        description: 'Access Token y Refresh Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tokenJWT: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody() credentials: DocumentCredentials,
  ): Promise<{tokenJWT: string, refreshToken: string}> {
    const user = await this.authService.verifyCredentials(credentials);
    const userProfile = this.authService.convertToUserProfile(user);
    const refreshTokenPayload = { id: userProfile[securityId] };
    const tokenJWT = this.authService.generateToken(userProfile, '1h');
    const refreshToken = this.authService.generateToken(refreshTokenPayload, '8h');

    return {tokenJWT, refreshToken};
  }

  @post('api/v2/auth/login', {
    responses: {
      '200': {
        description: 'Access Token y Refresh Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tokenJWT: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async loginv2(
    @requestBody() credentials: EmailCredentials,
  ): Promise<{tokenJWT: string, refreshToken: string}> {
    const user = await this.authService.verifyCredentialsByEmail(credentials);
    const userProfile = this.authService.convertToUserProfile(user);
    const refreshTokenPayload = { id: userProfile[securityId] };
    const tokenJWT = this.authService.generateToken(userProfile, '1h');
    const refreshToken = this.authService.generateToken(refreshTokenPayload, '8h');

    return {tokenJWT, refreshToken};
  }

   @post('/api/v1/auth/validate', {
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
  async validateToken(
    @inject(SecurityBindings.USER) userProfile: UserProfile,
  ): Promise<{isValid: boolean; userId: string}> {
    return {isValid: true, userId: userProfile.id};
  }
}

