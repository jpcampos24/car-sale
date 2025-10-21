import {AuthenticationStrategy} from '@loopback/authentication';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {verify} from 'jsonwebtoken';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor() { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.getTokenFromRequest(request);
    const userProfile = await this.decodeAndValidateToken(token);
    return userProfile;
  }

  private getTokenFromRequest(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpErrors.Unauthorized(`Falta el encabezado 'Authorization'.`);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new HttpErrors.Unauthorized(`El encabezado 'Authorization' debe comenzar con 'Bearer '.`);
    }

    const [scheme, token] = authHeader.split(' ');
    if (!token) {
      throw new HttpErrors.Unauthorized(`Token JWT no encontrado en el encabezado 'Authorization'.`);
    }

    return token;
  }

  private async decodeAndValidateToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Token JWT no proporcionado.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('La variable de entorno JWT_SECRET no está definida.');
    }

    try {
      const decoded = verify(token, secret);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new HttpErrors.Unauthorized('El contenido del token JWT no es válido.');
      }

      const userProfile: UserProfile = {
        [securityId]: (decoded as any).id.toString(),
        ...decoded,
      };

      return userProfile;
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Token JWT inválido: ${error.message}`);
    }
  }
}
