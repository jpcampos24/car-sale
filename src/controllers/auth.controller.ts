import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {securityId} from '@loopback/security';
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
}
