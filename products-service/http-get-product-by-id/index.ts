import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { FeedResponse } from '@azure/cosmos';
import { Product, Stock } from '../models/product.model';
import {
  cosmosClient,
  databaseId,
  productsContainerId,
  stockContainerId,
} from '../cosmos-db';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const productId = req.params.productId;

  const productsResponse: FeedResponse<Product> = await cosmosClient
    .database(databaseId)
    .container(productsContainerId)
    .items.query(`SELECT * FROM products p WHERE p.id='${productId}'`)
    .fetchAll();

  const stockResponse: FeedResponse<Stock> = await cosmosClient
    .database(databaseId)
    .container(stockContainerId)
    .items.query(`SELECT * FROM stock s WHERE s.productId='${productId}'`)
    .fetchAll();

  const { resources: stock } = stockResponse;

  const { resources: products } = productsResponse;

  const product = products[0] ?? null;

  if (!product) {
    context.res = {
      status: 404,
      body: `Product with ID ${productId} not found`,
    };
  } else {
    context.res = {
      status: 200,
      body: { ...products[0], count: stock[0]?.count ?? 0 },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export default httpTrigger;
