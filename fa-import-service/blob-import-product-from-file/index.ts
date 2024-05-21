import { AzureFunction, Context } from '@azure/functions';
import { ServiceBusClient } from '@azure/service-bus';
import { parse } from 'csv-parse';

const httpTrigger: AzureFunction = async function (
  context: Context,
): Promise<void> {
  const serviceBusConnectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
  const queueName = 'sb_queue-1';
  context.log('serviceBusConnectionString:', serviceBusConnectionString);

  const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
  const sender = serviceBusClient.createSender(queueName);

  try {
    const parser = parse(context.bindings.blob, {
      columns: true,
      skip_empty_lines: true,
    });

    const records = await parser.toArray();

    context.log('records:', records);

    const messages = [{ body: records }];

    await sender.sendMessages(messages);

    context.log(`Sent a batch of messages to the queue: ${queueName}`);
  } catch (error) {
    context.log(error);
  } finally {
    await sender.close();
    await serviceBusClient.close();
  }
};

export default httpTrigger;
