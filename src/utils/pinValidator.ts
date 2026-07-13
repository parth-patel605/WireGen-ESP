import type { WiringRow, PinConflict } from '../types';
import { isPowerPin, I2C_RESERVED_PINS, isMcp23017Pin, getGpioPinsForBoard } from '../data/pinData';

// ESP32 input-only pins (ADC2 during WiFi can also be problematic)
const ESP32_INPUT_ONLY = ['GPIO 34', 'GPIO 35', 'GPIO 36', 'GPIO 39'];
const ESP32_RESERVED = ['GPIO 6', 'GPIO 7', 'GPIO 8', 'GPIO 9', 'GPIO 10', 'GPIO 11']; // Flash SPI

// ESP8266 limited GPIO
const ESP8266_BOOT_PINS = ['GPIO 0 (D3)', 'GPIO 2 (D4)', 'GPIO 15 (D8)'];

function isI2CComponent(name: string): boolean {
  const lower = name.toLowerCase();
  const i2cKeywords = ['mcp23017', 'oled', 'lcd', 'rtc', 'mpu6050', 'bmp280', 'max30100', 'i2c', 'display', 'heart rate'];
  return i2cKeywords.some(kw => lower.includes(kw));
}

export function detectPinConflicts(rows: WiringRow[], board: 'ESP32' | 'ESP8266'): PinConflict[] {
  const conflicts: PinConflict[] = [];

  // ─── Check for malformed or invalid pin formats ───
  const validGpios = getGpioPinsForBoard(board);
  for (const row of rows) {
    const pin = row.espPin.trim();
    if (!pin) continue;
    if (isPowerPin(pin)) continue;

    const target = row.boardOrIc || 'Master Controller';
    if (target === 'MCP23017 Extender') {
      if (!/GP[AB][0-7]\b/.test(pin)) {
        conflicts.push({
          pin,
          components: [row.component],
          severity: 'error',
          message: `Component "${row.component}" has an invalid MCP23017 pin "${pin}". Valid pins are GPA0-GPA7 and GPB0-GPB7.`,
        });
      }
    } else {
      if (!validGpios.includes(pin)) {
        conflicts.push({
          pin,
          components: [row.component],
          severity: 'error',
          message: `Component "${row.component}" has an invalid pin "${pin}" for ${board}.`,
        });
      }
    }
  }

  // ─── Group rows by pin ───
  const pinMap = new Map<string, string[]>(); // pin -> components[]

  for (const row of rows) {
    const pin = row.espPin.trim();

    // Skip non-GPIO entries
    if (!pin || isPowerPin(pin)) continue;

    const existing = pinMap.get(pin) || [];
    existing.push(row.component);
    pinMap.set(pin, existing);
  }

  // ─── Check for duplicate pin assignments ───
  for (const [pin, components] of pinMap) {
    if (components.length > 1) {
      const uniqueComponents = [...new Set(components)];
      if (uniqueComponents.length > 1) {
        // If this is an I2C pin for the selected board and ALL components on it are I2C devices, skip warning
        const i2cPins = I2C_RESERVED_PINS[board] || [];
        const isI2cBusPin = i2cPins.includes(pin);
        const allI2c = uniqueComponents.every(c => isI2CComponent(c));

        if (isI2cBusPin && allI2c) {
          continue; // Electrically correct, multiple I2C devices sharing the same I2C bus pins.
        }

        conflicts.push({
          pin,
          components: uniqueComponents,
          severity: 'error',
          message: `Pin ${pin} is assigned to multiple components: ${uniqueComponents.join(', ')}`,
        });
      }
    }
  }

  if (board === 'ESP32') {
    for (const pin of ESP32_RESERVED) {
      if (pinMap.has(pin)) {
        conflicts.push({
          pin,
          components: pinMap.get(pin)!,
          severity: 'error',
          message: `${pin} is reserved for internal flash SPI — do not use!`,
        });
      }
    }
  }

  if (board === 'ESP8266') {
    for (const pin of ESP8266_BOOT_PINS) {
      if (pinMap.has(pin)) {
        conflicts.push({
          pin,
          components: pinMap.get(pin)!,
          severity: 'warning',
          message: `${pin} affects boot mode — ensure proper pull-up/down resistors`,
        });
      }
    }

    // Check if multiple analog sensors share A0
    const analogUsers = rows
      .filter(r => r.espPin.includes('A0'))
      .map(r => r.component);
    const uniqueAnalog = [...new Set(analogUsers)];
    if (uniqueAnalog.length > 1) {
      conflicts.push({
        pin: 'A0',
        components: uniqueAnalog,
        severity: 'error',
        message: `ESP8266 has only ONE analog pin (A0). Cannot use multiple analog sensors: ${uniqueAnalog.join(', ')}. Use a multiplexer.`,
      });
    }
  }

  return conflicts;
}
