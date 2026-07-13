import type { WiringRow } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function askGemini(
  prompt: string,
  context?: string,
  isJson: boolean = false,
  onProgress?: (status: string, details?: string) => void
): Promise<string> {
  if (!API_KEY || API_KEY.trim() === '') {
    throw new Error('API Key Required');
  }

  if (onProgress) onProgress('Connecting...', 'Sending request to Google Gemini API');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${context ? `Context: ${context}\n\n` : ''}${prompt}` }]
      }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.statusText} - ${errText}`);
  }

  const data = await res.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

export async function validateWiringWithAI(
  projectInfo: string,
  wiring: WiringRow[],
  onProgress?: (status: string, details?: string) => void
): Promise<string> {
  const wiringText = wiring.map(w => `- ${w.component} connected to ${w.espPin} (Component Pin: ${w.componentPin})`).join('\n');
  const prompt = `Analyze this wiring table for any electrical flaws:\n${wiringText}`;
  return askGemini(prompt, projectInfo, false, onProgress);
}

export async function generateArduinoCode(
  projectInfo: string,
  wiring: WiringRow[],
  board: string,
  onProgress?: (status: string, details?: string) => void
): Promise<string> {
  const wiringText = wiring.map(w => `- Component: ${w.component} | Pin: ${w.espPin} | IC/Board: ${w.boardOrIc || 'Master Controller'}`).join('\n');

  const prompt = `You are an expert IoT and C++ developer. Generate a highly professional, production-ready Arduino C++ sketch.

BOARD: ${board}
PROJECT DETAILS: ${projectInfo}

CRITICAL INSTRUCTION: Ignore any generic templates related to the "Project Details" (like standard Smart Home OS boilerplates). The TRUE structure of the project is defined EXCLUSIVELY by the following Wiring Table.

WIRING TABLE:
${wiringText}

SYSTEM DIRECTIVE: STRICT WIRING-TO-CODE SYNCHRONIZATION
1. Zero Assumptions: Use EXACTLY the GPIO pins defined in the Wiring Table. Do not hallucinate standard pins.
2. Hardware Specifics (MCP23017): If the wiring table lists components connected to an I2C expander like 'MCP23017' (e.g., GPA0, GPB1), you MUST include the <Adafruit_MCP23017.h> library and use mcp.digitalWrite() for those specific components instead of standard ESP32 digitalWrite().
3. I2C Coexistence: If multiple I2C devices (like OLED and MCP23017) share SDA and SCL pins, initialize Wire.begin() only once.
4. Strict Inclusion: Only generate code for the exact components explicitly listed in the Wiring Table. 
5. No Boilerplate Fallbacks: NEVER output a scaled-down generic "ESP8266" template. 
6. Board Context Check: Generate code specifically for the "${board}" board. If "${board}" is "ESP32", you MUST NOT output ESP8266 code, headers, or libraries (e.g., do NOT include <ESP8266WiFi.h> or <ESP8266WebServer.h>). If "${board}" is "ESP8266", you MUST NOT output ESP32 code, headers, or libraries.

Output ONLY raw compilation-ready C++ code. Do not include markdown formatting like \`\`\`cpp.`;

  const code = await askGemini(prompt, undefined, false, onProgress);
  return code.replace(/^\`\`\`(cpp|c\+\+|c)?\n/i, '').replace(/\n\`\`\`$/i, '').trim();
}

export async function autoFixWiring(
  projectInfo: string,
  wiring: WiringRow[],
  board: string
): Promise<WiringRow[]> {
  const prompt = `You are the 'Wiring Integrity Expert' for this project.
Your task is to analyze the following wiring table for an ESP32/ESP8266 project and automatically fix any conflicts or errors.

Auto-Correction Rules:
1. Fix invalid pins: If 5V, 3.3V, or GND lines are incorrectly labeled as GPIO control pins, correct them immediately.
2. Resolve conflicts: If multiple components use the same GPIO, re-assign them to free valid GPIOs.
3. Fix electrical logic: Ensure pull-ups are noted where required and relay signals do not conflict.
4. Categorize correctly: 5V and GND lines must be categorized correctly as power/ground, not as GPIO.
5. You must strictly follow standard ESP32/ESP8266 GPIO pinout standards.
6. Also assign appropriate "boardOrIc" values (Master Controller, Slave Controller, or MCP23017 Extender) if needed for expansion.
7. Format & Typo Correction: Strictly enforce exact pin naming syntax. If an expander pin is incomplete or malformed (e.g., missing its numeric index like 'GPA' instead of 'GPA0'), you MUST fix it to a valid, complete pin format (GPA0-GPA7 or GPB0-GPB7). Scan all pin strings for missing numbers or typos and ensure 100% perfect adherence to standard ESP32 and MCP23017 naming conventions.

Input Wiring:
${JSON.stringify(wiring, null, 2)}

Board: ${board}
Project: ${projectInfo}

OUTPUT ONLY STRICT JSON. Return an array of objects matching the WiringRow format. DO NOT INCLUDE ANY MARKDOWN formatting like \`\`\`json. Just the raw JSON string.`;

  const rawRes = await askGemini(prompt, undefined, false);
  try {
    return JSON.parse(rawRes.replace(/^\s*\`\`\`json\n?/i, '').replace(/\n?\`\`\`\s*$/i, '').trim());
  } catch (err: any) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
}