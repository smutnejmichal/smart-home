const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Připojení k InfluxDB
const url = 'http://192.168.5.22:8086'; // případně 'http://localhost:8086'
const token = 'OG-L1Roy5K2-cgxkOEvryETLnv53xutAGTFvuHBA1F6ccQpdxp4Lqr9UTmIzwwKNbkYzgG4_JT5ApS-DYGvE6w==';
const org = 'myorg';
const bucket = 'smart-home-data'; // Název vašeho nového bucketu

const client = new InfluxDB({ url, token });
const writeClient = client.getWriteApi(org, bucket, 's'); // 's' = sekundová přesnost

console.log(`Spouštím generování reálných dat do bucketu '${bucket}'...`);
console.log('Pro ukončení stiskněte Ctrl+C.\n');

// Funkce, která se spustí každou sekundu
setInterval(() => {
  // Generování náhodných, uvěřitelných hodnot pro smart home
  const teplota = (Math.random() * 5 + 21).toFixed(2);       // 21.00 až 26.00 °C
  const vlhkost = (Math.random() * 20 + 40).toFixed(2);      // 40.00 až 60.00 %
  const spotrebaW = Math.floor(Math.random() * 500 + 50);    // 50 až 550 Wattů
  const svetloZapnuto = Math.random() > 0.5 ? true : false;  // Náhodně true/false

  // Vytvoření bodu (measurement = 'environment' a 'devices')
  const point = new Point('smart_home_sensors')
    .tag('room', 'living_room')
    .floatField('temperature', parseFloat(teplota))
    .floatField('humidity', parseFloat(vlhkost))
    .intField('power_consumption_w', spotrebaW)
    .booleanField('light_on', svetloZapnuto);

  // Zápis bodu
  writeClient.writePoint(point);

  console.log(`[Odesláno] Teplota: ${teplota} °C | Vlhkost: ${vlhkost} % | Spotřeba: ${spotrebaW} W | Světlo: ${svetloZapnuto}`);
}, 1000);

// Bezpečné ukončení skriptu při stisknutí Ctrl+C
process.on('SIGINT', async () => {
  console.log('\nUkládám zbývající data a končím...');
  try {
    await writeClient.close();
    console.log('Hotovo.');
    process.exit(0);
  } catch (e) {
    console.error('Chyba při zavírání:', e);
    process.exit(1);
  }
});