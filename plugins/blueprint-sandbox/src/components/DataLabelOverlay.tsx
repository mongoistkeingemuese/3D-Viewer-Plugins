/**
 * Data Label Overlay
 *
 * Einfaches Label-Overlay für Datenwerte.
 */

import React from 'react';

interface DataLabelOverlayProps {
  nodeId: string;
  data?: {
    label?: string;
    value?: unknown;
    unit?: string;
  };
}

export const DataLabelOverlay: React.FC<DataLabelOverlayProps> = ({
  data = {},
}) => {
  return (
    <div className="data-label-overlay">
      <style>{`
        .data-label-overlay {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 4px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 12px;
          color: #fff;
          white-space: nowrap;
        }
        .label-text {
          color: #888;
          margin-right: 4px;
        }
        .label-value {
          color: #00d4ff;
          font-weight: bold;
        }
        .label-unit {
          color: #888;
          margin-left: 2px;
        }
      `}</style>

      {data.label && <span className="label-text">{data.label}:</span>}
      <span className="label-value">
        {data.value !== undefined ? String(data.value) : '-'}
      </span>
      {data.unit && <span className="label-unit">{data.unit}</span>}
    </div>
  );
};
