require('dotenv').config();

const WaterBillCalculator = require('./scripts/water-bill-calculator');
const EventHubReader = require('./scripts/event-hub-reader.js');

const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client');

const {
    iotHubConnectionString,
    eventHubConsumerGroup,
    influxDbUrl,
    influxDbToken,
    influxDbOrg,
    influxDbBucket,
} = require('./setup');

const eventHubReader = new EventHubReader(
    iotHubConnectionString,
    eventHubConsumerGroup
);

const writeApi = new InfluxDB({
    url: influxDbUrl,
    token: influxDbToken,
}).getWriteApi(influxDbOrg, influxDbBucket, 's');

(async () => {
    await eventHubReader.startReadMessage((data, date, deviceId) => {
        try {
            if (!date) {
                date = Date.now().toISOString();
            }

            const { flowRate, volume, tag } = data;

            const cubicMeterVolume = volume * 0.001;
            const waterBill = new WaterBillCalculator(
                cubicMeterVolume
            ).calculateMonthlyBill();

            const point = new Point('water-consumption')
                .floatField('flow-rate', flowRate)
                .floatField('volume', volume)
                .floatField('estimated-bill', waterBill)
                .tag('sensor', tag);

            console.log('Writing point: ' + JSON.stringify(data));

            writeApi.writePoint(point);
            writeApi.flush();
        } catch (err) {
            console.error('Error reading message: [%s] from [%s].', err, data);
        }
    });
})().catch();
