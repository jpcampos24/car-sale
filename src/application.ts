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
import {JWTAuthenticationStrategy} from './authentication/jwt';
import {MySqlDataSource} from './datasources';
import {MySequence} from './sequence';
import {EmailService} from './services/email.service';
import {SmsService} from './services/sms.service';

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

    this.component(AuthenticationComponent);
    this.dataSource(MySqlDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.bind('services.EmailService').toClass(EmailService);
    this.bind('services.SmsService').toClass(SmsService);

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
  }
}
