const iotHubConnectionString = process.env.IOT_HUB_CONNECTION_STRING;

if (!iotHubConnectionString) {
    console.error(
        `Environment variable IotHubConnectionString must be specified.`
    );
    return;
}

console.log(`Using IoT Hub connection string [${iotHubConnectionString}]`);

const eventHubConsumerGroup = process.env.EVENT_HUB_CONSUMER_GROUP;

if (!eventHubConsumerGroup) {
    console.error(
        `Environment variable EventHubConsumerGroup must be specified.`
    );
    return;
}

console.log(`Using event hub consumer group [${eventHubConsumerGroup}]`);

const influxDbUrl = process.env.INFLUX_DB_URL;
const influxDbToken = process.env.INFLUX_DB_TOKEN;
const influxDbOrg = process.env.INFLUX_DB_ORG;
const influxDbBucket = process.env.INFLUX_DB_BUCKET;

module.exports = {
    iotHubConnectionString,
    eventHubConsumerGroup,
    influxDbUrl,
    influxDbToken,
    influxDbOrg,
    influxDbBucket,
};
