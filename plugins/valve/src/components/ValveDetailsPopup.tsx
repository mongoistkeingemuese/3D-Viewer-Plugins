/**
 * Valve Details Popup Component
 *
 * Purpose: Display comprehensive valve information with control tabs
 * Usage: Shown when user clicks "Show Valve Details" in context menu
 * Rationale: Provides detailed monitoring and control interface for valve status
 */

import React, { useEffect, useState } from 'react';
import {
  getNodeState,
  acknowledgeError,
  acknowledgeAllErrors,
  sendMoveToBase,
  sendMoveToWork,
  sendPressureFree,
  sendModeMonostable,
  sendModeBistablePulsed,
  sendModeBistablePermanent,
  sendModeBistableMiddle,
  getCurrentMqttFormat,
  getUnacknowledgedErrorCount,
} from '../index';
import {
  GenericState,
  ValvePosition,
  GenericStateNames,
  ValvePositionNames,
} from '../types';
import { formatDuration, formatTime, formatTimestamp } from '../utils';

/**
 * Props interface for ValveDetailsPopup component
 */
interface ValveDetailsPopupProps {
  data?: {
    nodeId?: string;
  };
  onClose?: () => void;
}

/**
 * Tab type definition
 */
type TabType = 'status' | 'control' | 'errors';

/**
 * Get color for valve position state
 */
function getPositionStateColor(state: ValvePosition): string {
  switch (state) {
    case ValvePosition.IsInBasePosition:
    case ValvePosition.IsInWorkPosition:
      return '#28a745'; // Green - stable position
    case ValvePosition.MovingToBasePosition:
    case ValvePosition.MovingToWorkPosition:
      return '#007bff'; // Blue - moving
    case ValvePosition.IsPressureFree:
      return '#6c757d'; // Gray - pressure free
    case ValvePosition.IsInUndefinedPosition:
    default:
      return '#ffc107'; // Yellow - undefined
  }
}

/**
 * Get color for generic state
 */
function getGenericStateColor(state: GenericState): string {
  switch (state) {
    case GenericState.Error:
      return '#dc3545'; // Red
    case GenericState.Idle:
    case GenericState.Done:
      return '#28a745'; // Green
    case GenericState.Executing:
    case GenericState.Resetting:
    case GenericState.Initialising:
    case GenericState.Preparing:
      return '#007bff'; // Blue
    case GenericState.Pausing:
    case GenericState.Paused:
    case GenericState.Aborting:
    case GenericState.Aborted:
      return '#ffc107'; // Yellow
    default:
      return '#6c757d'; // Gray
  }
}

/**
 * Get error level color
 */
function getErrorLevelColor(level: string): string {
  switch (level) {
    case 'ERR':
      return '#dc3545';
    case 'WARN':
      return '#ffc107';
    case 'INFO':
      return '#007bff';
    default:
      return '#6c757d';
  }
}

/**
 * Main popup component
 */
export const ValveDetailsPopup: React.FC<ValveDetailsPopupProps> = ({ data }) => {
  const nodeId = data?.nodeId as string;
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());

  // Loading states for buttons
  const [isLoadingGst, setIsLoadingGst] = useState(false);
  const [isLoadingAst, setIsLoadingAst] = useState(false);
  const [isLoadingPressureFree, setIsLoadingPressureFree] = useState(false);
  const [isLoadingMode, setIsLoadingMode] = useState<string | null>(null);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setMqttFormat(getCurrentMqttFormat());
      setUpdateCounter((c) => c + 1);
    }, 250);

    return () => clearInterval(interval);
  }, [nodeId]);

  if (!nodeState) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h3>No Data Available</h3>
          <p>Node state not found. Please ensure the valve is properly configured.</p>
        </div>
      </div>
    );
  }

  const handleAcknowledge = (errorIndex: number): void => {
    acknowledgeError(nodeId, errorIndex);
    setUpdateCounter((c) => c + 1);
  };

  const handleAcknowledgeAll = (): void => {
    acknowledgeAllErrors(nodeId);
    setUpdateCounter((c) => c + 1);
  };

  const handleMoveToGst = async (): Promise<void> => {
    setIsLoadingGst(true);
    await sendMoveToBase(nodeId);
    setIsLoadingGst(false);
  };

  const handleMoveToAst = async (): Promise<void> => {
    setIsLoadingAst(true);
    await sendMoveToWork(nodeId);
    setIsLoadingAst(false);
  };

  const handlePressureFree = async (): Promise<void> => {
    setIsLoadingPressureFree(true);
    await sendPressureFree(nodeId);
    setIsLoadingPressureFree(false);
  };

  const handleModeChange = async (
    mode: string,
    sendFn: (nodeId: string) => Promise<boolean>
  ): Promise<void> => {
    setIsLoadingMode(mode);
    await sendFn(nodeId);
    setIsLoadingMode(null);
  };

  const positionStateName = ValvePositionNames[nodeState.specificState] || 'Unknown';
  const genericStateName = GenericStateNames[nodeState.genericState] || 'Unknown';
  const unacknowledgedCount = getUnacknowledgedErrorCount(nodeId);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Valve: {nodeState.valveName}</h2>
        <div style={styles.headerInfo}>
          <span style={styles.formatLabel}>{mqttFormat}</span>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: getPositionStateColor(nodeState.specificState),
            }}
          >
            {positionStateName}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('status')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'status' ? styles.tabButtonActive : {}),
          }}
        >
          Status
        </button>
        <button
          onClick={() => setActiveTab('control')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'control' ? styles.tabButtonActive : {}),
          }}
        >
          Bedienung
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'errors' ? styles.tabButtonActive : {}),
          }}
        >
          Errors
          {unacknowledgedCount > 0 && (
            <span style={styles.errorBadge}>{unacknowledgedCount}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <>
            {/* Valve Status */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Ventilstatus</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Generic State:</span>
                  <span
                    style={{
                      ...styles.dataValue,
                      color: getGenericStateColor(nodeState.genericState),
                      fontWeight: 'bold',
                    }}
                  >
                    {genericStateName}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Specific State:</span>
                  <span
                    style={{
                      ...styles.dataValue,
                      color: getPositionStateColor(nodeState.specificState),
                      fontWeight: 'bold',
                    }}
                  >
                    {positionStateName}
                  </span>
                </div>
                {nodeState.recipe > 0 && (
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Recipe:</span>
                    <span style={styles.dataValue}>{nodeState.recipe}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Runtime Measurements */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Laufzeiten</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Letzte GST → AST:</span>
                  <span style={styles.dataValue}>
                    {formatDuration(nodeState.lastDurationGstToAst)}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Letzte AST → GST:</span>
                  <span style={styles.dataValue}>
                    {formatDuration(nodeState.lastDurationAstToGst)}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div style={styles.section}>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>Letztes Update:</span>
                <span style={styles.dataValue}>{formatTime(nodeState.lastUpdate)}</span>
              </div>
            </div>
          </>
        )}

        {/* CONTROL TAB */}
        {activeTab === 'control' && (
          <>
            {/* Warning if no function number */}
            {!nodeState.functionNo && (
              <div style={styles.section}>
                <div style={styles.warningBox}>
                  Keine Funktionsnummer konfiguriert - Befehle deaktiviert
                </div>
              </div>
            )}

            {/* Main Controls */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Hauptbedienung</h3>
              <div style={styles.controlGrid}>
                <button
                  onClick={handleMoveToAst}
                  disabled={isLoadingAst || !nodeState.functionNo}
                  style={{
                    ...styles.controlButton,
                    backgroundColor: '#28a745',
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingAst ? 'Sende...' : 'AST fahren'}
                </button>
                <button
                  onClick={handleMoveToGst}
                  disabled={isLoadingGst || !nodeState.functionNo}
                  style={{
                    ...styles.controlButton,
                    backgroundColor: '#007bff',
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingGst ? 'Sende...' : 'GST fahren'}
                </button>
                <button
                  onClick={handlePressureFree}
                  disabled={isLoadingPressureFree || !nodeState.functionNo}
                  style={{
                    ...styles.controlButton,
                    backgroundColor: '#6c757d',
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingPressureFree ? 'Sende...' : 'Drucklos'}
                </button>
              </div>
            </div>

            {/* Mode Selection */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Betriebsmodus</h3>
              <div style={styles.modeGrid}>
                <button
                  onClick={() => handleModeChange('mono', sendModeMonostable)}
                  disabled={isLoadingMode !== null || !nodeState.functionNo}
                  style={{
                    ...styles.modeButton,
                    ...(isLoadingMode === 'mono' ? styles.modeButtonLoading : {}),
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingMode === 'mono' ? '...' : 'Mono'}
                </button>
                <button
                  onClick={() => handleModeChange('biPuls', sendModeBistablePulsed)}
                  disabled={isLoadingMode !== null || !nodeState.functionNo}
                  style={{
                    ...styles.modeButton,
                    ...(isLoadingMode === 'biPuls' ? styles.modeButtonLoading : {}),
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingMode === 'biPuls' ? '...' : 'BiPuls'}
                </button>
                <button
                  onClick={() => handleModeChange('biPerm', sendModeBistablePermanent)}
                  disabled={isLoadingMode !== null || !nodeState.functionNo}
                  style={{
                    ...styles.modeButton,
                    ...(isLoadingMode === 'biPerm' ? styles.modeButtonLoading : {}),
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingMode === 'biPerm' ? '...' : 'BiPerm'}
                </button>
                <button
                  onClick={() => handleModeChange('biMitte', sendModeBistableMiddle)}
                  disabled={isLoadingMode !== null || !nodeState.functionNo}
                  style={{
                    ...styles.modeButton,
                    ...(isLoadingMode === 'biMitte' ? styles.modeButtonLoading : {}),
                    opacity: !nodeState.functionNo ? 0.5 : 1,
                  }}
                >
                  {isLoadingMode === 'biMitte' ? '...' : 'BiMitte'}
                </button>
              </div>
              <p style={styles.modeHint}>
                Hinweis: Modi werden ohne Feedback vom PLC gesendet
              </p>
            </div>
          </>
        )}

        {/* ERRORS TAB */}
        {activeTab === 'errors' && (
          <div style={styles.section}>
            <div style={styles.errorSectionHeader}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                Errors ({unacknowledgedCount} unbestätigt)
              </h3>
              {unacknowledgedCount > 0 && (
                <button
                  onClick={handleAcknowledgeAll}
                  style={styles.ackAllButton}
                >
                  Alle Quittieren
                </button>
              )}
            </div>
            {nodeState.errors.length === 0 ? (
              <div style={styles.noErrors}>
                <span style={{ fontSize: '24px' }}>&#10003;</span>
                <p>Keine Errors aufgezeichnet</p>
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
                      <span style={styles.errorTime}>
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <div style={styles.errorMessage}>{error.message}</div>
                    <div style={styles.errorFooter}>
                      <span style={styles.errorSource}>Source: {error.source}</span>
                      {!error.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(index)}
                          style={styles.ackButton}
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span style={styles.acknowledgedBadge}>&#10003; Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <span style={styles.footerLabel}>FunctionNo:</span>
          <span style={styles.footerValue}>{nodeState.functionNo}</span>
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
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    height: '100%',
    overflowY: 'auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '2px solid #ddd',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    color: '#333',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  formatLabel: {
    fontSize: '11px',
    color: '#fff',
    backgroundColor: '#6c757d',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '0',
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px 6px 0 0',
    backgroundColor: '#e9ecef',
    color: '#495057',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '-2px',
    borderBottom: '2px solid transparent',
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderBottom: '2px solid #007bff',
  },
  tabContent: {
    minHeight: '200px',
  },
  errorBadge: {
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    marginLeft: '6px',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#444',
    borderBottom: '1px solid #eee',
    paddingBottom: '6px',
  },
  warningBox: {
    padding: '12px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '4px',
    color: '#856404',
    fontSize: '13px',
    textAlign: 'center',
  },
  dataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  dataLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: 'bold',
  },
  dataValue: {
    fontSize: '13px',
    color: '#333',
    fontFamily: 'monospace',
  },
  controlGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  controlButton: {
    padding: '14px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  modeGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  modeButton: {
    flex: 1,
    minWidth: '80px',
    padding: '10px 12px',
    border: '2px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    backgroundColor: '#fff',
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonLoading: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff',
  },
  modeHint: {
    marginTop: '10px',
    fontSize: '11px',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  noErrors: {
    textAlign: 'center',
    padding: '20px',
    color: '#28a745',
  },
  errorSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '6px',
    borderBottom: '1px solid #eee',
  },
  ackAllButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  errorItem: {
    padding: '10px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  errorLevel: {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  errorTime: {
    fontSize: '10px',
    color: '#999',
  },
  errorMessage: {
    fontSize: '12px',
    color: '#333',
    marginBottom: '6px',
    lineHeight: '1.3',
  },
  errorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  errorSource: {
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic',
  },
  ackButton: {
    padding: '4px 10px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  acknowledgedBadge: {
    fontSize: '11px',
    color: '#28a745',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#999',
  },
  footerInfo: {
    display: 'flex',
    gap: '4px',
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
    color: '#dc3545',
  },
};
