import { Injectable } from '@nestjs/common';
import { IntegrationProvider } from './integration-provider.interface';

@Injectable()
export class IntegrationsService {
  private readonly providers: IntegrationProvider[] = [];

  registerProvider(provider: IntegrationProvider): void {
    this.providers.push(provider);
  }

  getProviders(): IntegrationProvider[] {
    return this.providers;
  }
}
