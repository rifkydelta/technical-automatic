'use client';
import React from 'react';
import { PRESET_COLORS } from '../../utils/chartDrawingEngine';
import { Trash2, Copy, X, Sliders } from 'lucide-react';

export default function DrawingPropertiesBar({
  selectedDrawing,
  onUpdateDrawing,
  onDeleteDrawing,
  onDuplicateDrawing,
  onDeselect,
  position = { x: 20, y: 20 }
}) {
  if (!selectedDrawing) return null;

  const { type, style = {} } = selectedDrawing;
  const currentColor = style.color || '#38bdf8';
  const currentWidth = style.lineWidth || 2;
  const currentLineStyle = style.lineStyle || 'solid'; // 'solid', 'dashed', 'dotted'
  const currentOpacity = style.opacity !== undefined ? style.opacity : 0.15;

  const handleColorChange = (c) => {
    onUpdateDrawing(selectedDrawing.id, {
      style: { ...style, color: c }
    });
  };

  const handleWidthChange = (w) => {
    onUpdateDrawing(selectedDrawing.id, {
      style: { ...style, lineWidth: w }
    });
  };

  const handleStyleChange = (s) => {
    onUpdateDrawing(selectedDrawing.id, {
      style: { ...style, lineStyle: s }
    });
  };

  const handleOpacityChange = (op) => {
    onUpdateDrawing(selectedDrawing.id, {
      style: { ...style, opacity: op }
    });
  };

  const hasFill = ['rectangle', 'fibonacci', 'position_long', 'position_short'].includes(type);

  return (
    <div
      style={{
        position: 'absolute',
        top: Math.max(10, position.y - 48),
        left: Math.max(10, Math.min(position.x - 100, window.innerWidth - 380)),
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.2)',
        fontSize: '11px',
        color: '#e2e8f0',
        fontFamily: 'var(--font-mono), monospace',
        userSelect: 'none',
        animation: 'fadeInProps 0.15s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeInProps {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 1. Color Palette Dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {PRESET_COLORS.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => handleColorChange(c)}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: c,
              border: currentColor === c ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              boxShadow: currentColor === c ? `0 0 8px ${c}` : 'none',
              transition: 'all 0.1s ease',
              padding: 0
            }}
            title={c}
          />
        ))}
      </div>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

      {/* 2. Line Width Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[1, 2, 3].map((w) => (
          <button
            key={w}
            onClick={() => handleWidthChange(w)}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: currentWidth === w ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: currentWidth === w ? '#38bdf8' : '#94a3b8',
              border: currentWidth === w ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '10px',
            }}
            title={`Tebal Garis: ${w}px`}
          >
            {w}px
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

      {/* 3. Line Style Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[
          { id: 'solid', label: '—' },
          { id: 'dashed', label: '--' },
          { id: 'dotted', label: '••' },
        ].map((ls) => (
          <button
            key={ls.id}
            onClick={() => handleStyleChange(ls.id)}
            style={{
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: currentLineStyle === ls.id ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: currentLineStyle === ls.id ? '#38bdf8' : '#94a3b8',
              border: currentLineStyle === ls.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '10px',
            }}
            title={`Tipe Garis: ${ls.id}`}
          >
            {ls.label}
          </button>
        ))}
      </div>

      {/* 4. Fill Opacity (if shape has fill) */}
      {hasFill && (
        <>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>Fill:</span>
            {[0.1, 0.25, 0.5].map((op) => (
              <button
                key={op}
                onClick={() => handleOpacityChange(op)}
                style={{
                  padding: '2px 4px',
                  borderRadius: '4px',
                  backgroundColor: Math.abs(currentOpacity - op) < 0.05 ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: Math.abs(currentOpacity - op) < 0.05 ? '#38bdf8' : '#94a3b8',
                  border: Math.abs(currentOpacity - op) < 0.05 ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '9.5px',
                }}
              >
                {Math.round(op * 100)}%
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

      {/* 5. Duplicate Button */}
      <button
        onClick={() => onDuplicateDrawing(selectedDrawing.id)}
        style={{
          padding: '4px',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        title="Duplikasi Garis (Clone)"
      >
        <Copy size={13} />
      </button>

      {/* 6. Delete Button */}
      <button
        onClick={() => onDeleteDrawing(selectedDrawing.id)}
        style={{
          padding: '4px',
          borderRadius: '4px',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.15s ease'
        }}
        title="Hapus Garis (Delete)"
      >
        <Trash2 size={13} />
      </button>

      {/* 7. Deselect Button */}
      <button
        onClick={onDeselect}
        style={{
          padding: '2px',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Tutup Panel"
      >
        <X size={12} />
      </button>
    </div>
  );
}
