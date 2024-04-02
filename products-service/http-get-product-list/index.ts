import { AzureFunction, Context } from '@azure/functions';
import { productsMock } from '../products.mock';

const httpTrigger: AzureFunction = async function (
  context: Context,
): Promise<void> {
  context.res = {
    status: 200,
    body: productsMock,
  };
};

export default httpTrigger;
