import { useMemo } from 'react';
import type { WiringRow, Board } from '../../types';
import { detectPinConflicts } from '../../utils/pinValidator';
import { I2C_RESERVED_PINS, isPowerPin } from '../../data/pinData';

interface ValidationDashboardProps {
  wiringRows: WiringRow[];
  board: Board;
}

export default function ValidationDashboard({ wiringRows, board }: ValidationDashboardProps) {
  const alerts = useMemo(() => {
    const messages: { type: 'error' | 'warning' | 'info'; text: string }[] = [];

    // 1. Check for basic pin conflicts
    const conflicts = detectPinConflicts(wiringRows, board);
    if (conflicts.length > 0) {
      conflicts.forEach(c => {
        messages.push({
          type: 'error',
          text: `Pin Conflict on ${c.pin}: Used by ${c.components.join(' and ')}`,
        });
      });
    }

    // 2. Evaluate power requirements and general architecture
    let hasExternalPower = false;
    let hasRelay = false;
    let hasMcp = false;
    let hasSlave = false;
    const masterPins = new Set<string>();
    const slavePins = new Set<string>();
    const mcpPins = new Set<string>();

    for (const row of wiringRows) {
      const notes = row.notes.toLowerCase();
      const component = row.component.toLowerCase();
      const pin = row.espPin.trim();
      const target = row.boardOrIc || 'Master Controller';

      if (!pin) continue;

      if (target === 'Slave Controller') {
        hasSlave = true;
        slavePins.add(pin);
      } else if (target === 'MCP23017 Extender') {
        hasMcp = true;
        mcpPins.add(pin);
      } else {
        masterPins.add(pin);
      }

      if (notes.includes('external') || notes.includes('supply')) hasExternalPower = true;
      if (component.includes('relay')) hasRelay = true;

      // I2C checks for master
      if (I2C_RESERVED_PINS[board].includes(pin)) {
        if (!component.includes('i2c') && !component.includes('oled') && !component.includes('lcd') && !component.includes('rtc')) {
          messages.push({
            type: 'warning',
            text: `Pin ${pin} is typically reserved for I2C, but used for ${row.component}. Ensure this doesn't conflict if I2C is needed later.`,
          });
        }
      }
    }

    if (hasRelay && !hasExternalPower) {
      messages.push({
        type: 'warning',
        text: 'A Relay is used but no external power supply was explicitly noted. Ensure the ESP is not powering the relay coil directly to avoid brownouts.',
      });
    }

    if (hasMcp) {
      messages.push({
        type: 'info',
        text: 'MCP23017 is in use. I2C pins are strictly reserved on the Master Controller. Ensure 5V logic shifting if communicating with a 3.3V ESP.',
      });
    }

    if (hasSlave) {
      messages.push({
        type: 'info',
        text: 'Dual-Engine architecture detected. Ensure both ESPs are configured for ESP-NOW or WebSocket communication to share state.',
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'info',
        text: 'Wiring looks structurally sound. No obvious conflicts detected.',
      });
    }

    return messages;
  }, [wiringRows, board]);

  return (
    <div className="mt-4 flex flex-col gap-2 animate-fadeIn">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="p-3 rounded-lg text-xs font-medium flex items-start gap-2"
          style={{
            background: alert.type === 'error' ? 'rgba(255,23,68,0.1)' :
                        alert.type === 'warning' ? 'rgba(255,145,0,0.1)' : 'rgba(0,230,118,0.1)',
            color: alert.type === 'error' ? 'var(--color-accent-red)' :
                   alert.type === 'warning' ? 'var(--color-accent-orange)' : 'var(--color-accent-green)',
            border: `1px solid ${
              alert.type === 'error' ? 'rgba(255,23,68,0.2)' :
              alert.type === 'warning' ? 'rgba(255,145,0,0.2)' : 'rgba(0,230,118,0.2)'
            }`
          }}
        >
          <span className="mt-0.5">
            {alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : '✅'}
          </span>
          <span className="leading-relaxed">{alert.text}</span>
        </div>
      ))}
    </div>
  );
}
