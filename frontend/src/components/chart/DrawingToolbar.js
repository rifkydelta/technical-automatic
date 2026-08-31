'use client';
import React, { useState } from 'react';
import { DRAWING_TOOLS } from '../../utils/chartDrawingEngine';
import {
  Crosshair,
  MousePointer2,
  Eraser,
  TrendingUp,
  Minus,
  MoveRight,
  Sliders,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Ruler,
  Type,
  Magnet,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
} from 'lucide-react';

export default function DrawingToolbar({
  activeTool,
  setActiveTool,
  isMagnet,
  setIsMagnet,
  isVisible,
  setIsVisible,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll,
  drawingsCount = 0
}) {
  const [activeFlyout, setActiveFlyout] = useState(null);

  const toggleFlyout = (group) => {
    setActiveFlyout((prev) => (prev === group ? null : group));
  };

  const handleSelectTool = (tool) => {
    setActiveTool(tool);
    setActiveFlyout(null);
  };

  const handleClearWithConfirm = () => {
    if (drawingsCount === 0) return;
    if (window.confirm(`Hapus seluruh ${drawingsCount} garis analisis pada chart ini?`)) {
      onClearAll();
    }
  };

  const isLineToolActive = [
    DRAWING_TOOLS.TRENDLINE,
    DRAWING_TOOLS.HORIZONTAL_LINE,
    DRAWING_TOOLS.HORIZONTAL_RAY,
  ].includes(activeTool);

  const isPositionToolActive = [
    DRAWING_TOOLS.POSITION_LONG,
    DRAWING_TOOLS.POSITION_SHORT,
    DRAWING_TOOLS.RULER,
  ].includes(activeTool);

  return (
    <div
      style={{
        position: 'absolute',
        top: '48px',
        left: '10px',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '5px',
        backgroundColor: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        userSelect: 'none',
      }}
    >
      {/* 1. Cursor / Crosshair */}
      <button
        onClick={() => handleSelectTool(DRAWING_TOOLS.CURSOR)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: activeTool === DRAWING_TOOLS.CURSOR ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
          color: activeTool === DRAWING_TOOLS.CURSOR ? '#38bdf8' : '#94a3b8',
          border: activeTool === DRAWING_TOOLS.CURSOR ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Kursor / Crosshair Normal"
      >
        <Crosshair size={16} />
      </button>

      {/* 2. Line Tools Group */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            if (isLineToolActive) toggleFlyout('lines');
            else handleSelectTool(DRAWING_TOOLS.TRENDLINE);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleFlyout('lines');
          }}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '7px',
            backgroundColor: isLineToolActive ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
            color: isLineToolActive ? '#38bdf8' : '#94a3b8',
            border: isLineToolActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
          title="Garis Analisis (Trendline / Horiz Line / Ray)"
        >
          {activeTool === DRAWING_TOOLS.HORIZONTAL_LINE ? (
            <Minus size={16} />
          ) : activeTool === DRAWING_TOOLS.HORIZONTAL_RAY ? (
            <MoveRight size={16} />
          ) : (
            <TrendingUp size={16} />
          )}
          <span style={{ position: 'absolute', bottom: '1px', right: '1px', fontSize: '8px', color: '#64748b' }}>▸</span>
        </button>

        {activeFlyout === 'lines' && (
          <div
            style={{
              position: 'absolute',
              left: '38px',
              top: '0',
              zIndex: 30,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              minWidth: '140px'
            }}
          >
            {[
              { id: DRAWING_TOOLS.TRENDLINE, label: 'Trend Line', icon: TrendingUp },
              { id: DRAWING_TOOLS.HORIZONTAL_LINE, label: 'Horiz Line (S/R)', icon: Minus },
              { id: DRAWING_TOOLS.HORIZONTAL_RAY, label: 'Horizontal Ray', icon: MoveRight },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTool(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: activeTool === item.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTool === item.id ? '#38bdf8' : '#cbd5e1',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: activeTool === item.id ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Fibonacci Retracement */}
      <button
        onClick={() => handleSelectTool(DRAWING_TOOLS.FIBONACCI)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: activeTool === DRAWING_TOOLS.FIBONACCI ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
          color: activeTool === DRAWING_TOOLS.FIBONACCI ? '#38bdf8' : '#94a3b8',
          border: activeTool === DRAWING_TOOLS.FIBONACCI ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Fibonacci Retracement (Golden Pocket & Extensions)"
      >
        <Sliders size={16} />
      </button>

      {/* 4. Shapes (Rectangle / Order Block) */}
      <button
        onClick={() => handleSelectTool(DRAWING_TOOLS.RECTANGLE)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: activeTool === DRAWING_TOOLS.RECTANGLE ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
          color: activeTool === DRAWING_TOOLS.RECTANGLE ? '#38bdf8' : '#94a3b8',
          border: activeTool === DRAWING_TOOLS.RECTANGLE ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Rectangle (Order Block / Supply & Demand Zone)"
      >
        <Square size={16} />
      </button>

      {/* 5. Positions & Measurement Group */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            if (isPositionToolActive) toggleFlyout('positions');
            else handleSelectTool(DRAWING_TOOLS.POSITION_LONG);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleFlyout('positions');
          }}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '7px',
            backgroundColor: isPositionToolActive ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
            color: isPositionToolActive ? '#38bdf8' : '#94a3b8',
            border: isPositionToolActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
          title="Posisi & Pengukur (Long / Short / Ruler)"
        >
          {activeTool === DRAWING_TOOLS.POSITION_SHORT ? (
            <ArrowDownRight size={16} />
          ) : activeTool === DRAWING_TOOLS.RULER ? (
            <Ruler size={16} />
          ) : (
            <ArrowUpRight size={16} />
          )}
          <span style={{ position: 'absolute', bottom: '1px', right: '1px', fontSize: '8px', color: '#64748b' }}>▸</span>
        </button>

        {activeFlyout === 'positions' && (
          <div
            style={{
              position: 'absolute',
              left: '38px',
              top: '0',
              zIndex: 30,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              minWidth: '150px'
            }}
          >
            {[
              { id: DRAWING_TOOLS.POSITION_LONG, label: 'Long Position (R:R)', icon: ArrowUpRight },
              { id: DRAWING_TOOLS.POSITION_SHORT, label: 'Short Position (R:R)', icon: ArrowDownRight },
              { id: DRAWING_TOOLS.RULER, label: 'Price & Bar Ruler', icon: Ruler },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTool(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: activeTool === item.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTool === item.id ? '#38bdf8' : '#cbd5e1',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: activeTool === item.id ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Text Annotation */}
      <button
        onClick={() => handleSelectTool(DRAWING_TOOLS.TEXT)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: activeTool === DRAWING_TOOLS.TEXT ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
          color: activeTool === DRAWING_TOOLS.TEXT ? '#38bdf8' : '#94a3b8',
          border: activeTool === DRAWING_TOOLS.TEXT ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Catatan Teks (Text Note)"
      >
        <Type size={16} />
      </button>

      {/* 7. Eraser Tool */}
      <button
        onClick={() => handleSelectTool(DRAWING_TOOLS.ERASER)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: activeTool === DRAWING_TOOLS.ERASER ? 'rgba(244, 63, 94, 0.25)' : 'transparent',
          color: activeTool === DRAWING_TOOLS.ERASER ? '#f43f5e' : '#94a3b8',
          border: activeTool === DRAWING_TOOLS.ERASER ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Penghapus Garis (Klik objek untuk menghapus)"
      >
        <Eraser size={16} />
      </button>

      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '2px 0' }} />

      {/* 8. Magnet Mode Toggle */}
      <button
        onClick={() => setIsMagnet((prev) => !prev)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: isMagnet ? 'rgba(251, 191, 36, 0.25)' : 'transparent',
          color: isMagnet ? '#fbbf24' : '#64748b',
          border: isMagnet ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isMagnet ? '0 0 10px rgba(251, 191, 36, 0.3)' : 'none'
        }}
        title={isMagnet ? 'Magnet Aktif (Snap ke OHLC Candle)' : 'Magnet Nonaktif'}
      >
        <Magnet size={16} />
      </button>

      {/* 9. Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: 'transparent',
          color: canUndo ? '#94a3b8' : 'rgba(255, 255, 255, 0.15)',
          border: 'none',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
        }}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={15} />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: 'transparent',
          color: canRedo ? '#94a3b8' : 'rgba(255, 255, 255, 0.15)',
          border: 'none',
          cursor: canRedo ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
        }}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={15} />
      </button>

      {/* 10. Hide / Show Drawings */}
      <button
        onClick={() => setIsVisible((prev) => !prev)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          backgroundColor: !isVisible ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
          color: !isVisible ? '#f43f5e' : '#94a3b8',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title={isVisible ? 'Sembunyikan Semua Gambar' : 'Tampilkan Gambar'}
      >
        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>

      {/* 11. Clear All Drawings */}
      {drawingsCount > 0 && (
        <button
          onClick={handleClearWithConfirm}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '7px',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            color: '#f43f5e',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={`Hapus Semua (${drawingsCount} garis)`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
