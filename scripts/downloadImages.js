import fs from 'fs';
import path from 'path';
import https from 'https';

const COMPONENTS_DIR = path.join(process.cwd(), 'public', 'components');

if (!fs.existsSync(COMPONENTS_DIR)) {
  fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
}

// ─── Component Data ───────────────────────────────────────

const newComponents = [
  {
    id: 'rfid',
    name: 'RFID RC522',
    category: 'Communication',
    description: '13.56MHz RFID reader/writer module. Uses SPI communication to read RFID tags and cards. Commonly used in access control systems.',
    pinType: 'SPI',
  },
  {
    id: 'mpu6050',
    name: 'MPU6050 Accelerometer',
    category: 'Sensors',
    description: '6-axis motion tracking device combining a 3-axis gyroscope and a 3-axis accelerometer. Communicates via I2C.',
    pinType: 'I2C',
  },
  {
    id: 'bmp280',
    name: 'BMP280 Barometric Sensor',
    category: 'Sensors',
    description: 'High-precision environmental sensor measuring barometric pressure and temperature. Useful for weather stations and altitude estimation.',
    pinType: 'I2C',
  },
  {
    id: 'neopixel',
    name: 'NeoPixel WS2812B',
    category: 'Display',
    description: 'Individually addressable RGB LED strip/ring. Requires only one digital data pin to control hundreds of LEDs. Very timing sensitive.',
    pinType: 'Digital',
  },
  {
    id: 'nrf24l01',
    name: 'NRF24L01 Radio',
    category: 'Communication',
    description: '2.4GHz RF transceiver module. Extremely low power and cheap for point-to-point wireless communication over SPI.',
    pinType: 'SPI',
  },
  {
    id: 'lora',
    name: 'LoRa RFM95',
    category: 'Communication',
    description: 'Long Range (LoRa) transceiver module. Capable of communicating over several kilometers using low power on 868/915 MHz bands.',
    pinType: 'SPI',
  },
  {
    id: 'joystick',
    name: 'Joystick Module',
    category: 'Input',
    description: 'Analog 2-axis joystick with built-in push button. Outputs two analog voltages for X and Y axes.',
    pinType: 'Analog',
  },
  {
    id: 'water-level',
    name: 'Water Level Sensor',
    category: 'Sensors',
    description: 'Analog sensor that detects the depth of water by measuring resistance across parallel exposed traces.',
    pinType: 'Analog',
  },
  {
    id: 'max30100',
    name: 'Heart Rate Sensor',
    category: 'Sensors',
    description: 'Pulse oximeter and heart rate monitor module. Uses optical sensors to measure blood oxygen and pulse. I2C interface.',
    pinType: 'I2C',
  }
];

// Helper to fetch Wikipedia image
function fetchWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=500`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// ─── Update components.ts ──────────────────────────────────

const componentsFile = path.join(process.cwd(), 'src', 'data', 'components.ts');
let content = fs.readFileSync(componentsFile, 'utf8');

// Insert new components before the closing bracket of the components array
const insertIndex = content.indexOf('];\n\nexport const componentCategories');
if (insertIndex !== -1) {
  const newComponentsStr = newComponents.map(c => `  {
    id: '${c.id}',
    name: '${c.name}',
    category: '${c.category}',
    description: '${c.description}',
    pinType: '${c.pinType}',
  },`).join('\n');
  
  if (!content.includes("'rfid'")) {
    content = content.slice(0, insertIndex) + newComponentsStr + '\n' + content.slice(insertIndex);
  }
}

// Ensure every component has an imageUrl
content = content.replace(/pinType: '([^']+)',\n\s+datasheet\?: '([^']+)',\n\s+imageUrl/g, "pinType: '$1',\n    datasheet?: '$2',\n    imageUrl");
content = content.replace(/pinType: '([^']+)',\n  },/g, "pinType: '$1',\n    imageUrl: `/components/$COMP_ID.jpg`,\n  },");

// We need a better regex to inject imageUrl
const compRegex = /id:\s*'([^']+)'[\s\S]*?pinType:\s*'([^']+)',?(\s+datasheet\?:\s*'[^']+',?)?\s*\}/g;
let updatedContent = content.replace(compRegex, (match, id, pinType, datasheet) => {
  if (match.includes('imageUrl:')) return match;
  return match.replace(/\}$/, `  imageUrl: '/components/${id}.jpg',\n  }`);
});

fs.writeFileSync(componentsFile, updatedContent, 'utf8');
console.log('✅ Updated src/data/components.ts with new components and image URLs');

// ─── Download Images ───────────────────────────────────────

// Extract all IDs
const ids = [];
const idRegex = /id:\s*'([^']+)'/g;
let match;
while ((match = idRegex.exec(updatedContent)) !== null) {
  ids.push(match[1]);
}

async function run() {
  console.log(`Starting image download for ${ids.length} components...`);
  
  for (const id of ids) {
    const dest = path.join(COMPONENTS_DIR, `${id}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${id}, already exists.`);
      continue;
    }

    // Try to get a real image from Wikipedia or fallback to a generated placeholder
    const queryMap = {
      led: 'Light-emitting_diode',
      'rgb-led': 'RGB_color_model',
      relay: 'Relay',
      buzzer: 'Piezoelectric_speaker',
      'push-button': 'Push-button',
      potentiometer: 'Potentiometer',
      ldr: 'Photoresistor',
      'ir-sensor': 'Passive_infrared_sensor',
      pir: 'Passive_infrared_sensor',
      ultrasonic: 'Ultrasonic_transducer',
      wifi: 'ESP8266',
      bluetooth: 'Bluetooth',
      gps: 'Global_Positioning_System',
      'dc-motor': 'DC_motor',
      stepper: 'Stepper_motor',
      servo: 'Servomotor',
      oled: 'OLED',
    };

    const wikiQuery = queryMap[id] || id.replace(/-/g, ' ');
    let url = await fetchWikiImage(wikiQuery);

    if (!url) {
      // Fallback placeholder with component name
      url = `https://placehold.co/400x300/1e293b/00e5ff.jpg?text=${encodeURIComponent(id.toUpperCase().replace(/-/g, ' '))}`;
    }

    try {
      await downloadImage(url, dest);
      console.log(`✅ Downloaded ${id}`);
    } catch (e) {
      console.log(`❌ Failed ${id}: ${e.message}`);
    }
  }
  
  console.log('🎉 All downloads completed!');
}

run();
