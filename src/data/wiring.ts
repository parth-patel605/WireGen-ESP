import type { WiringRow, BoardTarget } from '../types';

let _rowId = 0;
const row = (component: string, espPin: string, componentPin: string, notes: string): WiringRow => ({
  id: '',
  component,
  espPin,
  componentPin,
  notes,
});

// ─── ESP32 Wiring Database ─────────────────────────────────

const esp32Wiring: Record<string, WiringRow[]> = {
  led: [
    row('LED', 'GPIO 2', '+ Anode', '220Ω resistor required'),
    row('LED', 'GND', '- Cathode', ''),
  ],
  'rgb-led': [
    row('RGB LED', 'GPIO 25', 'Red', '220Ω resistor'),
    row('RGB LED', 'GPIO 26', 'Green', '220Ω resistor'),
    row('RGB LED', 'GPIO 27', 'Blue', '220Ω resistor'),
    row('RGB LED', 'GND', 'Common Cathode', ''),
  ],
  relay: [
    row('Relay', 'GPIO 26', 'IN', 'Control signal (Active LOW)'),
    row('Relay', '5V', '+ VCC', 'Relay power supply'),
    row('Relay', 'GND', '- GND', ''),
  ],
  buzzer: [
    row('Buzzer', 'GPIO 14', '+', 'Active buzzer'),
    row('Buzzer', 'GND', '-', ''),
  ],
  'push-button': [
    row('Button', 'GPIO 13', 'Signal', 'Use INPUT_PULLUP'),
    row('Button', 'GND', '-', ''),
  ],
  potentiometer: [
    row('Pot', 'GPIO 34', 'Wiper', 'Analog input (ADC1)'),
    row('Pot', '3.3V', '+ VCC', ''),
    row('Pot', 'GND', '- GND', ''),
  ],
  ldr: [
    row('LDR', 'GPIO 35', 'Analog', 'Voltage divider with 10KΩ'),
    row('LDR', '3.3V', '+', ''),
    row('LDR', 'GND', '-', ''),
  ],
  'ir-sensor': [
    row('IR Sensor', 'GPIO 27', 'OUT', 'Digital output'),
    row('IR Sensor', '5V', '+ VCC', ''),
    row('IR Sensor', 'GND', '-', ''),
  ],
  pir: [
    row('PIR', 'GPIO 27', 'OUT', 'Digital HIGH on motion'),
    row('PIR', '5V', '+ VCC', ''),
    row('PIR', 'GND', '-', ''),
  ],
  ultrasonic: [
    row('HC-SR04', 'GPIO 5', 'TRIG', 'Trigger pulse'),
    row('HC-SR04', 'GPIO 18', 'ECHO', 'Use voltage divider for 3.3V'),
    row('HC-SR04', '5V', '+ VCC', ''),
    row('HC-SR04', 'GND', '-', ''),
  ],
  dht11: [
    row('DHT11', 'GPIO 4', 'DATA', '10KΩ pull-up resistor'),
    row('DHT11', '3.3V', '+ VCC', ''),
    row('DHT11', 'GND', '-', ''),
  ],
  dht22: [
    row('DHT22', 'GPIO 4', 'DATA', '10KΩ pull-up resistor'),
    row('DHT22', '3.3V', '+ VCC', ''),
    row('DHT22', 'GND', '-', ''),
  ],
  ds18b20: [
    row('DS18B20', 'GPIO 4', 'DATA', '4.7KΩ pull-up resistor'),
    row('DS18B20', '3.3V', '+ VCC', ''),
    row('DS18B20', 'GND', '-', ''),
  ],
  'mq-gas': [
    row('MQ Sensor', 'GPIO 34', 'AO', 'Analog output'),
    row('MQ Sensor', 'GPIO 13', 'DO', 'Digital output (optional)'),
    row('MQ Sensor', '5V', '+ VCC', 'Heater needs 5V'),
    row('MQ Sensor', 'GND', '-', ''),
  ],
  'soil-moisture': [
    row('Soil Sensor', 'GPIO 33', 'AO', 'Analog output'),
    row('Soil Sensor', '3.3V', '+', ''),
    row('Soil Sensor', 'GND', '-', ''),
  ],
  'rain-sensor': [
    row('Rain Sensor', 'GPIO 32', 'AO', 'Analog output'),
    row('Rain Sensor', '3.3V', '+', ''),
    row('Rain Sensor', 'GND', '-', ''),
  ],
  'flame-sensor': [
    row('Flame Sensor', 'GPIO 33', 'DO', 'LOW when flame detected'),
    row('Flame Sensor', '5V', '+ VCC', ''),
    row('Flame Sensor', 'GND', '-', ''),
  ],
  'sound-sensor': [
    row('Sound Sensor', 'GPIO 36', 'AO', 'Analog output'),
    row('Sound Sensor', '5V', '+', ''),
    row('Sound Sensor', 'GND', '-', ''),
  ],
  oled: [
    row('OLED', 'GPIO 21', 'SDA', 'I2C Data'),
    row('OLED', 'GPIO 22', 'SCL', 'I2C Clock'),
    row('OLED', '3.3V', 'VCC', ''),
    row('OLED', 'GND', 'GND', ''),
  ],
  lcd16x2: [
    row('LCD I2C', 'GPIO 21', 'SDA', 'I2C Data'),
    row('LCD I2C', 'GPIO 22', 'SCL', 'I2C Clock'),
    row('LCD I2C', '5V', 'VCC', 'LCD needs 5V'),
    row('LCD I2C', 'GND', 'GND', ''),
  ],
  'seven-segment': [
    row('7-Seg', 'GPIO 23', 'DIN', 'Shift register data'),
    row('7-Seg', 'GPIO 18', 'CLK', 'Shift register clock'),
    row('7-Seg', 'GPIO 5', 'LATCH', 'Shift register latch'),
    row('7-Seg', '5V', 'VCC', ''),
    row('7-Seg', 'GND', 'GND', ''),
  ],
  servo: [
    row('Servo', 'GPIO 14', 'Signal', 'PWM pin'),
    row('Servo', '5V', '+ VCC', 'External supply recommended'),
    row('Servo', 'GND', '-', 'Common GND with ESP'),
  ],
  'dc-motor': [
    row('DC Motor', 'L298N OUT1', 'Motor +', 'Connect via motor driver'),
    row('DC Motor', 'L298N OUT2', 'Motor -', ''),
  ],
  stepper: [
    row('Stepper', 'L298N OUT1-4', 'Coils', 'Connect via motor driver'),
  ],
  l298n: [
    row('L298N', 'GPIO 25', 'IN1', 'Motor A direction'),
    row('L298N', 'GPIO 26', 'IN2', 'Motor A direction'),
    row('L298N', 'GPIO 27', 'IN3', 'Motor B direction'),
    row('L298N', 'GPIO 14', 'IN4', 'Motor B direction'),
    row('L298N', 'GPIO 32', 'ENA', 'Motor A speed (PWM)'),
    row('L298N', 'GPIO 33', 'ENB', 'Motor B speed (PWM)'),
    row('L298N', '12V', '+ Motor Supply', 'External 12V supply'),
    row('L298N', 'GND', '-', 'Common GND with ESP'),
  ],
  wifi: [
    row('ESP32', 'Internal', 'WiFi', 'No external wiring needed'),
  ],
  bluetooth: [
    row('ESP32', 'Internal', 'Bluetooth', 'No external wiring needed'),
  ],
  gps: [
    row('GPS NEO-6M', 'GPIO 16', 'TX', 'UART RX ← GPS TX'),
    row('GPS NEO-6M', 'GPIO 17', 'RX', 'UART TX → GPS RX'),
    row('GPS NEO-6M', '5V', '+', ''),
    row('GPS NEO-6M', 'GND', '-', ''),
  ],
  gsm: [
    row('GSM SIM800L', 'GPIO 16', 'TX', 'UART'),
    row('GSM SIM800L', 'GPIO 17', 'RX', 'UART'),
    row('GSM SIM800L', '4.2V', '+', 'Needs 3.4–4.4V (use buck converter)'),
    row('GSM SIM800L', 'GND', '-', ''),
  ],
  rtc: [
    row('RTC DS3231', 'GPIO 21', 'SDA', 'I2C Data'),
    row('RTC DS3231', 'GPIO 22', 'SCL', 'I2C Clock'),
    row('RTC DS3231', '3.3V', '+', ''),
    row('RTC DS3231', 'GND', '-', ''),
  ],
  'sd-card': [
    row('SD Module', 'GPIO 23', 'MOSI', 'SPI'),
    row('SD Module', 'GPIO 19', 'MISO', 'SPI'),
    row('SD Module', 'GPIO 18', 'SCK', 'SPI'),
    row('SD Module', 'GPIO 5', 'CS', 'Chip Select'),
    row('SD Module', '5V', '+', ''),
    row('SD Module', 'GND', '-', ''),
  ],
  keypad: [
    row('Keypad', 'GPIO 13', 'R1', 'Row 1'),
    row('Keypad', 'GPIO 12', 'R2', 'Row 2'),
    row('Keypad', 'GPIO 14', 'R3', 'Row 3'),
    row('Keypad', 'GPIO 27', 'R4', 'Row 4'),
    row('Keypad', 'GPIO 26', 'C1', 'Column 1'),
    row('Keypad', 'GPIO 25', 'C2', 'Column 2'),
    row('Keypad', 'GPIO 33', 'C3', 'Column 3'),
    row('Keypad', 'GPIO 32', 'C4', 'Column 4'),
  ],
  'touch-sensor': [
    row('Touch', 'GPIO 4', 'Signal', 'Touch/capacitive pin (T0)'),
    row('Touch', '3.3V', '+', ''),
    row('Touch', 'GND', '-', ''),
  ],
  'rotary-encoder': [
    row('Encoder', 'GPIO 25', 'CLK', 'Clock/A phase'),
    row('Encoder', 'GPIO 26', 'DT', 'Data/B phase'),
    row('Encoder', 'GPIO 27', 'SW', 'Push button'),
    row('Encoder', '3.3V', '+', ''),
    row('Encoder', 'GND', '-', ''),
  ],
  'current-sensor': [
    row('ACS712', 'GPIO 35', 'OUT', 'Analog output'),
    row('ACS712', '5V', '+ VCC', ''),
    row('ACS712', 'GND', '-', ''),
  ],
  'voltage-sensor': [
    row('Voltage Divider', 'GPIO 34', 'Signal', 'Max 25V input'),
    row('Voltage Divider', 'GND', '-', ''),
  ],
  fan: [
    row('Fan', 'Relay NO', 'Phase', 'AC load via relay'),
    row('Fan', 'Relay COM', 'Live', 'Mains isolation required'),
  ],
  'water-pump': [
    row('Pump', 'Relay NO', 'Phase', 'AC/DC load via relay'),
    row('Pump', 'Relay COM', 'Live/+', ''),
  ],
};

// ─── ESP8266 Wiring Database ───────────────────────────────

const esp8266Wiring: Record<string, WiringRow[]> = {
  led: [
    row('LED', 'GPIO 2 (D4)', '+ Anode', '220Ω resistor — built-in LED'),
    row('LED', 'GND', '- Cathode', ''),
  ],
  'rgb-led': [
    row('RGB LED', 'GPIO 14 (D5)', 'Red', '220Ω resistor'),
    row('RGB LED', 'GPIO 12 (D6)', 'Green', '220Ω resistor'),
    row('RGB LED', 'GPIO 13 (D7)', 'Blue', '220Ω resistor'),
    row('RGB LED', 'GND', 'Common Cathode', ''),
  ],
  relay: [
    row('Relay', 'GPIO 5 (D1)', 'IN', 'Control signal'),
    row('Relay', '5V (VIN)', '+ VCC', ''),
    row('Relay', 'GND', '- GND', ''),
  ],
  buzzer: [
    row('Buzzer', 'GPIO 14 (D5)', '+', ''),
    row('Buzzer', 'GND', '-', ''),
  ],
  'push-button': [
    row('Button', 'GPIO 0 (D3)', 'Signal', 'Built-in pull-up (FLASH btn)'),
    row('Button', 'GND', '-', ''),
  ],
  potentiometer: [
    row('Pot', 'A0', 'Wiper', 'Only 1 analog pin (0–1V)'),
    row('Pot', '3.3V', '+ VCC', ''),
    row('Pot', 'GND', '- GND', ''),
  ],
  ldr: [
    row('LDR', 'A0', 'Analog', 'Voltage divider with 10KΩ'),
    row('LDR', '3.3V', '+', ''),
    row('LDR', 'GND', '-', ''),
  ],
  'ir-sensor': [
    row('IR Sensor', 'GPIO 5 (D1)', 'OUT', ''),
    row('IR Sensor', '5V (VIN)', '+ VCC', ''),
    row('IR Sensor', 'GND', '-', ''),
  ],
  pir: [
    row('PIR', 'GPIO 5 (D1)', 'OUT', 'Digital HIGH on motion'),
    row('PIR', '5V (VIN)', '+ VCC', ''),
    row('PIR', 'GND', '-', ''),
  ],
  ultrasonic: [
    row('HC-SR04', 'GPIO 12 (D6)', 'TRIG', ''),
    row('HC-SR04', 'GPIO 14 (D5)', 'ECHO', 'Use voltage divider 5V→3.3V'),
    row('HC-SR04', '5V (VIN)', '+ VCC', ''),
    row('HC-SR04', 'GND', '-', ''),
  ],
  dht11: [
    row('DHT11', 'GPIO 4 (D2)', 'DATA', '10KΩ pull-up'),
    row('DHT11', '3.3V', '+ VCC', ''),
    row('DHT11', 'GND', '-', ''),
  ],
  dht22: [
    row('DHT22', 'GPIO 4 (D2)', 'DATA', '10KΩ pull-up'),
    row('DHT22', '3.3V', '+ VCC', ''),
    row('DHT22', 'GND', '-', ''),
  ],
  ds18b20: [
    row('DS18B20', 'GPIO 4 (D2)', 'DATA', '4.7KΩ pull-up'),
    row('DS18B20', '3.3V', '+ VCC', ''),
    row('DS18B20', 'GND', '-', ''),
  ],
  'mq-gas': [
    row('MQ Sensor', 'A0', 'AO', 'Only analog pin'),
    row('MQ Sensor', '5V (VIN)', '+ VCC', ''),
    row('MQ Sensor', 'GND', '-', ''),
  ],
  'soil-moisture': [
    row('Soil Sensor', 'A0', 'AO', 'Only analog pin'),
    row('Soil Sensor', '3.3V', '+', ''),
    row('Soil Sensor', 'GND', '-', ''),
  ],
  'rain-sensor': [
    row('Rain Sensor', 'A0', 'AO', 'Only analog pin'),
    row('Rain Sensor', '3.3V', '+', ''),
    row('Rain Sensor', 'GND', '-', ''),
  ],
  'flame-sensor': [
    row('Flame Sensor', 'GPIO 5 (D1)', 'DO', 'Digital only on ESP8266'),
    row('Flame Sensor', '5V (VIN)', '+ VCC', ''),
    row('Flame Sensor', 'GND', '-', ''),
  ],
  'sound-sensor': [
    row('Sound Sensor', 'A0', 'AO', 'Only analog pin'),
    row('Sound Sensor', '5V (VIN)', '+', ''),
    row('Sound Sensor', 'GND', '-', ''),
  ],
  oled: [
    row('OLED', 'GPIO 4 (D2)', 'SDA', 'I2C Data'),
    row('OLED', 'GPIO 5 (D1)', 'SCL', 'I2C Clock'),
    row('OLED', '3.3V', 'VCC', ''),
    row('OLED', 'GND', 'GND', ''),
  ],
  lcd16x2: [
    row('LCD I2C', 'GPIO 4 (D2)', 'SDA', 'I2C Data'),
    row('LCD I2C', 'GPIO 5 (D1)', 'SCL', 'I2C Clock'),
    row('LCD I2C', '5V (VIN)', 'VCC', ''),
    row('LCD I2C', 'GND', 'GND', ''),
  ],
  'seven-segment': [
    row('7-Seg', 'GPIO 13 (D7)', 'DIN', 'Shift register data'),
    row('7-Seg', 'GPIO 14 (D5)', 'CLK', ''),
    row('7-Seg', 'GPIO 15 (D8)', 'LATCH', ''),
    row('7-Seg', '5V (VIN)', 'VCC', ''),
    row('7-Seg', 'GND', 'GND', ''),
  ],
  servo: [
    row('Servo', 'GPIO 14 (D5)', 'Signal', 'PWM'),
    row('Servo', '5V (VIN)', '+ VCC', 'External power recommended'),
    row('Servo', 'GND', '-', ''),
  ],
  'dc-motor': [
    row('DC Motor', 'L298N OUT1', 'Motor +', 'Via motor driver'),
    row('DC Motor', 'L298N OUT2', 'Motor -', ''),
  ],
  stepper: [
    row('Stepper', 'L298N OUT1-4', 'Coils', 'Via motor driver'),
  ],
  l298n: [
    row('L298N', 'GPIO 5 (D1)', 'IN1', 'Motor A direction'),
    row('L298N', 'GPIO 4 (D2)', 'IN2', 'Motor A direction'),
    row('L298N', 'GPIO 0 (D3)', 'IN3', 'Motor B direction'),
    row('L298N', 'GPIO 2 (D4)', 'IN4', 'Motor B direction'),
    row('L298N', 'GPIO 14 (D5)', 'ENA', 'Speed PWM'),
    row('L298N', 'GPIO 12 (D6)', 'ENB', 'Speed PWM'),
    row('L298N', '12V', '+ Motor Supply', 'External supply'),
    row('L298N', 'GND', '-', 'Common GND'),
  ],
  wifi: [
    row('ESP8266', 'Internal', 'WiFi', 'No external wiring needed'),
  ],
  bluetooth: [
    row('ESP8266', 'N/A', 'Bluetooth', 'ESP8266 has NO Bluetooth — use HC-05 module or switch to ESP32'),
  ],
  gps: [
    row('GPS NEO-6M', 'GPIO 13 (D7)', 'TX', 'SoftwareSerial RX'),
    row('GPS NEO-6M', 'GPIO 15 (D8)', 'RX', 'SoftwareSerial TX'),
    row('GPS NEO-6M', '5V (VIN)', '+', ''),
    row('GPS NEO-6M', 'GND', '-', ''),
  ],
  gsm: [
    row('GSM SIM800L', 'GPIO 13 (D7)', 'TX', 'SoftwareSerial RX'),
    row('GSM SIM800L', 'GPIO 15 (D8)', 'RX', 'SoftwareSerial TX'),
    row('GSM SIM800L', '4.2V', '+', 'Buck converter from VIN'),
    row('GSM SIM800L', 'GND', '-', ''),
  ],
  rtc: [
    row('RTC DS3231', 'GPIO 4 (D2)', 'SDA', 'I2C'),
    row('RTC DS3231', 'GPIO 5 (D1)', 'SCL', 'I2C'),
    row('RTC DS3231', '3.3V', '+', ''),
    row('RTC DS3231', 'GND', '-', ''),
  ],
  'sd-card': [
    row('SD Module', 'GPIO 13 (D7)', 'MOSI', 'SPI'),
    row('SD Module', 'GPIO 12 (D6)', 'MISO', 'SPI'),
    row('SD Module', 'GPIO 14 (D5)', 'SCK', 'SPI'),
    row('SD Module', 'GPIO 15 (D8)', 'CS', ''),
    row('SD Module', '5V (VIN)', '+', ''),
    row('SD Module', 'GND', '-', ''),
  ],
  keypad: [
    row('Keypad', 'GPIO 5 (D1)', 'R1', 'Row 1'),
    row('Keypad', 'GPIO 4 (D2)', 'R2', 'Row 2'),
    row('Keypad', 'GPIO 0 (D3)', 'R3', 'Row 3'),
    row('Keypad', 'GPIO 2 (D4)', 'R4', 'Row 4'),
    row('Keypad', 'GPIO 14 (D5)', 'C1', 'Column 1'),
    row('Keypad', 'GPIO 12 (D6)', 'C2', 'Column 2'),
    row('Keypad', 'GPIO 13 (D7)', 'C3', 'Column 3'),
    row('Keypad', 'GPIO 15 (D8)', 'C4', 'Column 4'),
  ],
  'touch-sensor': [
    row('Touch', 'GPIO 4 (D2)', 'Signal', 'Digital input'),
    row('Touch', '3.3V', '+', ''),
    row('Touch', 'GND', '-', ''),
  ],
  'rotary-encoder': [
    row('Encoder', 'GPIO 14 (D5)', 'CLK', 'A phase'),
    row('Encoder', 'GPIO 12 (D6)', 'DT', 'B phase'),
    row('Encoder', 'GPIO 13 (D7)', 'SW', 'Push button'),
    row('Encoder', '3.3V', '+', ''),
    row('Encoder', 'GND', '-', ''),
  ],
  'current-sensor': [
    row('ACS712', 'A0', 'OUT', 'Only analog pin'),
    row('ACS712', '5V (VIN)', '+ VCC', ''),
    row('ACS712', 'GND', '-', ''),
  ],
  'voltage-sensor': [
    row('Voltage Divider', 'A0', 'Signal', 'Only analog pin'),
    row('Voltage Divider', 'GND', '-', ''),
  ],
  fan: [
    row('Fan', 'Relay NO', 'Phase', 'AC load via relay'),
    row('Fan', 'Relay COM', 'Live', 'Mains isolation'),
  ],
  'water-pump': [
    row('Pump', 'Relay NO', 'Phase', 'Via relay'),
    row('Pump', 'Relay COM', 'Live/+', ''),
  ],
};

export function getWiringForComponent(componentId: string, board: 'ESP32' | 'ESP8266'): WiringRow[] {
  const db = board === 'ESP32' ? esp32Wiring : esp8266Wiring;
  const rows = db[componentId];
  if (!rows) return [];
  // Return clones with fresh IDs so each usage is independent
  return rows.map(r => ({ ...r, id: `wr-${++_rowId}` }));
}

export function getWiringForProject(componentIds: string[], board: 'ESP32' | 'ESP8266'): WiringRow[] {
  return componentIds.flatMap(id => getWiringForComponent(id, board));
}
