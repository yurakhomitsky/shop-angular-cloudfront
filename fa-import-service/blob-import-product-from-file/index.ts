import { AzureFunction, Context } from '@azure/functions';
import { parse } from 'csv-parse';

const httpTrigger: AzureFunction = async function (
  context: Context,
): Promise<void> {
  const records = parse(context.bindings.blob, {
    columns: true,
    skip_empty_lines: true,
  });

  context.log(context.bindings);

  records.forEach((record) => {
    context.log(`Record: ${JSON.stringify(record)}`);
  });
};

export default httpTrigger;
