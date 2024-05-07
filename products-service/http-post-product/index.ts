import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  cosmosClient,
  databaseId,
  generateRandomId,
  productsContainerId,
  stockContainerId,
} from '../cosmos-db';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const { count, ...newProduct } = req.body;

  try {
    const { resource: createdProduct } = await cosmosClient
      .database(databaseId)
      .container(productsContainerId)
      .items.create({ id: generateRandomId(), ...newProduct });

    const { resource: createdStock } = await cosmosClient
      .database(databaseId)
      .container(stockContainerId)
      .items.create({
        id: generateRandomId(),
        productId: createdProduct.id,
        count: count ?? 1,
      });

    context.res = {
      status: 201,
      body: {
        ...createdProduct,
        count: createdStock.count,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Failed to create new product:', error);

    context.res = {
      status: 500,
      body: `Failed to create new product: ${error.message}`,
    };
  }
};

export default httpTrigger;
