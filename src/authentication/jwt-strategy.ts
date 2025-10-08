import {AuthenticationStrategy} from '@loopback/authentication';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {verify} from 'jsonwebtoken';

export class JWTStrategy implements AuthenticationStrategy {
  // El nombre 'jwt' es crucial. El decorador @authenticate('jwt') buscará
  // una estrategia registrada con este nombre.
  name: string = 'jwt';

  constructor() {}

  /**
   * El método principal que LoopBack invocará cuando una ruta esté protegida.
   * @param request La petición HTTP entrante.
   * @returns Un perfil de usuario si la autenticación es exitosa, o undefined.
   */
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractCredentials(request);
    const userProfile = await this.verifyToken(token);
    return userProfile;
  }

  /**
   * Extrae el token del encabezado 'Authorization'.
   * @param request
   */
  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`El encabezado 'Authorization' no está presente.`);
    }

    // El formato esperado es 'Bearer <token>'
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer ')) {
      throw new HttpErrors.Unauthorized(
        `El formato del encabezado 'Authorization' no es 'Bearer <token>'.`,
      );
    }

    // Extrae y devuelve la parte del token
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `El encabezado 'Authorization' tiene un formato incorrecto.`,
      );
    }
    return parts[1];
  }

  /**
   * Verifica la firma y la validez del token JWT.
   * @param token El token JWT a verificar.
   */
  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('No se proporcionó un token JWT.');
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('La variable de entorno JWT_SECRET no está definida.');
      }

      const decodedToken = verify(token, secret);

      if (typeof decodedToken !== 'object' || decodedToken === null) {
        throw new HttpErrors.Unauthorized('El payload del token JWT no es un objeto válido.');
      }

      const userProfile = {
        [securityId]: (decodedToken as any).id.toString(),
        ...decodedToken,
      } as UserProfile;

      return userProfile;

    } catch (error) {
      throw new HttpErrors.Unauthorized(`El token JWT es inválido: ${error.message}`);
    }
  }
}
