/**
 * Status Badge Overlay for IFrame Plugin
 */

import React from 'react';

interface StatusBadgeOverlayProps {
  nodeId: string;
  data?: {
    value?: unknown;
    mode?: 'badge' | 'label';
  };
}

export const StatusBadgeOverlay: React.FC<StatusBadgeOverlayProps> = ({
  data = {},
}) => {
  const formatValue = (v: unknown): string => {
    if (v === null || v === undefined) return '?';
    if (typeof v === 'number') return v.toFixed(1);
    if (typeof v === 'boolean') return v ? '✓' : '✗';
    return String(v).substring(0, 10);
  };

  const mode = data.mode || 'badge';

  if (mode === 'label') {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '2px 6px',
        borderRadius: 3,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#00d4ff',
      }}>
        {formatValue(data.value)}
      </div>
    );
  }

  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(0,150,255,0.9), rgba(0,100,200,0.9))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      border: '2px solid rgba(255,255,255,0.3)',
    }}>
      {formatValue(data.value)}
    </div>
  );
};
