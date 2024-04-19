import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { productsMock } from '../products.mock';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const productId = req.params.productId;
  context.res = {
    status: 200,
    body: productsMock.find((product) => product.id === productId),
  };
};

export default httpTrigger;
