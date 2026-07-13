// ─── Centralized Pin Data for Multi-Controller / GPIO Extender ───

import type { Board } from '../types';

// MCP23017 16-channel I2C IO Expander pins
export const MCP23017_PINS = [
  'GPA0', 'GPA1', 'GPA2', 'GPA3', 'GPA4', 'GPA5', 'GPA6', 'GPA7',
  'GPB0', 'GPB1', 'GPB2', 'GPB3', 'GPB4', 'GPB5', 'GPB6', 'GPB7',
];

// ESP32 GPIO pins available for general use
export const ESP32_GPIO_PINS = [
  'GPIO 2', 'GPIO 4', 'GPIO 5',
  'GPIO 12', 'GPIO 13', 'GPIO 14', 'GPIO 15',
  'GPIO 16', 'GPIO 17', 'GPIO 18', 'GPIO 19',
  'GPIO 21', 'GPIO 22', 'GPIO 23',
  'GPIO 25', 'GPIO 26', 'GPIO 27',
  'GPIO 32', 'GPIO 33',
  'GPIO 34', 'GPIO 35', 'GPIO 36', 'GPIO 39',
];

// ESP8266 GPIO pins available for general use
export const ESP8266_GPIO_PINS = [
  'GPIO 0 (D3)', 'GPIO 2 (D4)',
  'GPIO 4 (D2)', 'GPIO 5 (D1)',
  'GPIO 12 (D6)', 'GPIO 13 (D7)', 'GPIO 14 (D5)', 'GPIO 15 (D8)',
  'GPIO 16 (D0)',
  'A0',
];

// I2C bus pins that must be reserved when MCP23017 is in use
export const I2C_RESERVED_PINS: Record<Board, string[]> = {
  ESP32: ['GPIO 21', 'GPIO 22'],
  ESP8266: ['GPIO 4 (D2)', 'GPIO 5 (D1)'],
};

// Power / non-GPIO pins (shared across boards, excluded from conflict checks)
export const POWER_PINS = ['GND', '3.3V', '5V', '5V (VIN)', '12V', '4.2V'];

// Helper: check if a pin string is a power/non-assignable pin
export function isPowerPin(pin: string): boolean {
  const p = pin.trim();
  return POWER_PINS.includes(p) || p === 'Internal' || p === 'N/A' || p.includes('Relay') || p.includes('L298N');
}

// Helper: check if a pin is an MCP23017 expander pin
export function isMcp23017Pin(pin: string): boolean {
  return /^GP[AB]\d$/.test(pin.trim());
}

// Get the available GPIO list for a given board
export function getGpioPinsForBoard(board: Board): string[] {
  return board === 'ESP32' ? ESP32_GPIO_PINS : ESP8266_GPIO_PINS;
}
