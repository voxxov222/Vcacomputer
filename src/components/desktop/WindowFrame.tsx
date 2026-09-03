import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { OSWindow } from '../../types/os';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import {
  Minus,
  Square,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Folder,
  Globe,
  Terminal as TermIcon,
  Code2,
  FileText,
  Table,
  Presentation,
  Mail,
  Calendar,
  CheckSquare,
  GitFork,
  Brain,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Lock,
  Unlock,
  Activity,
  Cpu,
  Settings,
  SlidersHorizontal,
  ChevronsUp,
  ChevronsDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Eye,
  MoreHorizontal,
  GripHorizontal,
  Move,
  Crosshair
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4 text-cyan-400" />,
  Folder: <Folder className="w-4 h-4 text-blue-400" />,
  Globe: <Globe className="w-4 h-4 text-indigo-400" />,
  Terminal: <TermIcon className="w-4 h-4 text-emerald-400" />,
  Code2: <Code2 className="w-4 h-4 text-teal-400" />,
  FileText: <FileText className="w-4 h-4 text-sky-400" />,
  Table: <Table className="w-4 h-4 text-emerald-500" />,
  Presentation: <Presentation className="w-4 h-4 text-amber-400" />,
  Mail: <Mail className="w-4 h-4 text-rose-400" />,
  Calendar: <Calendar className="w-4 h-4 text-red-400" />,
  CheckSquare: <CheckSquare className="w-4 h-4 text-orange-400" />,
  GitFork: <GitFork className="w-4 h-4 text-purple-400" />,
  Brain: <Brain className="w-4 h-4 text-pink-400" />,
  Layers: <Layers className="w-4 h-4 text-cyan-300" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-teal-300" />,
  Cpu: <Cpu className="w-4 h-4 text-cyan-400" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4 text-yellow-400" />,
  Lock: <Lock className="w-4 h-4 text-amber-500" />,
  Activity: <Activity className="w-4 h-4 text-emerald-300" />,
  Settings: <Settings className="w-4 h-4 text-slate-400" />
};

type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';

interface WindowFrameProps {
  window: OSWindow;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    setWindowOpacity,
    updateWindowBounds,
    snapWindow,
    centerWindow,
    moveWindowBy,
    windows
  } = useOS();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'maximize' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [activeResizeDir, setActiveResizeDir] = useState<ResizeDirection | null>(null);
  const [showOpacityPopover, setShowOpacityPopover] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [pinchInfo, setPinchInfo] = useState<{ width: number; height: number; scale: number } | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number; winW: number; winH: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: win.x,
    winY: win.y,
    winW: win.width,
    winH: win.height
  });

  const resizeStartRef = useRef<{
    dir: ResizeDirection;
    mouseX: number;
    mouseY: number;
    winX: number;
    winY: number;
    winW: number;
    winH: number;
  }>({
    dir: 'se',
    mouseX: 0,
    mouseY: 0,
    winX: win.x,
    winY: win.y,
    winW: win.width,
    winH: win.height
  });

  const pinchStartRef = useRef<{
    initialDist: number;
    initialWinX: number;
    initialWinY: number;
    initialWidth: number;
    initialHeight: number;
    midX: number;
    midY: number;
  }>({
    initialDist: 0,
    initialWinX: win.x,
    initialWinY: win.y,
    initialWidth: win.width,
    initialHeight: win.height,
    midX: 0,
    midY: 0
  });

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowOpacityPopover(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-Touch Pinch-to-Zoom Gesture on Window
  useEffect(() => {
    const el = windowRef.current;
    if (!el || win.isLocked) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        focusWindow(win.id);
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = getDistance(t1, t2);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        pinchStartRef.current = {
          initialDist: Math.max(dist, 1),
          initialWinX: win.x,
          initialWinY: win.y,
          initialWidth: win.width,
          initialHeight: win.height,
          midX,
          midY
        };
        setIsPinching(true);
        setPinchInfo({ width: win.width, height: win.height, scale: 1.0 });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching) {
        if (e.cancelable) e.preventDefault();

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = getDistance(t1, t2);
        const { initialDist, initialWinX, initialWinY, initialWidth, initialHeight, midX, midY } = pinchStartRef.current;

        if (initialDist < 10) return;

        const scale = currentDist / initialDist;
        const minW = 340;
        const minH = 200;
        const maxW = window.innerWidth - 20;
        const maxH = window.innerHeight - 45;

        const targetW = Math.min(maxW, Math.max(minW, Math.round(initialWidth * scale)));
        const targetH = Math.min(maxH, Math.max(minH, Math.round(initialHeight * scale)));

        // Scale outward/inward anchored around the pinch midpoint
        const relMidX = initialWidth > 0 ? (midX - initialWinX) / initialWidth : 0.5;
        const relMidY = initialHeight > 0 ? (midY - initialWinY) / initialHeight : 0.5;

        const targetX = Math.min(window.innerWidth - 60, Math.max(0, Math.round(midX - relMidX * targetW)));
        const targetY = Math.min(window.innerHeight - 60, Math.max(34, Math.round(midY - relMidY * targetH)));

        updateWindowBounds(win.id, { x: targetX, y: targetY, width: targetW, height: targetH });
        setPinchInfo({ width: targetW, height: targetH, scale: Number(scale.toFixed(2)) });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && isPinching) {
        setIsPinching(false);
        setPinchInfo(null);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [win.id, win.x, win.y, win.width, win.height, isPinching, focusWindow, updateWindowBounds]);

  // Trackpad Pinch-to-Zoom (Ctrl + Wheel) on Window
  useEffect(() => {
    const el = windowRef.current;
    if (!el || win.isLocked) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        focusWindow(win.id);

        const zoomDelta = -e.deltaY * 0.005;
        const factor = Math.max(0.8, Math.min(1.2, 1 + zoomDelta));

        const minW = 340;
        const minH = 200;
        const maxW = window.innerWidth - 20;
        const maxH = window.innerHeight - 45;

        const targetW = Math.min(maxW, Math.max(minW, Math.round(win.width * factor)));
        const targetH = Math.min(maxH, Math.max(minH, Math.round(win.height * factor)));

        const cursorX = e.clientX;
        const cursorY = e.clientY;
        const relX = (cursorX - win.x) / win.width;
        const relY = (cursorY - win.y) / win.height;

        const targetX = Math.min(window.innerWidth - 60, Math.max(0, Math.round(cursorX - relX * targetW)));
        const targetY = Math.min(window.innerHeight - 60, Math.max(34, Math.round(cursorY - relY * targetH)));

        updateWindowBounds(win.id, { x: targetX, y: targetY, width: targetW, height: targetH });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [win.id, win.x, win.y, win.width, win.height, focusWindow, updateWindowBounds]);

  // Keyboard Arrow Key Window Moving (Alt + Arrow or Shift + Arrow)
  useEffect(() => {
    if (!win.isFocused || win.isMinimized || win.isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('.monaco-editor'))
      ) {
        if (!e.altKey) return;
      }

      if (e.altKey || (e.ctrlKey && e.shiftKey)) {
        const step = e.shiftKey ? 50 : 25;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveWindowBy(win.id, -step, 0);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveWindowBy(win.id, step, 0);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveWindowBy(win.id, 0, -step);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveWindowBy(win.id, 0, step);
        } else if (e.key.toLowerCase() === 'c' && e.altKey) {
          e.preventDefault();
          centerWindow(win.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [win.id, win.isFocused, win.isMinimized, moveWindowBy, centerWindow]);

  // Handle Dragging Title Bar (Mouse & Touch with Full Screen Freedom & Edge Snapping)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      // Allow free positioning across the screen, keeping titlebar accessible
      const minX = -dragStartRef.current.winW + 80;
      const maxX = window.innerWidth - 80;
      const minY = 34;
      const maxY = window.innerHeight - 50;

      const newX = Math.max(minX, Math.min(maxX, dragStartRef.current.winX + dx));
      const newY = Math.max(minY, Math.min(maxY, dragStartRef.current.winY + dy));

      updateWindowBounds(win.id, {
        x: newX,
        y: newY,
        width: dragStartRef.current.winW,
        height: dragStartRef.current.winH
      });
      setDragCoords({ x: Math.round(newX), y: Math.round(newY) });

      // Edge snapping zones preview
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const edgeThreshold = 24;

      if (e.clientY < 38) {
        setSnapPreview('maximize');
      } else if (e.clientX < edgeThreshold) {
        if (e.clientY < screenH * 0.3) {
          setSnapPreview('top-left');
        } else if (e.clientY > screenH * 0.7) {
          setSnapPreview('bottom-left');
        } else {
          setSnapPreview('left');
        }
      } else if (e.clientX > screenW - edgeThreshold) {
        if (e.clientY < screenH * 0.3) {
          setSnapPreview('top-right');
        } else if (e.clientY > screenH * 0.7) {
          setSnapPreview('bottom-right');
        } else {
          setSnapPreview('right');
        }
      } else {
        setSnapPreview(null);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.mouseX;
        const dy = touch.clientY - dragStartRef.current.mouseY;

        const minX = -dragStartRef.current.winW + 80;
        const maxX = window.innerWidth - 80;
        const minY = 34;
        const maxY = window.innerHeight - 50;

        const newX = Math.max(minX, Math.min(maxX, dragStartRef.current.winX + dx));
        const newY = Math.max(minY, Math.min(maxY, dragStartRef.current.winY + dy));

        updateWindowBounds(win.id, {
          x: newX,
          y: newY,
          width: dragStartRef.current.winW,
          height: dragStartRef.current.winH
        });
        setDragCoords({ x: Math.round(newX), y: Math.round(newY) });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      setDragCoords(null);

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const edgeThreshold = 24;

      if (e.clientY < 38) {
        maximizeWindow(win.id);
      } else if (e.clientX < edgeThreshold) {
        if (e.clientY < screenH * 0.3) {
          snapWindow(win.id, 'top-left');
        } else if (e.clientY > screenH * 0.7) {
          snapWindow(win.id, 'bottom-left');
        } else {
          snapWindow(win.id, 'left');
        }
      } else if (e.clientX > screenW - edgeThreshold) {
        if (e.clientY < screenH * 0.3) {
          snapWindow(win.id, 'top-right');
        } else if (e.clientY > screenH * 0.7) {
          snapWindow(win.id, 'bottom-right');
        } else {
          snapWindow(win.id, 'right');
        }
      }
      setSnapPreview(null);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setDragCoords(null);
      setSnapPreview(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, win.id, updateWindowBounds, snapWindow, maximizeWindow]);

  // Handle Multi-Directional Resizing (Corners & Edges with Mouse & Touch)
  useEffect(() => {
    if (!activeResizeDir) return;

    const performResize = (clientX: number, clientY: number) => {
      const { dir, mouseX, mouseY, winX, winY, winW, winH } = resizeStartRef.current;
      const dx = clientX - mouseX;
      const dy = clientY - mouseY;

      const minW = 340;
      const minH = 200;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let newX = winX;
      let newY = winY;
      let newW = winW;
      let newH = winH;

      // Horizontal resize
      if (dir === 'e' || dir === 'se' || dir === 'ne') {
        newW = Math.max(minW, Math.min(screenW - winX, winW + dx));
      } else if (dir === 'w' || dir === 'sw' || dir === 'nw') {
        const proposedW = winW - dx;
        if (proposedW >= minW) {
          newX = Math.max(0, winX + dx);
          newW = proposedW;
        } else {
          newW = minW;
          newX = winX + (winW - minW);
        }
      }

      // Vertical resize
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        newH = Math.max(minH, Math.min(screenH - winY - 40, winH + dy));
      } else if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        const proposedH = winH - dy;
        if (proposedH >= minH) {
          newY = Math.max(34, winY + dy);
          newH = proposedH;
        } else {
          newH = minH;
          newY = winY + (winH - minH);
        }
      }

      updateWindowBounds(win.id, { x: newX, y: newY, width: newW, height: newH });
    };

    const handleMouseMove = (e: MouseEvent) => {
      performResize(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        performResize(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setActiveResizeDir(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [activeResizeDir, win.id, updateWindowBounds]);

  const startResize = (e: React.MouseEvent | React.TouchEvent, dir: ResizeDirection) => {
    if (win.isLocked) return;
    e.stopPropagation();
    focusWindow(win.id);
    setActiveResizeDir(dir);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeStartRef.current = {
      dir,
      mouseX: clientX,
      mouseY: clientY,
      winX: win.x,
      winY: win.y,
      winW: win.width,
      winH: win.height
    };
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (win.isLocked) return;
    focusWindow(win.id);
    setIsDragging(true);

    let startX = win.x;
    let startY = win.y;
    let startW = win.width;
    let startH = win.height;

    // Smooth unmaximize when dragging titlebar of maximized window
    if (win.isMaximized) {
      const prevW = win.prevBounds?.width || 860;
      const prevH = win.prevBounds?.height || 560;
      const screenW = window.innerWidth;
      const ratio = Math.max(0.1, Math.min(0.9, clientX / Math.max(screenW, 1)));
      const targetX = Math.max(10, Math.min(screenW - prevW - 10, Math.round(clientX - ratio * prevW)));
      const targetY = Math.max(36, clientY - 20);

      startX = targetX;
      startY = targetY;
      startW = prevW;
      startH = prevH;

      updateWindowBounds(win.id, { x: targetX, y: targetY, width: prevW, height: prevH, isMaximized: false });
    }

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      winX: startX,
      winY: startY,
      winW: startW,
      winH: startH
    };
    setDragCoords({ x: Math.round(startX), y: Math.round(startY) });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(win.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  if (win.isMinimized) return null;

  const currentOpacity = win.opacity ?? 1;
  const opacityPercent = Math.round(currentOpacity * 100);

  // Determine if this window is currently topmost or bottommost
  const nonMinWindows = windows.filter((w) => !w.isMinimized);
  const maxZ = Math.max(...nonMinWindows.map((w) => w.zIndex), 0);
  const minZ = Math.min(...nonMinWindows.map((w) => w.zIndex), 9999);
  const isTopmost = win.zIndex >= maxZ && nonMinWindows.length > 1;
  const isBottommost = win.zIndex <= minZ && nonMinWindows.length > 1;

  return (
    <>
      {/* Magnetic Snap Preview Guidelines */}
      {isDragging && snapPreview && (
        <div
          className={`fixed pointer-events-none z-[9998] border-2 border-cyan-400 bg-cyan-500/15 backdrop-blur-xs rounded-xl shadow-2xl shadow-cyan-500/30 transition-all duration-75 animate-pulse ${
            snapPreview === 'maximize'
              ? 'top-[36px] left-2 right-2 h-[calc(100vh-100px)]'
              : snapPreview === 'left'
              ? 'top-[36px] left-2 w-[calc(50vw-8px)] h-[calc(100vh-100px)]'
              : snapPreview === 'right'
              ? 'top-[36px] right-2 left-[calc(50vw+8px)] h-[calc(100vh-100px)]'
              : snapPreview === 'top-left'
              ? 'top-[36px] left-2 w-[calc(50vw-8px)] h-[calc((100vh-100px)/2)]'
              : snapPreview === 'top-right'
              ? 'top-[36px] right-2 left-[calc(50vw+8px)] h-[calc((100vh-100px)/2)]'
              : snapPreview === 'bottom-left'
              ? 'bottom-[64px] left-2 w-[calc(50vw-8px)] h-[calc((100vh-100px)/2)]'
              : 'bottom-[64px] right-2 left-[calc(50vw+8px)] h-[calc((100vh-100px)/2)]'
          }`}
        >
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/95 text-cyan-300 border border-cyan-400/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold shadow-xl flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>
              Snap:{' '}
              {snapPreview === 'maximize'
                ? 'Full Screen'
                : snapPreview === 'left'
                ? 'Left 50%'
                : snapPreview === 'right'
                ? 'Right 50%'
                : snapPreview.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div
        ref={windowRef}
        id={`window-${win.id}`}
        onClick={() => focusWindow(win.id)}
        style={{
          transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
          width: `${win.width}px`,
          height: `${win.height}px`,
          zIndex: win.zIndex,
          opacity: currentOpacity,
          touchAction: 'none'
        }}
        className={`fixed top-0 left-0 flex flex-col rounded-xl overflow-hidden border shadow-2xl select-none ${
          isDragging || activeResizeDir !== null ? 'transition-none' : 'transition-all duration-75'
        } ${
          isPinching
            ? 'ring-2 ring-cyan-400 shadow-cyan-500/50 scale-[1.005]'
            : isDragging
            ? 'ring-2 ring-cyan-400/80 border-cyan-500/60 shadow-cyan-950/60 shadow-2xl scale-[1.002]'
            : win.isFocused
            ? 'border-slate-600/90 shadow-cyan-950/40 ring-1 ring-cyan-500/30'
            : 'border-slate-800/80 shadow-black/80'
        } bg-slate-950/90 backdrop-blur-xl`}
      >
        {/* Transparent Event Shield when dragging/resizing over iframes/complex DOM */}
        {(isDragging || activeResizeDir !== null) && (
          <div className="absolute inset-0 z-40 bg-transparent cursor-grabbing" />
        )}

        {/* Live Drag Coordinates Badge */}
        {isDragging && dragCoords && (
          <div className="absolute top-2 right-28 pointer-events-none z-50 bg-slate-900/95 border border-cyan-400/80 text-cyan-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md">
            <Crosshair className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
            <span>
              {dragCoords.x}px, {dragCoords.y}px
            </span>
          </div>
        )}

        {/* Visual Live Pinch Feedback Badge */}
        {isPinching && pinchInfo && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-cyan-950/20 backdrop-blur-[1px]">
            <div className="bg-slate-900/95 border border-cyan-400 text-cyan-300 px-3.5 py-1.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Pinch Zoom: {pinchInfo.width} × {pinchInfo.height} ({Math.round(pinchInfo.scale * 100)}%)
              </span>
            </div>
          </div>
        )}

        {/* Window Header Bar */}
        <div
          onMouseDown={(e) => {
            if (
              e.target instanceof HTMLButtonElement ||
              (e.target as HTMLElement).closest('button') ||
              (e.target as HTMLElement).closest('input') ||
              (e.target as HTMLElement).closest('[data-no-drag]')
            )
              return;
            startDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              if (
                e.target instanceof HTMLButtonElement ||
                (e.target as HTMLElement).closest('button') ||
                (e.target as HTMLElement).closest('input') ||
                (e.target as HTMLElement).closest('[data-no-drag]')
              )
                return;
              const touch = e.touches[0];
              startDrag(touch.clientX, touch.clientY);
            }
          }}
          onDoubleClick={() => maximizeWindow(win.id)}
          onContextMenu={handleContextMenu}
          className={`h-10 border-b px-3 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0 transition-colors ${
            isDragging
              ? 'bg-slate-900 border-cyan-500/60 text-cyan-200'
              : win.isFocused
              ? 'bg-slate-900/95 border-slate-700/80 text-slate-100'
              : 'bg-slate-900/70 border-slate-800/70 text-slate-400'
          }`}
        >
        {/* Left: Traffic Light Buttons & Quick Z-Order Controls */}
        <div className="flex items-center gap-2">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-1 bg-slate-950/40 px-1.5 py-1 rounded-full border border-slate-800/80">
            {/* Close */}
            <button
              id={`win-close-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                closeWindow(win.id);
              }}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-400 active:scale-90 flex items-center justify-center text-rose-950 hover:text-black shadow-sm shadow-rose-950/60 transition cursor-pointer"
              title="Close window (Ctrl+W)"
            >
              <X className="w-2.5 h-2.5 opacity-70 hover:opacity-100 transition-opacity" />
            </button>

            {/* Minimize */}
            <button
              id={`win-min-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                minimizeWindow(win.id);
              }}
              className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 flex items-center justify-center text-amber-950 hover:text-black shadow-sm shadow-amber-950/60 transition cursor-pointer"
              title="Minimize window"
            >
              <Minus className="w-2.5 h-2.5 opacity-70 hover:opacity-100 transition-opacity" />
            </button>

            {/* Maximize / Restore */}
            <button
              id={`win-max-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                maximizeWindow(win.id);
              }}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 flex items-center justify-center text-emerald-950 hover:text-black shadow-sm shadow-emerald-950/60 transition cursor-pointer"
              title={win.isMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {win.isMaximized ? (
                <Minimize2 className="w-2.5 h-2.5 opacity-70 hover:opacity-100 transition-opacity" />
              ) : (
                <Maximize2 className="w-2.5 h-2.5 opacity-70 hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Lock Window */}
            <button
              id={`win-lock-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateWindowBounds(win.id, {
                  x: win.x,
                  y: win.y,
                  width: win.width,
                  height: win.height,
                  isMaximized: win.isMaximized,
                  isLocked: !win.isLocked
                });
              }}
              className={`w-3.5 h-3.5 rounded-full ${
                win.isLocked
                  ? 'bg-gradient-to-br from-green-400 to-green-600 border border-green-300 text-green-950 shadow-green-950/60'
                  : 'bg-gradient-to-br from-red-400 to-red-600 border border-red-400 text-red-950 shadow-red-950/60'
              } active:scale-90 flex items-center justify-center hover:text-black shadow-sm transition cursor-pointer`}
              title={win.isLocked ? 'Unlock Window' : 'Lock Window'}
            >
              {win.isLocked ? (
                <Lock className="w-2 h-2 opacity-80 hover:opacity-100 transition-opacity drop-shadow-sm" />
              ) : (
                <Unlock className="w-2 h-2 opacity-80 hover:opacity-100 transition-opacity drop-shadow-sm" />
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Front / Back Layer Controls */}
          <div className="flex items-center gap-0.5 bg-slate-800/60 rounded-md p-0.5 border border-slate-700/50">
            {/* Bring to Front */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                bringToFront(win.id);
              }}
              disabled={isTopmost}
              className={`p-1 rounded flex items-center gap-1 text-[11px] font-medium transition ${
                isTopmost
                  ? 'text-slate-600 cursor-default'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-700/80 active:scale-95'
              }`}
              title="Bring Window to Front (Topmost Layer)"
            >
              <ArrowUpToLine className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline text-[10px]">Front</span>
            </button>

            {/* Send to Back */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendToBack(win.id);
              }}
              disabled={isBottommost}
              className={`p-1 rounded flex items-center gap-1 text-[11px] font-medium transition ${
                isBottommost
                  ? 'text-slate-600 cursor-default'
                  : 'text-slate-300 hover:text-indigo-300 hover:bg-slate-700/80 active:scale-95'
              }`}
              title="Send Window to Back (Behind other windows)"
            >
              <ArrowDownToLine className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline text-[10px]">Back</span>
            </button>
          </div>
        </div>

        {/* Center: Title, Icon & Grip Handle */}
        <div
          onMouseDown={(e) => {
            if (
              e.target instanceof HTMLButtonElement ||
              (e.target as HTMLElement).closest('button') ||
              (e.target as HTMLElement).closest('input') ||
              (e.target as HTMLElement).closest('[data-no-drag]')
            )
              return;
            startDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              if (
                e.target instanceof HTMLButtonElement ||
                (e.target as HTMLElement).closest('button') ||
                (e.target as HTMLElement).closest('input') ||
                (e.target as HTMLElement).closest('[data-no-drag]')
              )
                return;
              const touch = e.touches[0];
              startDrag(touch.clientX, touch.clientY);
            }
          }}
          className="flex-1 flex items-center justify-center sm:justify-start gap-2 text-slate-200 text-xs font-semibold tracking-tight truncate px-2 cursor-grab active:cursor-grabbing group min-w-0"
          title="Click and drag anywhere to move window freely around screen (or Alt + Arrows)"
        >
          <div className="text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center shrink-0">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="shrink-0">{iconMap[win.icon] || <Layers className="w-4 h-4 text-cyan-400" />}</div>
          <span className="truncate select-none font-medium">{win.title}</span>
          {opacityPercent < 100 && (
            <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 rounded font-mono shrink-0">
              {opacityPercent}%
            </span>
          )}
        </div>

        {/* Right: Transparency Slider Toggle & Quick Tools */}
        <div className="flex items-center gap-1.5 text-slate-400 relative">
          {/* Opacity / Transparency Slider Button */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                focusWindow(win.id);
                setShowOpacityPopover(!showOpacityPopover);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                showOpacityPopover || opacityPercent < 100
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/50'
              }`}
              title="Adjust Window Transparency / Opacity"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span className="font-mono text-[10px]">{opacityPercent}%</span>
            </button>

            {/* Floating Transparency Slider Popover */}
            {showOpacityPopover && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 w-60 p-3 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Window Opacity</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-xs font-bold">{opacityPercent}%</span>
                </div>

                {/* Range Slider */}
                <div className="space-y-1 mb-3">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="1"
                    value={opacityPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setWindowOpacity(win.id, val / 100);
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>20% Sheer</span>
                    <span>100% Solid</span>
                  </div>
                </div>

                {/* Quick Opacity Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: '100%', val: 1.0 },
                    { label: '85%', val: 0.85 },
                    { label: '65%', val: 0.65 },
                    { label: '40%', val: 0.4 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setWindowOpacity(win.id, preset.val)}
                      className={`py-1 text-[10px] font-medium rounded border transition ${
                        Math.abs(currentOpacity - preset.val) < 0.05
                          ? 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Snap Quick Actions */}
          <div className="flex items-center gap-0.5 bg-slate-800/60 rounded-md p-0.5 border border-slate-700/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                snapWindow(win.id, 'left');
              }}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 text-[10px] font-mono transition"
              title="Snap Left Half"
            >
              ◧
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                snapWindow(win.id, 'right');
              }}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 text-[10px] font-mono transition"
              title="Snap Right Half"
            >
              ◨
            </button>
          </div>

          {/* Context Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              focusWindow(win.id);
              const rect = e.currentTarget.getBoundingClientRect();
              setContextMenuPos({ x: rect.left, y: rect.bottom + 4 });
              setShowContextMenu(!showContextMenu);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
            title="Window Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Direct Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              closeWindow(win.id);
            }}
            className="p-1 hover:bg-rose-500/20 hover:text-rose-300 rounded text-slate-400 hover:border-rose-500/30 transition ml-0.5"
            title="Close window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Titlebar Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          style={{ position: 'fixed', left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px`, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
          className="w-52 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl p-1.5 backdrop-blur-2xl text-xs text-slate-200 animate-in fade-in duration-75"
        >
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Move & Position
          </div>
          <button
            onClick={() => {
              centerWindow(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded text-left transition"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center on Screen (Alt+C)</span>
          </button>
          <div className="grid grid-cols-2 gap-1 px-1 my-1">
            <button
              onClick={() => {
                snapWindow(win.id, 'left');
                setShowContextMenu(false);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center justify-center gap-1 font-mono transition"
            >
              <span>◧ Left 50%</span>
            </button>
            <button
              onClick={() => {
                snapWindow(win.id, 'right');
                setShowContextMenu(false);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center justify-center gap-1 font-mono transition"
            >
              <span>◨ Right 50%</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 px-1 mb-1">
            <button
              onClick={() => {
                snapWindow(win.id, 'top-left');
                setShowContextMenu(false);
              }}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center justify-center transition"
              title="Top-Left Quadrant"
            >
              ↖ TL
            </button>
            <button
              onClick={() => {
                snapWindow(win.id, 'top-right');
                setShowContextMenu(false);
              }}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center justify-center transition"
              title="Top-Right Quadrant"
            >
              ↗ TR
            </button>
            <button
              onClick={() => {
                snapWindow(win.id, 'bottom-left');
                setShowContextMenu(false);
              }}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center justify-center transition"
              title="Bottom-Left Quadrant"
            >
              ↙ BL
            </button>
            <button
              onClick={() => {
                snapWindow(win.id, 'bottom-right');
                setShowContextMenu(false);
              }}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center justify-center transition"
              title="Bottom-Right Quadrant"
            >
              ↘ BR
            </button>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Layer & Stacking
          </div>
          <button
            onClick={() => {
              bringToFront(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded text-left transition"
          >
            <ArrowUpToLine className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bring to Front (Top)</span>
          </button>
          <button
            onClick={() => {
              sendToBack(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-indigo-500/20 hover:text-indigo-300 rounded text-left transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-400" />
            <span>Send to Back (Bottom)</span>
          </button>
          <button
            onClick={() => {
              bringForward(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
          >
            <ChevronsUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Step Forward (+1 Layer)</span>
          </button>
          <button
            onClick={() => {
              sendBackward(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
          >
            <ChevronsDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Step Backward (-1 Layer)</span>
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Transparency Presets
          </div>
          <div className="grid grid-cols-4 gap-1 px-1 mb-1">
            {[1.0, 0.85, 0.65, 0.4].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setWindowOpacity(win.id, v);
                  setShowContextMenu(false);
                }}
                className={`py-1 text-[10px] rounded border transition ${
                  Math.abs(currentOpacity - v) < 0.05
                    ? 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                }`}
              >
                {Math.round(v * 100)}%
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Window Controls
          </div>
          <button
            onClick={() => {
              maximizeWindow(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{win.isMaximized ? 'Restore Normal Size' : 'Maximize Window'}</span>
          </button>
          <button
            onClick={() => {
              minimizeWindow(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded text-left transition"
          >
            <Minus className="w-3.5 h-3.5 text-amber-400" />
            <span>Minimize</span>
          </button>
          <button
            onClick={() => {
              closeWindow(win.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded text-left transition"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Close Window</span>
          </button>
        </div>
      )}

      {/* Window Body */}
      <div className="flex-1 overflow-auto relative bg-slate-950/95 text-slate-100 select-text">
        <AppErrorBoundary appName={win.title}>
          {children}
        </AppErrorBoundary>
      </div>

      {/* --- 8-WAY CORNER & EDGE RESIZE HANDLERS --- */}
      {!win.isMaximized && !win.isLocked && (
        <>
          {/* Top Edge */}
          <div
            onMouseDown={(e) => startResize(e, 'n')}
            onTouchStart={(e) => startResize(e, 'n')}
            className="absolute top-0 left-3 right-3 h-2 cursor-n-resize hover:bg-cyan-500/40 transition z-20"
            title="Drag to resize height"
          />

          {/* Bottom Edge */}
          <div
            onMouseDown={(e) => startResize(e, 's')}
            onTouchStart={(e) => startResize(e, 's')}
            className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize hover:bg-cyan-500/40 transition z-20"
            title="Drag to resize height"
          />

          {/* Left Edge */}
          <div
            onMouseDown={(e) => startResize(e, 'w')}
            onTouchStart={(e) => startResize(e, 'w')}
            className="absolute top-3 bottom-3 left-0 w-2 cursor-w-resize hover:bg-cyan-500/40 transition z-20"
            title="Drag to resize width"
          />

          {/* Right Edge */}
          <div
            onMouseDown={(e) => startResize(e, 'e')}
            onTouchStart={(e) => startResize(e, 'e')}
            className="absolute top-3 bottom-3 right-0 w-2 cursor-e-resize hover:bg-cyan-500/40 transition z-20"
            title="Drag to resize width"
          />

          {/* Top-Left Corner */}
          <div
            onMouseDown={(e) => startResize(e, 'nw')}
            onTouchStart={(e) => startResize(e, 'nw')}
            className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize z-30 group flex items-start justify-start p-0.5"
            title="Drag corner to increase or decrease size"
          >
            <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-slate-600 rounded-tl-sm group-hover:border-cyan-400 group-hover:scale-125 transition" />
          </div>

          {/* Top-Right Corner */}
          <div
            onMouseDown={(e) => startResize(e, 'ne')}
            onTouchStart={(e) => startResize(e, 'ne')}
            className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize z-30 group flex items-start justify-end p-0.5"
            title="Drag corner to increase or decrease size"
          >
            <div className="w-2.5 h-2.5 border-t-2 border-r-2 border-slate-600 rounded-tr-sm group-hover:border-cyan-400 group-hover:scale-125 transition" />
          </div>

          {/* Bottom-Left Corner */}
          <div
            onMouseDown={(e) => startResize(e, 'sw')}
            onTouchStart={(e) => startResize(e, 'sw')}
            className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize z-30 group flex items-end justify-start p-0.5"
            title="Drag corner to increase or decrease size"
          >
            <div className="w-3 h-3 border-b-2 border-l-2 border-slate-500 rounded-bl-sm group-hover:border-cyan-400 group-hover:scale-125 transition" />
          </div>

          {/* Bottom-Right Corner (Primary Grab Handle) */}
          <div
            onMouseDown={(e) => startResize(e, 'se')}
            onTouchStart={(e) => startResize(e, 'se')}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-30 group flex items-end justify-end p-1"
            title="Drag corner to increase or decrease size"
          >
            <div className="flex flex-col gap-0.5 items-end">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
                <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};

