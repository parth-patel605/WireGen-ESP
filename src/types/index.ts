// ─── Component Types ───────────────────────────────────────

export type ComponentCategory =
  | 'Sensors'
  | 'Actuators'
  | 'Display'
  | 'Communication'
  | 'Motor'
  | 'Power'
  | 'Input'
  | 'Storage';

export type PinType = 'Digital' | 'Analog' | 'I2C' | 'SPI' | 'UART' | 'PWM' | 'Internal' | 'Touch';

export interface IoTComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  pinType: PinType;
  datasheet?: string;
  imageUrl?: string;
}

// ─── Project Types ─────────────────────────────────────────

export type ProjectCategory =
  | 'Home Automation'
  | 'Environmental Monitoring'
  | 'Security & Safety'
  | 'Agriculture'
  | 'Motor Control'
  | 'Communication'
  | 'Data & Display'
  | 'Energy';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  difficulty: Difficulty;
  description: string;
  componentIds: string[];
  featured?: boolean;
}

// ─── Wiring Types ──────────────────────────────────────────

export type BoardTarget = 'Master Controller' | 'Slave Controller' | 'MCP23017 Extender';

export interface WiringRow {
  id: string;
  component: string;
  espPin: string;
  componentPin: string;
  notes: string;
  boardOrIc?: string;
}

export interface WiringConfig {
  componentId: string;
  esp32: WiringRow[];
  esp8266: WiringRow[];
}

// ─── Code Template Types ───────────────────────────────────

export interface CodeTemplate {
  projectId: string;
  esp32: {
    code: (ssid: string, pass: string) => string;
    libraries: string[];
  };
  esp8266: {
    code: (ssid: string, pass: string) => string;
    libraries: string[];
  };
}

// ─── Board Type ────────────────────────────────────────────

export type Board = 'ESP32' | 'ESP8266';

// ─── Saved / Favorites ────────────────────────────────────

export interface SavedWiring {
  projectId: string;
  board: Board;
  rows: WiringRow[];
  savedAt: string;
}

export interface AppState {
  selectedBoard: Board;
  favorites: string[];
  recentProjects: string[];
  savedWirings: Record<string, SavedWiring>;
  sidebarCollapsed: boolean;
  generatedCodes: Record<string, string>;
}

// ─── Pin Conflict ──────────────────────────────────────────

export interface PinConflict {
  pin: string;
  components: string[];
  severity: 'warning' | 'error';
  message: string;
}
