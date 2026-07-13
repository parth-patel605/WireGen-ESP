import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getProjectById, projectCategories } from '../data/projects';
import { getComponentById } from '../data/components';
import { getWiringForProject } from '../data/wiring';
import { detectPinConflicts } from '../utils/pinValidator';
import { copyToClipboard, downloadCode, downloadJSON, downloadCSV, exportProjectAsJSON } from '../utils/exportUtils';
import { askGemini, validateWiringWithAI, generateArduinoCode, autoFixWiring } from '../services/aiService';
import { MCP23017_PINS, I2C_RESERVED_PINS, getGpioPinsForBoard, isPowerPin } from '../data/pinData';
import PinMapVisualizer from '../components/wiring/PinMapVisualizer';
import ValidationDashboard from '../components/wiring/ValidationDashboard';
import BomGenerator from '../components/wiring/BomGenerator';
import type { WiringRow, PinConflict, BoardTarget } from '../types';

type Tab = 'overview' | 'wiring' | 'code' | 'export' | 'ai';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [wiringRows, setWiringRows] = useState<WiringRow[]>([]);
  const [ssid, setSsid] = useState('MyWiFi');
  const [password, setPassword] = useState('MyPassword');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [hasCodeGenError, setHasCodeGenError] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [codeGenProgressStatus, setCodeGenProgressStatus] = useState('');
  const [codeGenProgressDetails, setCodeGenProgressDetails] = useState('');

  const project = id ? getProjectById(id) : undefined;

  // Track recent
  useEffect(() => {
    if (id) dispatch({ type: 'ADD_RECENT', projectId: id });
  }, [id, dispatch]);

  // Load wiring when project or board changes
  useEffect(() => {
    if (!project) return;
    const saved = state.savedWirings[`${project.id}-${state.selectedBoard}`];
    if (saved) {
      setWiringRows(JSON.parse(JSON.stringify(saved.rows)));
    } else {
      setWiringRows(JSON.parse(JSON.stringify(getWiringForProject(project.componentIds, state.selectedBoard))));
    }
  }, [project, state.selectedBoard]); // Removed state.savedWirings to prevent infinite loops when auto-saving

  // Permanently and dynamically link wiringRows to the database (auto-save on change)
  useEffect(() => {
    if (!project || wiringRows.length === 0) return;
    const saved = state.savedWirings[`${project.id}-${state.selectedBoard}`];
    const rowsStr = JSON.stringify(wiringRows);
    const savedStr = saved ? JSON.stringify(saved.rows) : '';
    if (rowsStr !== savedStr) {
      dispatch({
        type: 'SAVE_WIRING',
        wiring: {
          projectId: project.id,
          board: state.selectedBoard,
          rows: JSON.parse(rowsStr),
          savedAt: new Date().toISOString(),
        },
      });
    }
  }, [wiringRows, project, state.selectedBoard, state.savedWirings, dispatch]);

  const components = useMemo(() => {
    if (!project) return [];
    return project.componentIds.map(getComponentById).filter(Boolean);
  }, [project]);

  const codeCacheKey = useMemo(() => {
    return `${project?.id}-${state.selectedBoard}-${JSON.stringify(wiringRows)}`;
  }, [project, state.selectedBoard, wiringRows]);

  const cachedAICode = state.generatedCodes[codeCacheKey];

  const generatedCode = useMemo(() => {
    if (cachedAICode) return cachedAICode;
    return '// ⏳ AI is generating updated custom code based on your latest wiring...\n// Please wait a moment.';
  }, [cachedAICode]);

  // Reset code gen error when user switches to code tab or when wiring changes
  useEffect(() => {
    if (activeTab === 'code') {
      setHasCodeGenError(false);
    }
  }, [activeTab, codeCacheKey]);

  // Dynamically re-trigger code generation when wiring state changes and user views the code tab
  useEffect(() => {
    if (activeTab === 'code' && !cachedAICode && !isGeneratingCode && !hasCodeGenError && project) {
      setIsGeneratingCode(true);
      setHasCodeGenError(false);
      setCodeGenProgressStatus('Initializing Web Worker...');
      setCodeGenProgressDetails('Preparing background thread...');
      
      generateArduinoCode(project.description, wiringRows, state.selectedBoard, (status, details) => {
        setCodeGenProgressStatus(status);
        if (details) setCodeGenProgressDetails(details);
      })
        .then(newCode => {
          dispatch({ type: 'CACHE_GENERATED_CODE', cacheKey: codeCacheKey, code: newCode });
          showToast('✨ Code automatically updated to match new wiring!');
        })
        .catch(e => {
          console.error('Auto-gen error:', e);
          setHasCodeGenError(true);
        })
        .finally(() => setIsGeneratingCode(false));
    }
  }, [activeTab, cachedAICode, codeCacheKey, wiringRows, project, state.selectedBoard,  hasCodeGenError, dispatch]);

  const conflicts: PinConflict[] = useMemo(() => {
    return detectPinConflicts(wiringRows, state.selectedBoard);
  }, [wiringRows, state.selectedBoard]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  if (!project) {
    return (
      <div className="animate-fadeIn text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2">Project not found</h2>
        <Link to="/projects" className="text-sm" style={{ color: 'var(--color-accent-cyan)' }}>← Back to Projects</Link>
      </div>
    );
  }

  const catInfo = projectCategories[project.category];
  const isFav = state.favorites.includes(project.id);

  // ─── Wiring Handlers ──────────────────────────────────────

  const updateRow = (rowId: string, field: keyof WiringRow, value: string) => {
    setWiringRows(rows => rows.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  };

  const addRow = () => {
    setWiringRows(rows => [
      ...rows,
      { id: `custom-${Date.now()}`, component: '', espPin: '', componentPin: '', notes: 'Custom wiring', boardOrIc: 'Master Controller' }
    ]);
  };

  const deleteRow = (rowId: string) => {
    setWiringRows(rows => {
      const updatedRows = rows.filter(r => r.id !== rowId);
      // Immediately persist deletion to global state
      dispatch({
        type: 'SAVE_WIRING',
        wiring: {
          projectId: project!.id,
          board: state.selectedBoard,
          rows: JSON.parse(JSON.stringify(updatedRows)),
          savedAt: new Date().toISOString(),
        },
      });
      return updatedRows;
    });
    showToast('Row deleted and saved');
  };

  const saveWiring = () => {
    dispatch({
      type: 'SAVE_WIRING',
      wiring: {
        projectId: project.id,
        board: state.selectedBoard,
        rows: JSON.parse(JSON.stringify(wiringRows)),
        savedAt: new Date().toISOString(),
      },
    });
    showToast('Wiring configuration saved!');
  };

  const resetWiring = () => {
    setWiringRows(JSON.parse(JSON.stringify(getWiringForProject(project.componentIds, state.selectedBoard))));
    showToast('Wiring reset to defaults');
  };

  // ─── Pin Selection Logic ───
  const boardOrIcOptions = ['Master Controller', 'Slave Controller', 'MCP23017 Extender'];
  const i2cReservedPins = I2C_RESERVED_PINS[state.selectedBoard];

  // Smart pin dropdown: compute used pins per target for visual feedback
  const usedPinsByTarget = useMemo(() => {
    const master = new Set<string>();
    const slave = new Set<string>();
    for (const row of wiringRows) {
      const pin = row.espPin.trim();
      if (!pin || isPowerPin(pin)) continue;
      
      const target = row.boardOrIc || 'Master Controller';
      if (target === 'Slave Controller') slave.add(pin);
      else if (target === 'Master Controller') master.add(pin);
    }
    return { master, slave };
  }, [wiringRows]);

  const gpioPinsForBoard = useMemo(() => getGpioPinsForBoard(state.selectedBoard), [state.selectedBoard]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'wiring', label: 'Wiring', icon: '🔌' },
    { key: 'code', label: 'Code', icon: '💻' },
    { key: 'export', label: 'Export', icon: '📤' },
    { key: 'ai', label: 'AI Assistant', icon: '🤖' },
  ];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Back + Header */}
      <Link to="/projects" className="text-sm no-underline mb-4 inline-block transition-colors hover:underline" style={{ color: 'var(--color-accent-cyan)' }}>
        ← Back to Projects
      </Link>

      <div className="glass rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: catInfo?.color || '#888' }} />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{catInfo?.icon}</span>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-surface-50)' }}>{project.name}</h1>
            </div>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
              {project.description}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${catInfo?.color}20`, color: catInfo?.color }}>
                {project.category}
              </span>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: project.difficulty === 'Beginner' ? 'rgba(0,230,118,0.15)' :
                              project.difficulty === 'Intermediate' ? 'rgba(255,145,0,0.15)' : 'rgba(255,23,68,0.15)',
                  color: project.difficulty === 'Beginner' ? 'var(--color-accent-green)' :
                         project.difficulty === 'Intermediate' ? 'var(--color-accent-orange)' : 'var(--color-accent-red)',
                }}
              >
                {project.difficulty}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-200)' }}>
                {state.selectedBoard}
              </span>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', projectId: project.id })}
            className="text-2xl cursor-pointer bg-transparent border-none transition-transform hover:scale-125"
          >
            {isFav ? '⭐' : '☆'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--color-surface-800)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-none"
            style={{
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,77,255,0.1))'
                : 'transparent',
              color: activeTab === tab.key ? 'var(--color-accent-cyan)' : 'var(--color-surface-300)',
              border: activeTab === tab.key ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Overview ──────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-surface-100)' }}>
            Required Components ({components.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {components.map(c => c && (
              <div key={c.id} className="glass p-4 rounded-xl glass-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: 'var(--color-surface-600)' }}
                  >
                    {c.category === 'Sensors' ? '📡' :
                     c.category === 'Actuators' ? '⚡' :
                     c.category === 'Display' ? '🖥️' :
                     c.category === 'Communication' ? '📶' :
                     c.category === 'Motor' ? '⚙️' :
                     c.category === 'Input' ? '🎛️' :
                     c.category === 'Storage' ? '💾' : '🔧'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-surface-100)' }}>{c.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--color-surface-400)' }}>{c.pinType} • {c.category}</div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
                  {c.description.slice(0, 140)}{c.description.length > 140 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Circuit Explanation */}
          <div className="glass rounded-xl p-5 mt-6">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-accent-cyan)' }}>
              📘 Circuit Explanation
            </h3>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
              <p className="mb-2">
                This project uses <strong style={{ color: 'var(--color-surface-100)' }}>{components.length} component{components.length !== 1 ? 's' : ''}</strong> connected to the <strong style={{ color: 'var(--color-surface-100)' }}>{state.selectedBoard}</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {components.map(c => c && (
                  <li key={c.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white shrink-0 overflow-hidden" style={{ border: '1px solid var(--color-glass-border)' }}>
                       {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover mix-blend-multiply" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-surface-100)' }}>{c.name}</strong> ({c.pinType}) — {c.description.split('.')[0]}.
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Switch to the <strong style={{ color: 'var(--color-accent-cyan)' }}>Wiring</strong> tab to see the exact pin connections, then go to <strong style={{ color: 'var(--color-accent-cyan)' }}>Code</strong> to get the Arduino sketch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Wiring ────────────────────────────────────── */}
      {activeTab === 'wiring' && (
        <div className="animate-fadeIn">
          {/* Validation Dashboard */}
          <ValidationDashboard wiringRows={wiringRows} board={state.selectedBoard} />

          {/* Conflict Alerts */}
          {conflicts.length > 0 && (
            <div className="mb-4 space-y-2">
              {conflicts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm"
                  style={{
                    background: c.severity === 'error' ? 'rgba(255,23,68,0.1)' : 'rgba(255,145,0,0.1)',
                    border: `1px solid ${c.severity === 'error' ? 'rgba(255,23,68,0.25)' : 'rgba(255,145,0,0.25)'}`,
                    color: c.severity === 'error' ? 'var(--color-accent-red)' : 'var(--color-accent-orange)',
                  }}
                >
                  <span>{c.severity === 'error' ? '🚫' : '⚠️'}</span>
                  <span>{c.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Architecture Info Banners */}
          {wiringRows.some(r => r.boardOrIc === 'MCP23017 Extender') && (
            <div className="mb-4 flex items-center gap-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: 'var(--color-accent-cyan)' }}>
              <span>🔌</span>
              <span><strong>MCP23017 Extender Active</strong> — I2C pins ({i2cReservedPins.join(' / ')}) are auto-reserved on the Master Controller for the expander bus. Expander rows use GPA0–GPB7 pins.</span>
            </div>
          )}
          {wiringRows.some(r => r.boardOrIc === 'Slave Controller') && (
            <div className="mb-4 flex items-center gap-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.2)', color: 'var(--color-accent-purple)' }}>
              <span>📡</span>
              <span><strong>Dual-ESP32 (ESP-NOW) Active</strong> — Code generation will produce separate Master and Slave scripts. Each controller has its own independent GPIO namespace.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={addRow} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all hover:scale-105" style={{ background: 'var(--color-accent-green)', color: '#000' }}>
              ➕ Add Row
            </button>
            <button
              onClick={async () => {
                setIsAutoFixing(true);
                try {
                  const fixedWiring = await autoFixWiring(project.description, wiringRows, state.selectedBoard);
                  setWiringRows(fixedWiring);
                  dispatch({
                    type: 'SAVE_WIRING',
                    wiring: {
                      projectId: project.id,
                      board: state.selectedBoard,
                      rows: JSON.parse(JSON.stringify(fixedWiring)),
                      savedAt: new Date().toISOString(),
                    },
                  });
                  showToast('✨ Wiring automatically fixed and saved!');
                } catch (err: any) {
                  showToast(`Error: ${err.message}`);
                }
                setIsAutoFixing(false);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-none transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-cyan))', color: '#fff' }}
              disabled={isAutoFixing}
            >
              {isAutoFixing ? '⚡ Fixing...' : '⚡ Instant Auto-Fix Conflicts'}
            </button>
            <button onClick={saveWiring} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all hover:scale-105" style={{ background: 'var(--color-accent-cyan)', color: '#000' }}>
              💾 Save Wiring
            </button>
            <button onClick={resetWiring} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all hover:scale-105" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-200)' }}>
              🔄 Reset to Default
            </button>
            <button onClick={() => { downloadCSV(wiringRows, `${project.name}-wiring`); showToast('CSV downloaded!'); }} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all hover:scale-105" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-200)' }}>
              📄 Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="wiring-table w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider border-b" style={{ borderColor: 'var(--color-glass-border)', color: 'var(--color-surface-300)' }}>
                    <th className="p-3">BOARD / IC</th>
                    <th className="p-3">Component</th>
                    <th className="p-3">Pin</th>
                    <th className="p-3">Component Pin</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {wiringRows.map(row => {
                    const isI2c = i2cReservedPins.includes(row.espPin);
                    const target = row.boardOrIc || 'Master Controller';
                    const usedMap = target === 'Slave Controller' ? usedPinsByTarget.slave : usedPinsByTarget.master;
                    const isConflict = !isPowerPin(row.espPin) && usedMap.has(row.espPin) && wiringRows.filter(r => r.espPin === row.espPin && r.espPin !== '' && (r.boardOrIc || 'Master Controller') === target).length > 1 && !isI2c;

                    return (
                      <tr key={row.id} className="border-b transition-colors" style={{ borderColor: 'var(--color-glass-border)' }}>
                        <td className="p-2">
                          <select
                            value={row.boardOrIc || 'Master Controller'}
                            onChange={(e) => updateRow(row.id, 'boardOrIc', e.target.value)}
                            className="w-full bg-transparent border-none text-xs p-1 outline-none"
                            style={{ color: 'var(--color-surface-100)' }}
                          >
                            {boardOrIcOptions.map(opt => (
                              <option key={opt} value={opt} style={{ background: 'var(--color-surface-800)' }}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2"><input className="w-full bg-transparent border-none text-xs outline-none" value={row.component} onChange={e => updateRow(row.id, 'component', e.target.value)} /></td>
                        <td className="p-2">
                          <input
                            className="w-full bg-transparent border-none text-xs outline-none"
                            value={row.espPin}
                            onChange={e => updateRow(row.id, 'espPin', e.target.value)}
                            style={{ color: isConflict ? 'var(--color-accent-red)' : 'var(--color-surface-100)' }}
                            title={isConflict ? 'Pin conflict detected on this board/IC!' : ''}
                          />
                        </td>
                        <td className="p-2"><input className="w-full bg-transparent border-none text-xs outline-none" value={row.componentPin} onChange={e => updateRow(row.id, 'componentPin', e.target.value)} /></td>
                        <td className="p-2"><input className="w-full bg-transparent border-none text-xs outline-none" value={row.notes} onChange={e => updateRow(row.id, 'notes', e.target.value)} /></td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="text-sm cursor-pointer bg-transparent border-none transition-all hover:scale-125"
                            title="Delete row"
                            style={{ color: 'var(--color-accent-red)' }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {wiringRows.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--color-surface-400)' }}>
                No wiring rows. Click "Add Row" to start configuring.
              </div>
            )}
          </div>

          {/* Pin Map Visualizer */}
          <div className="mt-5">
            <PinMapVisualizer wiringRows={wiringRows} board={state.selectedBoard} />
          </div>
        </div>
      )}

      {/* ─── TAB: Code ──────────────────────────────────────── */}
      {activeTab === 'code' && (
        <div className="animate-fadeIn">
          {/* WiFi config */}
          <div className="glass rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--color-surface-300)' }}>WiFi SSID</label>
              <input
                value={ssid}
                onChange={e => setSsid(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--color-surface-700)', color: 'var(--color-surface-100)', border: '1px solid var(--color-glass-border)', outline: 'none', fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--color-surface-300)' }}>WiFi Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--color-surface-700)', color: 'var(--color-surface-100)', border: '1px solid var(--color-glass-border)', outline: 'none', fontFamily: 'var(--font-sans)' }}
              />
            </div>
          </div>


          {/* Code Block */}
          <div className="relative">
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={() => {
                  copyToClipboard(generatedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border-none"
                style={{ background: copied ? 'var(--color-accent-green)' : 'var(--color-surface-600)', color: copied ? '#000' : 'var(--color-surface-200)' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={() => {
                  downloadCode(generatedCode, `${project.name.replace(/\s+/g, '_')}_${state.selectedBoard}`);
                  showToast('Code downloaded!');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border-none"
                style={{ background: 'var(--color-accent-cyan)', color: '#000' }}
              >
                ⬇ Download .ino
              </button>
            </div>
            <div className="code-block" style={{ minHeight: 300 }}>
              {generatedCode}
            </div>
          </div>

          {/* AI Generator Button */}
          <div className="mt-4 flex flex-col items-center justify-center p-6 rounded-xl glass border" style={{ borderColor: 'var(--color-accent-purple)30' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-surface-100)' }}>Need custom code?</h3>
            <p className="text-xs mb-4 text-center max-w-md" style={{ color: 'var(--color-surface-300)' }}>
              If you modified the wiring or added new components, you can use the Gemini AI to instantly generate a custom, compile-ready Arduino sketch for this exact configuration.
            </p>

              <button
                onClick={async () => {
                  setIsGeneratingCode(true);
                  setHasCodeGenError(false);
                  setCodeGenProgressStatus('Initializing Web Worker...');
                  setCodeGenProgressDetails('Preparing background thread...');
                  try {
                    const newCode = await generateArduinoCode(project.description, wiringRows, state.selectedBoard, (status, details) => {
                      setCodeGenProgressStatus(status);
                      if (details) setCodeGenProgressDetails(details);
                    });
                    dispatch({ type: 'CACHE_GENERATED_CODE', cacheKey: codeCacheKey, code: newCode });
                    showToast('Custom code generated successfully!');
                  } catch (e: any) {
                    showToast(`Error generating code: ${e.message}`);
                    setHasCodeGenError(true);
                  }
                  setIsGeneratingCode(false);
                }}
                className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer border-none transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-cyan))', color: '#fff' }}
                disabled={isGeneratingCode}
              >
                {isGeneratingCode ? '⏳ Generating Custom Code...' : hasCodeGenError ? '🔄 Retry Generation' : '✨ Auto-Generate Custom Code'}
              </button>
              
              {isGeneratingCode && (
                <div className="mt-3 text-center text-xs w-full">
                  <div className="font-bold" style={{ color: 'var(--color-accent-cyan)' }}>{codeGenProgressStatus}</div>
                  <div className="mt-1" style={{ color: 'var(--color-surface-400)' }}>{codeGenProgressDetails}</div>
                </div>
              )}
          </div>

          {/* Board info */}
          <div className="mt-4 text-xs text-center" style={{ color: 'var(--color-surface-400)' }}>
            Generating code for <strong style={{ color: 'var(--color-accent-cyan)' }}>{state.selectedBoard}</strong>.
            Switch board in the sidebar to see the other variant.
          </div>
        </div>
      )}

      {/* ─── TAB: Export ─────────────────────────────────────── */}
      {activeTab === 'export' && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-6 glass-hover cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => {
                const json = exportProjectAsJSON({
                  name: project.name,
                  board: state.selectedBoard,
                  components: project.componentIds,
                  wiring: wiringRows,
                  code: generatedCode,
                  libraries: Array.from(generatedCode.matchAll(/#include\s*[<"]([^>"]+)[>"]/g)).map(m => m[1]),
                });
                downloadJSON(json, `${project.name.replace(/\s+/g, '_')}.json`);
                showToast('Project exported as JSON!');
              }}
            >
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-surface-100)' }}>Export as JSON</h3>
              <p className="text-xs" style={{ color: 'var(--color-surface-300)' }}>
                Download full project configuration including wiring, code, and component list.
              </p>
            </div>

            <div className="glass rounded-xl p-6 glass-hover cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => {
                downloadCode(generatedCode, `${project.name.replace(/\s+/g, '_')}_${state.selectedBoard}`);
                showToast('Code downloaded!');
              }}
            >
              <div className="text-3xl mb-3">💻</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-surface-100)' }}>Download Code (.ino)</h3>
              <p className="text-xs" style={{ color: 'var(--color-surface-300)' }}>
                Download the Arduino sketch file ready for Arduino IDE upload.
              </p>
            </div>

            <div className="glass rounded-xl p-6 glass-hover cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => {
                downloadCSV(wiringRows, `${project.name.replace(/\s+/g, '_')}_wiring`);
                showToast('Wiring CSV downloaded!');
              }}
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-surface-100)' }}>Export Wiring (CSV)</h3>
              <p className="text-xs" style={{ color: 'var(--color-surface-300)' }}>
                Download wiring table as CSV for spreadsheets and documentation.
              </p>
            </div>

            <div className="glass rounded-xl p-6 glass-hover cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => {
                const text = `# ${project.name}\n\n## Board: ${state.selectedBoard}\n\n## Components\n${components.map(c => c ? `- ${c.name} (${c.category})` : '').join('\n')}\n\n## Wiring\n| Board/IC | Component | ESP Pin | Component Pin | Notes |\n|----------|-----------|---------|---------------|-------|\n${wiringRows.map(r => `| ${r.boardOrIc || 'Master'} | ${r.component} | ${r.espPin} | ${r.componentPin} | ${r.notes} |`).join('\n')}\n\n## Code\n\`\`\`cpp\n${generatedCode}\n\`\`\``;
                const blob = new Blob([text], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.name.replace(/\s+/g, '_')}.md`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Markdown exported!');
              }}
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-surface-100)' }}>Export as Markdown</h3>
              <p className="text-xs" style={{ color: 'var(--color-surface-300)' }}>
                Full project documentation in Markdown format.
              </p>
            </div>
          </div>

          {/* Bill of Materials */}
          <BomGenerator wiringRows={wiringRows} components={components} board={state.selectedBoard} />
        </div>
      )}

      {/* ─── TAB: AI Assistant ──────────────────────────────── */}
      {activeTab === 'ai' && (
        <div className="animate-fadeIn">
          <div className="glass rounded-xl p-6">
            <div className="flex gap-3 mb-6">
              <button
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const res = await validateWiringWithAI(project.description, wiringRows);
                    setAiResponse(res);
                  } catch (e: any) {
                    setAiResponse(`Error: ${e.message}`);
                  }
                  setAiLoading(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all hover:scale-105"
                style={{ background: 'var(--color-accent-purple)', color: '#fff' }}
                disabled={aiLoading}
              >
                {aiLoading ? 'Analyzing...' : '🔍 Validate Wiring'}
              </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ask a question about this code or wiring..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !aiLoading) {
                    setAiLoading(true);
                    askGemini(aiPrompt, `Project: ${project.name}\n${project.description}`)
                      .then(setAiResponse)
                      .catch(e => setAiResponse(`Error: ${e.message}`))
                      .finally(() => setAiLoading(false));
                  }
                }}
                className="flex-1 px-4 py-3 bg-transparent border rounded-lg text-sm outline-none"
                style={{ borderColor: 'var(--color-surface-600)', color: 'var(--color-surface-100)' }}
                disabled={aiLoading}
              />
              <button
                onClick={async () => {
                  if (!aiPrompt) return;
                  setAiLoading(true);
                  try {
                    const res = await askGemini(aiPrompt, `Project: ${project.name}\n${project.description}`);
                    setAiResponse(res);
                  } catch (e: any) {
                    setAiResponse(`Error: ${e.message}`);
                  }
                  setAiLoading(false);
                }}
                className="px-5 py-3 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all"
                style={{ background: 'var(--color-accent-cyan)', color: '#000' }}
                disabled={aiLoading}
              >
                Send
              </button>
            </div>

            {aiResponse && (
              <div className="mt-6 p-5 rounded-xl text-sm leading-relaxed" style={{ background: 'var(--color-surface-800)', border: '1px solid rgba(0,229,255,0.2)' }}>
                <div className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-accent-cyan)' }}>
                  <span>🤖</span> AI Response
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-surface-100)' }}>
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </div>
  );
}
