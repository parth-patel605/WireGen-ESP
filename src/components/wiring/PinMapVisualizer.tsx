import { useMemo } from 'react';
import type { WiringRow, Board } from '../../types';
import { I2C_RESERVED_PINS, getGpioPinsForBoard, MCP23017_PINS } from '../../data/pinData';

interface PinMapVisualizerProps {
  wiringRows: WiringRow[];
  board: Board;
}

export default function PinMapVisualizer({ wiringRows, board }: PinMapVisualizerProps) {
  const gpioPins = getGpioPinsForBoard(board);
  const i2cPins = I2C_RESERVED_PINS[board];
  
  const hasMcp = wiringRows.some(r => r.boardOrIc === 'MCP23017 Extender');
  const hasSlave = wiringRows.some(r => r.boardOrIc === 'Slave Controller');

  const getPinStatus = (pin: string, target: string) => {
    const matchingRows = wiringRows.filter(r => r.espPin === pin && (r.boardOrIc || 'Master Controller') === target);
    if (matchingRows.length > 1) return { status: 'conflict', components: matchingRows.map(r => r.component) };
    if (matchingRows.length === 1) return { status: 'used', components: [matchingRows[0].component] };
    return { status: 'free', components: [] };
  };

  return (
    <div className="mt-6 p-5 rounded-xl border" style={{ background: 'var(--color-surface-800)', borderColor: 'var(--color-surface-600)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-surface-100)' }}>
        Hardware Mapping Overview
      </h3>

      {/* MASTER ESP */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-surface-300)' }}>{board} Master GPIO</h4>
        <div className="grid grid-cols-8 gap-2">
          {gpioPins.map((pin: string) => {
            const { status, components } = getPinStatus(pin, 'Master Controller');
            const isReserved = i2cPins.includes(pin);
            return (
              <div
                key={`master-${pin}`}
                className={`p-2 rounded flex flex-col items-center justify-center text-[10px] text-center transition-all ${
                  status === 'conflict' ? 'bg-red-900/40 text-red-400 border border-red-500/50' :
                  status === 'used' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50' :
                  isReserved ? 'bg-orange-900/20 text-orange-400/70 border border-orange-500/20' :
                  'bg-white/5 text-gray-500 border border-white/5'
                }`}
                title={components.length > 0 ? components.join(', ') : isReserved ? 'Reserved for I2C' : 'Free Pin'}
              >
                <span className="font-mono">{pin.replace('GPIO', 'G')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLAVE CONTROLLER */}
      {hasSlave && (
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-glass-border)' }}>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-accent-purple)' }}>{board} Slave GPIO (ESP-NOW)</h4>
          <div className="grid grid-cols-8 gap-2">
            {gpioPins.map((pin: string) => {
              const { status, components } = getPinStatus(pin, 'Slave Controller');
              return (
                <div
                  key={`slave-${pin}`}
                  className={`p-2 rounded flex flex-col items-center justify-center text-[10px] text-center transition-all ${
                    status === 'conflict' ? 'bg-red-900/40 text-red-400 border border-red-500/50' :
                    status === 'used' ? 'bg-purple-900/40 text-purple-400 border border-purple-500/50' :
                    'bg-white/5 text-gray-500 border border-white/5'
                  }`}
                  title={components.length > 0 ? components.join(', ') : 'Free Pin'}
                >
                  <span className="font-mono">{pin.replace('GPIO ', '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MCP23017 EXPANDER */}
      {hasMcp && (
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-glass-border)' }}>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-accent-cyan)' }}>MCP23017 GPIO Expander</h4>
          <div className="grid grid-cols-8 gap-2">
            {MCP23017_PINS.map((pin: string) => {
              const { status, components } = getPinStatus(pin, 'MCP23017 Extender');
              return (
                <div
                  key={`mcp-${pin}`}
                  className={`p-2 rounded flex flex-col items-center justify-center text-[10px] text-center transition-all ${
                    status === 'conflict' ? 'bg-red-900/40 text-red-400 border border-red-500/50' :
                    status === 'used' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50' :
                    'bg-white/5 text-gray-500 border border-white/5'
                  }`}
                  title={components.length > 0 ? components.join(', ') : 'Free Pin'}
                >
                  <span className="font-mono">{pin}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
