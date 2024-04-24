import { AzureFunction, Context } from '@azure/functions';
import {
  cosmosClient,
  databaseId,
  productsContainerId,
  stockContainerId,
} from '../cosmos-db';
import { FeedResponse } from '@azure/cosmos';
import { Product, Stock } from '../models/product.model';

const httpTrigger: AzureFunction = async function (
  context: Context,
): Promise<void> {
  const productsResponse: FeedResponse<Product> = await cosmosClient
    .database(databaseId)
    .container(productsContainerId)
    .items.query('SELECT * FROM products')
    .fetchAll();

  const stockResponse: FeedResponse<Stock> = await cosmosClient
    .database(databaseId)
    .container(stockContainerId)
    .items.query(`SELECT * FROM stock`)
    .fetchAll();

  const { resources: products } = productsResponse;
  const { resources: stock } = stockResponse;

  context.res = {
    status: 200,
    body: products.map((product) => {
      const foundStock = stock.find(
        (productStock) => productStock.productId === product.id,
      );
      return {
        id: product.id,
        count: foundStock?.count ?? 0,
        price: product.price,
        title: product.title,
        description: product.description,
      };
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export default httpTrigger;
