import { useMemo } from 'react';
import type { WiringRow, Board } from '../../types';
import type { IoTComponent } from '../../types';

interface BomItem {
  name: string;
  quantity: number;
  category: string;
  specs: string;
  powerNote: string;
  icon: string;
}

interface BomGeneratorProps {
  wiringRows: WiringRow[];
  components: (IoTComponent | undefined)[];
  board: Board;
}

export default function BomGenerator({ wiringRows, components, board }: BomGeneratorProps) {
  const bom = useMemo(() => {
    const items: BomItem[] = [];
    const seen = new Set<string>();

    // 1. Board itself
    items.push({
      name: board === 'ESP32' ? 'ESP32 DevKit v1' : 'NodeMCU ESP8266',
      quantity: 1,
      category: 'Microcontroller',
      specs: board === 'ESP32' ? 'Dual-core 240MHz, WiFi + BLE, 34 GPIO' : 'Single-core 80MHz, WiFi, 11 GPIO',
      powerNote: board === 'ESP32' ? '5V via USB / VIN' : '5V via USB / VIN',
      icon: '🧠',
    });

    // 2. Project components
    const compCounts = new Map<string, number>();
    for (const row of wiringRows) {
      const name = row.component.trim();
      if (!name) continue;
      compCounts.set(name, (compCounts.get(name) || 0) + 1);
    }

    for (const comp of components) {
      if (!comp || seen.has(comp.id)) continue;
      seen.add(comp.id);

      let powerNote = '';
      if (comp.pinType === 'I2C') powerNote = '3.3V';
      else if (comp.category === 'Motor') powerNote = 'External supply required';
      else if (comp.category === 'Actuators') powerNote = '5V recommended';
      else if (comp.category === 'Sensors') powerNote = '3.3V–5V';
      else powerNote = '3.3V–5V';

      const iconMap: Record<string, string> = {
        Sensors: '📡', Actuators: '⚡', Display: '🖥️',
        Communication: '📶', Motor: '⚙️', Input: '🎛️', Storage: '💾',
      };

      items.push({
        name: comp.name,
        quantity: 1,
        category: comp.category,
        specs: `${comp.pinType} • ${comp.description.split('.')[0]}`,
        powerNote,
        icon: iconMap[comp.category] || '🔧',
      });
    }

    // 3. Auto-detect passive components from wiring notes
    const allNotes = wiringRows.map(r => r.notes.toLowerCase()).join(' ');
    if (allNotes.includes('220ω') || allNotes.includes('220ohm') || allNotes.includes('220Ω')) {
      items.push({ name: '220Ω Resistor', quantity: Math.max(1, wiringRows.filter(r => r.notes.includes('220')).length), category: 'Passive', specs: '1/4W carbon film', powerNote: '—', icon: '🔩' });
    }
    if (allNotes.includes('10kω') || allNotes.includes('10k') || allNotes.includes('pull-up') || allNotes.includes('pull-down')) {
      items.push({ name: '10KΩ Resistor', quantity: Math.max(1, wiringRows.filter(r => r.notes.toLowerCase().includes('10k') || r.notes.toLowerCase().includes('pull')).length), category: 'Passive', specs: '1/4W, pull-up/pull-down', powerNote: '—', icon: '🔩' });
    }
    if (allNotes.includes('4.7kω') || allNotes.includes('4.7k')) {
      items.push({ name: '4.7KΩ Resistor', quantity: 1, category: 'Passive', specs: '1/4W, 1-Wire pull-up', powerNote: '—', icon: '🔩' });
    }
    if (allNotes.includes('voltage divider')) {
      items.push({ name: 'Voltage Divider Kit', quantity: 1, category: 'Passive', specs: '5V to 3.3V level shifter', powerNote: '—', icon: '🔩' });
    }

    // 4. Breadboard + jumper wires (always needed)
    items.push({ name: 'Breadboard (830 points)', quantity: 1, category: 'Infrastructure', specs: 'Full-size solderless breadboard', powerNote: '—', icon: '📐' });
    items.push({ name: 'Jumper Wires (M-M / M-F)', quantity: wiringRows.length, category: 'Infrastructure', specs: `${wiringRows.length} connections estimated`, powerNote: '—', icon: '🔗' });

    // 5. USB cable
    items.push({ name: 'Micro-USB Cable', quantity: 1, category: 'Infrastructure', specs: 'Data + power capable', powerNote: '5V @ 500mA+', icon: '🔌' });

    return items;
  }, [wiringRows, components, board]);

  // Power consumption estimate
  const powerEstimate = useMemo(() => {
    let totalMa = board === 'ESP32' ? 240 : 80; // Base WiFi active current

    for (const comp of components) {
      if (!comp) continue;
      if (comp.category === 'Sensors') totalMa += 15;
      else if (comp.category === 'Display') totalMa += 25;
      else if (comp.category === 'Motor') totalMa += 500;
      else if (comp.category === 'Actuators') totalMa += 40;
      else if (comp.category === 'Communication') totalMa += 30;
      else totalMa += 10;
    }

    const level = totalMa > 800 ? 'high' : totalMa > 400 ? 'moderate' : 'low';
    return { totalMa, level };
  }, [wiringRows, components, board]);

  const downloadBomCsv = () => {
    const header = 'Item,Qty,Category,Specifications,Power Note\n';
    const body = bom.map(b => `"${b.name}","${b.quantity}","${b.category}","${b.specs}","${b.powerNote}"`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bill_of_materials.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-xl p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-surface-100)' }}>
          <span>📋</span> Bill of Materials ({bom.length} items)
        </h3>
        <button
          onClick={downloadBomCsv}
          className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-none transition-all hover:scale-105"
          style={{ background: 'var(--color-accent-green)', color: '#000' }}
        >
          ⬇ Download BOM CSV
        </button>
      </div>

      {/* Power consumption banner */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl text-xs mb-4"
        style={{
          background: powerEstimate.level === 'high' ? 'rgba(255,23,68,0.08)' : powerEstimate.level === 'moderate' ? 'rgba(255,145,0,0.08)' : 'rgba(0,230,118,0.08)',
          border: `1px solid ${powerEstimate.level === 'high' ? 'rgba(255,23,68,0.2)' : powerEstimate.level === 'moderate' ? 'rgba(255,145,0,0.2)' : 'rgba(0,230,118,0.2)'}`,
          color: powerEstimate.level === 'high' ? 'var(--color-accent-red)' : powerEstimate.level === 'moderate' ? 'var(--color-accent-orange)' : 'var(--color-accent-green)',
        }}
      >
        <span>⚡</span>
        <span>
          <strong>Estimated Power Draw: ~{powerEstimate.totalMa}mA</strong>
          {powerEstimate.level === 'high' && ' — External 5V supply strongly recommended (USB may not suffice)'}
          {powerEstimate.level === 'moderate' && ' — Stable USB supply or 5V adapter recommended'}
          {powerEstimate.level === 'low' && ' — USB power should be sufficient'}
        </span>
      </div>

      {/* BOM Table */}
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['', 'Component', 'Qty', 'Category', 'Specifications', 'Power'].map(h => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--color-surface-600)',
                    color: 'var(--color-surface-400)',
                    fontWeight: 600,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bom.map((item, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--color-surface-700)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '8px 10px', fontSize: 14 }}>{item.icon}</td>
                <td style={{ padding: '8px 10px', color: 'var(--color-surface-100)', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '8px 10px', color: 'var(--color-accent-cyan)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>×{item.quantity}</td>
                <td style={{ padding: '8px 10px' }}>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'var(--color-surface-700)',
                      color: 'var(--color-surface-300)',
                    }}
                  >
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', color: 'var(--color-surface-300)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.specs}
                </td>
                <td style={{ padding: '8px 10px', color: 'var(--color-surface-400)', fontSize: 11 }}>{item.powerNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
