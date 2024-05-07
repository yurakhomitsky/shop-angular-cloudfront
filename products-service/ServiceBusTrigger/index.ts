import { AzureFunction, Context } from '@azure/functions';
import {
  cosmosClient,
  databaseId,
  generateRandomId,
  productsContainerId,
  stockContainerId,
} from '../cosmos-db';

const serviceBusQueueTrigger: AzureFunction = async function (
  context: Context,
  mySbMsg: unknown,
): Promise<void> {
  context.log(
    'Node.js ServiceBus queue trigger function processed message',
    context.bindings.mySbMsg,
  );
  context.log('mySbMsg', mySbMsg);
  for (const product of context.bindings.mySbMsg) {
    try {
      const { resource: createdProduct } = await cosmosClient
        .database(databaseId)
        .container(productsContainerId)
        .items.create({ id: generateRandomId(), ...product });

      const { resource: createdStock } = await cosmosClient
        .database(databaseId)
        .container(stockContainerId)
        .items.create({
          id: generateRandomId(),
          productId: createdProduct.id,
          count: 1,
        });

      context.log('Created new product:', createdProduct);
      context.log('Created new stock:', createdStock);
    } catch (error) {
      context.log('Failed to create new product:', error);
    }
  }
};

export default serviceBusQueueTrigger;
