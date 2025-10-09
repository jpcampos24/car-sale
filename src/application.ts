import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {JWTStrategy} from './authentication/jwt-strategy';
import {MySqlDataSource} from './datasources';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class MyTradingPlaceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('La variable de entorno JWT_SECRET debe estar definida.');
    }

    //this.bind(TokenServiceBindings.TOKEN_SECRET).to(process.env.JWT_SECRET);
    this.component(AuthenticationComponent);
    this.dataSource(MySqlDataSource, UserServiceBindings.DATASOURCE_NAME);

    registerAuthenticationStrategy(this, JWTStrategy);
  }
}
