import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Maximize2,
  Grid,
  Columns,
  Rows,
  LayoutGrid,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Camera,
  Terminal,
  Settings,
  DownloadCloud,
  ChevronDown,
  Monitor,
  Check,
  RefreshCw,
  MoveHorizontal,
  ExternalLink,
  Eye,
  Sliders,
  X,
  ChevronRight,
  PanelTop,
  Maximize,
  Edit3
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { ScreenLayout, VirtualScreen, AppId } from '../../types/os';
import { APPS_REGISTRY } from '../../lib/appsRegistry';

interface MultiScreenWorkspaceProps {
  renderAppContent: (appId: string, payload?: any) => React.ReactNode;
}

export const MultiScreenWorkspace: React.FC<MultiScreenWorkspaceProps> = ({ renderAppContent }) => {
  const {
    screens,
    activeScreenIndex,
    setActiveScreenIndex,
    addScreen,
    removeScreen,
    setScreenLayout,
    setSplitApp,
    renameScreen,
    isMultiScreenOverviewOpen,
    setMultiScreenOverviewOpen,
    openWindow,
    workspaceHeaderMode,
    setWorkspaceHeaderMode,
    isWorkspaceMenuOpen,
    setWorkspaceMenuOpen
  } = useOS();

  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  const currentScreen: VirtualScreen = screens[activeScreenIndex] || screens[0] || {
    id: 'screen-1',
    name: 'Screen 1',
    layout: 'floating',
    splitApps: ['vca']
  };

  const handleStartRename = () => {
    setRenameValue(currentScreen.name);
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    if (renameValue.trim()) {
      renameScreen(activeScreenIndex, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const availableApps = Object.values(APPS_REGISTRY);

  const getLayoutIcon = (layout: ScreenLayout) => {
    switch (layout) {
      case 'split-2-h':
        return <Columns className="w-4 h-4 text-cyan-400" />;
      case 'split-2-v':
        return <Rows className="w-4 h-4 text-cyan-400" />;
      case 'split-3-main-left':
      case 'split-3-cols':
        return <Grid className="w-4 h-4 text-cyan-400" />;
      case 'split-4-grid':
      case 'split-4-main-top':
        return <LayoutGrid className="w-4 h-4 text-cyan-400" />;
      case 'floating':
      default:
        return <Layers className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getLayoutLabel = (layout: ScreenLayout) => {
    switch (layout) {
      case 'split-2-h':
        return 'Split 2 (50/50)';
      case 'split-2-v':
        return 'Split 2 (Top/Bottom)';
      case 'split-3-main-left':
        return 'Split 3 (Master + 2)';
      case 'split-3-cols':
        return 'Split 3 Columns';
      case 'split-4-grid':
        return 'Split 4 (2x2 Quad)';
      case 'split-4-main-top':
        return 'Split 4 (Top + 3)';
      case 'floating':
      default:
        return 'Floating Windows';
    }
  };

  // Helper to render split pane header and application
  const renderSplitPane = (slotIndex: number, defaultApp: AppId = 'vca') => {
    const currentAppId = (currentScreen.splitApps?.[slotIndex] as AppId) || defaultApp;
    const currentAppMeta = APPS_REGISTRY[currentAppId] || APPS_REGISTRY['vca'];

    return (
      <div className="w-full h-full flex flex-col bg-slate-950/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Slot Top Bar */}
        <div className="h-9 bg-slate-900/90 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 truncate max-w-[140px] sm:max-w-none">
              Slot {slotIndex + 1}: {currentAppMeta.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick App Switcher Dropdown */}
            <select
              value={currentAppId}
              onChange={(e) => setSplitApp(activeScreenIndex, slotIndex, e.target.value as AppId)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-cyan-300 outline-none cursor-pointer hover:border-cyan-500 transition"
            >
              {availableApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => openWindow(currentAppId)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Pop out to floating window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slot Application View */}
        <div className="flex-1 overflow-hidden relative">
          {renderAppContent(currentAppId)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. COMPACT WORKSPACE MENU BUTTON (MOBILE & CLEAN DESKTOP)    */}
      {/* ============================================================ */}
      {workspaceHeaderMode === 'button' ? (
        <div className="absolute top-11 left-3 sm:left-4 z-30 pointer-events-auto">
          <button
            onClick={() => setWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className={`h-9 px-3 rounded-2xl backdrop-blur-xl border transition-all duration-200 flex items-center gap-2 shadow-2xl group ${
              isWorkspaceMenuOpen
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-cyan-500/20 font-bold'
                : 'bg-slate-950/85 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50 text-slate-200'
            }`}
            title="Open Workspace & Multi-Screen Manager (Up to 10 screens & split layouts)"
          >
            <div className="w-5 h-5 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              {getLayoutIcon(currentScreen.layout)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-cyan-400">Screen {activeScreenIndex + 1}:</span>
              <span className="max-w-[100px] sm:max-w-[160px] truncate">{currentScreen.name}</span>
            </div>
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-400">
              {getLayoutLabel(currentScreen.layout)}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWorkspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      ) : (
        /* ============================================================ */
        /* 2. EXPANDED WORKSPACE FLOATING TOP BAR                       */
        /* ============================================================ */
        <div className="absolute top-10 inset-x-3 sm:inset-x-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
          {/* Left: Screen Tabs (Up to 10 Screens) */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl pointer-events-auto overflow-x-auto max-w-[70vw] scrollbar-none">
            {screens.map((screen, idx) => {
              const isActive = idx === activeScreenIndex;
              return (
                <div
                  key={screen.id}
                  className={`group relative flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                  onClick={() => setActiveScreenIndex(idx)}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
                    {getLayoutIcon(screen.layout)}
                    <span>{screen.name}</span>
                  </div>

                  {screens.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScreen(idx);
                      }}
                      className={`p-0.5 rounded-md transition opacity-0 group-hover:opacity-100 ${
                        isActive ? 'hover:bg-slate-950/30 text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-rose-400'
                      }`}
                      title="Close Screen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Screen Button (Max 10) */}
            {screens.length < 10 && (
              <button
                onClick={() => addScreen()}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition flex items-center gap-1 text-xs font-semibold border border-dashed border-slate-700"
                title="Add New Screen (Up to 10)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Screen</span>
              </button>
            )}
          </div>

          {/* Right: Split Screen Layout Picker & Collapse Button */}
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl pointer-events-auto">
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                  className="bg-slate-900 text-xs px-2 py-1 rounded-lg border border-cyan-500 text-white outline-none w-36"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="px-2 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartRename}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-900 transition flex items-center gap-1"
                title="Rename Current Screen"
              >
                <Edit3 className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[120px] font-semibold">{currentScreen.name}</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-800" />

            {/* Layout Selector Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScreenLayout(activeScreenIndex, 'floating')}
                className={`p-1.5 rounded-lg transition ${
                  currentScreen.layout === 'floating'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Floating Windows Mode"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={() => setScreenLayout(activeScreenIndex, 'split-2-h')}
                className={`p-1.5 rounded-lg transition ${
                  currentScreen.layout === 'split-2-h'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Split 2 Screens (Side-by-Side 50/50)"
              >
                <Columns className="w-4 h-4" />
              </button>

              <button
                onClick={() => setScreenLayout(activeScreenIndex, 'split-2-v')}
                className={`p-1.5 rounded-lg transition ${
                  currentScreen.layout === 'split-2-v'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Split 2 Screens (Top & Bottom 50/50)"
              >
                <Rows className="w-4 h-4" />
              </button>

              <button
                onClick={() => setScreenLayout(activeScreenIndex, 'split-3-main-left')}
                className={`p-1.5 rounded-lg transition ${
                  currentScreen.layout === 'split-3-main-left'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Split 3 Screens (1 Master Left + 2 Right)"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setScreenLayout(activeScreenIndex, 'split-4-grid')}
                className={`p-1.5 rounded-lg transition ${
                  currentScreen.layout === 'split-4-grid'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Split 4 Screens (2x2 Quad Grid Matrix)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              {/* Collapse to Button Mode */}
              <button
                onClick={() => setWorkspaceHeaderMode('button')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
                title="Collapse into sleek Menu Button (Clean Desktop)"
              >
                <PanelTop className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* WORKSPACE & MULTI-SCREEN CONTROL DRAWER / MODAL              */}
      {/* ============================================================ */}
      {isWorkspaceMenuOpen && (
        <div
          onClick={() => setWorkspaceMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-start justify-center pt-16 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl p-6 flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Virtual Screens & Split Multi-View</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {screens.length}/10 Screens
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Switch between up to 10 independent virtual screens or tile up to 4 apps simultaneously
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Bar vs Button mode */}
                <button
                  onClick={() => setWorkspaceHeaderMode(workspaceHeaderMode === 'button' ? 'bar' : 'button')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <PanelTop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{workspaceHeaderMode === 'button' ? 'Expand Top Bar' : 'Use Menu Button'}</span>
                </button>

                <button
                  onClick={() => setWorkspaceMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Screens grid */}
            <div className="py-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Select Virtual Screen (1 to 10)</span>
                {screens.length < 10 && (
                  <button
                    onClick={() => addScreen()}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Screen {screens.length + 1}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {screens.map((sc, idx) => {
                  const isActive = idx === activeScreenIndex;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        setActiveScreenIndex(idx);
                        setWorkspaceMenuOpen(false);
                      }}
                      className={`group relative p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 ${
                        isActive
                          ? 'bg-slate-800/90 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-slate-800'
                        }`}>
                          {idx + 1}
                        </span>

                        {screens.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeScreen(idx);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition"
                            title="Delete Screen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white truncate">{sc.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {getLayoutIcon(sc.layout)}
                          <span className="truncate">{sc.layout}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Screen Tile */}
                {screens.length < 10 && (
                  <button
                    onClick={() => addScreen()}
                    className="p-3 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/40 hover:bg-slate-900/60 transition flex flex-col items-center justify-center gap-2 h-28 text-slate-400 hover:text-cyan-400 group"
                  >
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">New Screen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Split Screen Options for Active Screen */}
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Current Screen Layout ({currentScreen.name})
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'floating' as ScreenLayout, name: 'Floating', desc: 'Standard Desktop', icon: <Layers className="w-5 h-5 text-cyan-400" /> },
                  { id: 'split-2-h' as ScreenLayout, name: 'Split 2 Side', desc: '50/50 Columns', icon: <Columns className="w-5 h-5 text-cyan-400" /> },
                  { id: 'split-2-v' as ScreenLayout, name: 'Split 2 Rows', desc: '50/50 Top/Bottom', icon: <Rows className="w-5 h-5 text-cyan-400" /> },
                  { id: 'split-3-main-left' as ScreenLayout, name: 'Split 3 Left', desc: 'Master + 2 Stack', icon: <Grid className="w-5 h-5 text-cyan-400" /> },
                  { id: 'split-3-cols' as ScreenLayout, name: '3 Columns', desc: 'Equal Width', icon: <Grid className="w-5 h-5 text-cyan-400" /> },
                  { id: 'split-4-grid' as ScreenLayout, name: 'Split 4 Quad', desc: '2x2 Matrix', icon: <LayoutGrid className="w-5 h-5 text-cyan-400" /> }
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => {
                      setScreenLayout(activeScreenIndex, layout.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      currentScreen.layout === layout.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {layout.icon}
                    <span className="text-xs font-bold">{layout.name}</span>
                    <span className="text-[10px] text-slate-400">{layout.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Rename bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-slate-400 font-semibold">Rename:</span>
                <input
                  type="text"
                  value={renameValue || currentScreen.name}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Screen Name..."
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500 w-48"
                />
                <button
                  onClick={handleSaveRename}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition"
                >
                  Update
                </button>
              </div>

              <button
                onClick={() => setWorkspaceMenuOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition"
              >
                Close & View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SPLIT SCREEN ACTIVE WORKSPACE P用於ANES                        */}
      {/* ============================================================ */}
      {currentScreen.layout !== 'floating' && (
        <div className="absolute inset-x-2 sm:inset-x-4 top-20 sm:top-24 bottom-16 sm:bottom-20 z-10 pointer-events-auto">
          {/* 1. SPLIT 2 HORIZONTAL (50/50 Side by Side) */}
          {currentScreen.layout === 'split-2-h' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {renderSplitPane(0, 'vca')}
              {renderSplitPane(1, 'emulator')}
            </div>
          )}

          {/* 2. SPLIT 2 VERTICAL (50/50 Top & Bottom) */}
          {currentScreen.layout === 'split-2-v' && (
            <div className="w-full h-full grid grid-rows-2 gap-2 sm:gap-3">
              {renderSplitPane(0, 'vca')}
              {renderSplitPane(1, 'software_installer')}
            </div>
          )}

          {/* 3. SPLIT 3 SCREENS (1 Master Left + 2 Right) */}
          {currentScreen.layout === 'split-3-main-left' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
              <div className="md:col-span-7 h-full">
                {renderSplitPane(0, 'vca')}
              </div>
              <div className="md:col-span-5 h-full grid grid-rows-2 gap-2 sm:gap-3">
                {renderSplitPane(1, 'emulator')}
                {renderSplitPane(2, 'software_installer')}
              </div>
            </div>
          )}

          {/* 4. SPLIT 3 EQUAL COLUMNS */}
          {currentScreen.layout === 'split-3-cols' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
              {renderSplitPane(0, 'vca')}
              {renderSplitPane(1, 'emulator')}
              {renderSplitPane(2, 'engineering')}
            </div>
          )}

          {/* 5. SPLIT 4 QUAD GRID (2x2 Grid) */}
          {currentScreen.layout === 'split-4-grid' && (
            <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
              {renderSplitPane(0, 'vca')}
              {renderSplitPane(1, 'emulator')}
              {renderSplitPane(2, 'software_installer')}
              {renderSplitPane(3, 'terminal')}
            </div>
          )}

          {/* 6. SPLIT 4 MAIN TOP (1 Large Top + 3 Bottom) */}
          {currentScreen.layout === 'split-4-main-top' && (
            <div className="w-full h-full grid grid-rows-12 gap-2 sm:gap-3">
              <div className="row-span-7 w-full">
                {renderSplitPane(0, 'vca')}
              </div>
              <div className="row-span-5 w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {renderSplitPane(1, 'emulator')}
                {renderSplitPane(2, 'software_installer')}
                {renderSplitPane(3, 'terminal')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
