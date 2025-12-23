/**
 * Axis Details Popup Component
 *
 * Purpose: Display comprehensive axis information including position, velocity,
 *          motion state, and error log with acknowledgement functionality
 * Usage: Shown when user clicks "Show Axis Details" in context menu
 * Rationale: Provides detailed monitoring interface for axis status
 */

import React, { useEffect, useState } from 'react';
import { getNodeState, acknowledgeError } from '../index';

/**
 * Props interface for AxisDetailsPopup component
 * Purpose: Define component props structure
 * Rationale: Custom interface matching plugin popup data format
 */
interface AxisDetailsPopupProps {
  data?: {
    nodeId?: string;
  };
  onClose?: () => void;
}

/**
 * MotionState enum (duplicated for UI display)
 * Rationale: Needed in component for state name display
 */
const MotionStateNames: Record<number, string> = {
  0: 'Error Stop',
  1: 'Standstill',
  2: 'Homing',
  3: 'Stopping',
  4: 'Disabled',
  5: 'Discrete Motion',
  6: 'Continuous Motion',
  7: 'Synchronized Motion',
};

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Format error level with color
 */
function getErrorLevelColor(level: string): string {
  switch (level) {
    case 'ERR':
      return '#ff4444';
    case 'WARN':
      return '#ffaa00';
    case 'INFO':
      return '#4444ff';
    default:
      return '#888888';
  }
}

/**
 * Main popup component
 */
export const AxisDetailsPopup: React.FC<AxisDetailsPopupProps> = ({ data }) => {
  const nodeId = data?.nodeId as string;
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);

  // Poll for updates (since we don't have reactive state)
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setUpdateCounter((c) => c + 1);
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [nodeId]);

  if (!nodeState) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h3>No Data Available</h3>
          <p>Node state not found. Please ensure the axis is properly configured.</p>
        </div>
      </div>
    );
  }

  const handleAcknowledge = (errorIndex: number): void => {
    acknowledgeError(nodeId, errorIndex);
    setUpdateCounter((c) => c + 1); // Force re-render
  };

  const motionStateName = MotionStateNames[nodeState.currentState] || 'Unknown';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Axis: {nodeState.axisName}</h2>
        <div style={styles.statusBadge}>
          <span style={styles.statusLabel}>Motion State:</span>
          <span
            style={{
              ...styles.statusValue,
              color: nodeState.currentState === 0 ? '#ff4444' : '#00ff00',
            }}
          >
            {motionStateName}
          </span>
        </div>
      </div>

      {/* Position & Velocity Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Position & Velocity</h3>
        <div style={styles.dataGrid}>
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>World Position:</span>
            <span style={styles.dataValue}>{nodeState.worldPosition.toFixed(3)} units</span>
          </div>
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Actual Position:</span>
            <span style={styles.dataValue}>{nodeState.position.toFixed(3)} units</span>
          </div>
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Velocity:</span>
            <span style={styles.dataValue}>{nodeState.velocity.toFixed(3)} units/s</span>
          </div>
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Last Update:</span>
            <span style={styles.dataValue}>
              {nodeState.lastUpdate ? nodeState.lastUpdate.toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Log Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Error Log (Last 5)</h3>
        {nodeState.errors.length === 0 ? (
          <div style={styles.noErrors}>
            <span style={{ fontSize: '32px' }}>✓</span>
            <p>No errors recorded</p>
          </div>
        ) : (
          <div style={styles.errorList}>
            {nodeState.errors.map((error, index) => (
              <div
                key={index}
                style={{
                  ...styles.errorItem,
                  backgroundColor: error.acknowledged ? '#f0f0f0' : '#ffffff',
                  borderLeft: `4px solid ${getErrorLevelColor(error.level)}`,
                }}
              >
                <div style={styles.errorHeader}>
                  <span
                    style={{
                      ...styles.errorLevel,
                      color: getErrorLevelColor(error.level),
                    }}
                  >
                    {error.level}
                  </span>
                  <span style={styles.errorTime}>{formatTimestamp(error.timestamp)}</span>
                </div>
                <div style={styles.errorMessage}>{error.message}</div>
                <div style={styles.errorFooter}>
                  <span style={styles.errorSource}>Source: {error.source}</span>
                  {!error.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(index)}
                      style={styles.ackButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0056b3';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#007bff';
                      }}
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span style={styles.acknowledgedBadge}>✓ Acknowledged</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerInfo}>
          <span style={styles.footerLabel}>Node ID:</span>
          <span style={styles.footerValue}>{nodeId}</span>
        </div>
        <div style={styles.footerInfo}>
          <span style={styles.footerLabel}>Updates:</span>
          <span style={styles.footerValue}>{updateCounter}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Styles for the popup component
 * Rationale: Inline styles for self-contained component
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    height: '100%',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #ddd',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    color: '#333',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#444',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px',
  },
  dataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  dataLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  dataValue: {
    fontSize: '14px',
    color: '#333',
    fontFamily: 'monospace',
  },
  noErrors: {
    textAlign: 'center',
    padding: '30px',
    color: '#28a745',
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  errorItem: {
    padding: '12px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  errorLevel: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  errorTime: {
    fontSize: '11px',
    color: '#999',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  errorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  errorSource: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
  },
  ackButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  acknowledgedBadge: {
    fontSize: '12px',
    color: '#28a745',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#999',
  },
  footerInfo: {
    display: 'flex',
    gap: '5px',
  },
  footerLabel: {
    fontWeight: 'bold',
  },
  footerValue: {
    fontFamily: 'monospace',
  },
  error: {
    padding: '30px',
    textAlign: 'center',
    color: '#ff4444',
  },
};
