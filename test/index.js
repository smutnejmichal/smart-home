const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Připojení k InfluxDB (pokud běží v Dockeru na stejném stroji, localhost:8086 funguje, 
// protože skript pouštíte zvenku z hostitelského systému)
const url = 'http://localhost:8086';
const token = 'OG-L1Roy5K2-cgxkOEvryETLnv53xutAGTFvuHBA1F6ccQpdxp4Lqr9UTmIzwwKNbkYzgG4_JT5ApS-DYGvE6w==';
const org = 'myorg';
const bucket = 'mybucket';

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket, 's'); // 's' znamená sekundová přesnost

console.log('Spouštím odesílání náhodných dat do InfluxDB každou sekundu...');

// Funkce, která se provede každou sekundu
setInterval(() => {
    // Generování náhodných hodnot (např. teplota 20-30 °C, vlhkost 40-70 %)
    const teplota = (Math.random() * 10 + 20).toFixed(2);
    const vlhkost = (Math.random() * 30 + 40).toFixed(2);

    // Vytvoření bodu (měření 'domacnost')
    const point = new Point('domacnost')
        .tag('senzor', 'obvak')
        .floatField('teplota', parseFloat(teplota))
        .floatField('vlhkost', parseFloat(vlhkost));

    // Zápis do InfluxDB
    writeApi.writePoint(point);

    console.log(`Odesláno -> Teplota: ${teplota} °C, Vlhkost: ${vlhkost} %`);
}, 1000);

// Ukončení skriptu (bezpečný zápis zbývajících dat při vypnutí)
process.on('SIGINT', async () => {
    try {
        await writeApi.close();
        console.log('\nZápis do InfluxDB byl ukončen.');
        process.exit(0);
    } catch (e) {
        console.error('Chyba při zavírání Influx klienta:', e);
        process.exit(1);
    }
});