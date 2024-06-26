import { Config } from './config.interface';

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product:
      'https://api-management-product-service-007.azure-api.net/fa-products-service-ne-001/',
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import:
      'https://products-import-api-777.azure-api.net/fa-import-service-ne-777/',
    bff: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    cart: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
  },
  apiEndpointsEnabled: {
    product: true,
    order: false,
    import: false,
    bff: false,
    cart: false,
  },
};
