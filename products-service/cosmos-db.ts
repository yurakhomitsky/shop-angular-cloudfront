import { CosmosClient } from '@azure/cosmos';

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

export const databaseId = 'produtcs-db';
export const productsContainerId = 'products';
export const stockContainerId = 'stock';

console.log({ key, endpoint });

export const cosmosClient = new CosmosClient({ endpoint, key });
