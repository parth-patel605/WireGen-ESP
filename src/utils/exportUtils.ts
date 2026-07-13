import type { WiringRow } from '../types';

export function exportProjectAsJSON(project: {
  name: string;
  board: string;
  components: string[];
  wiring: WiringRow[];
  code: string;
  libraries: string[];
}): string {
  return JSON.stringify(project, null, 2);
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function downloadCode(code: string, filename: string): void {
  const blob = new Blob([code], { type: 'text/plain' });
  downloadBlob(blob, filename.endsWith('.ino') ? filename : `${filename}.ino`);
}

export function downloadCSV(rows: WiringRow[], filename: string): void {
  const header = 'Component,ESP Pin,Component Pin,Notes\n';
  const body = rows.map(r => `"${r.component}","${r.espPin}","${r.componentPin}","${r.notes}"`).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProjectFromJSON(file: File): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
