/**
 * Axis Details Popup Component
 *
 * Purpose: Display comprehensive axis information with step control
 * Usage: Shown when user clicks "Show Axis Details" in context menu
 * Rationale: Provides detailed monitoring and control interface for axis status
 */

import React, { useEffect, useState } from 'react';
import {
  getNodeState,
  acknowledgeError,
  sendStepCommand,
  setStepSize,
  isStepControlAvailable,
  getCurrentMqttFormat,
} from '../index';

/**
 * Props interface for AxisDetailsPopup component
 */
interface AxisDetailsPopupProps {
  data?: {
    nodeId?: string;
  };
  onClose?: () => void;
}

/**
 * Tab type definition
 */
type TabType = 'control' | 'status' | 'errors';

/**
 * MotionState names for display
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
 * Get color for motion state
 */
function getMotionStateColor(state: number): string {
  switch (state) {
    case 0: return '#ff4444';
    case 2: return '#00aaff';
    case 5:
    case 6:
    case 7: return '#00ff00';
    default: return '#888888';
  }
}

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Get error level color
 */
function getErrorLevelColor(level: string): string {
  switch (level) {
    case 'ERR': return '#ff4444';
    case 'WARN': return '#ffaa00';
    case 'INFO': return '#4444ff';
    default: return '#888888';
  }
}

/**
 * Status bit indicator component
 */
const StatusBit: React.FC<{ label: string; active: boolean; warning?: boolean }> = ({
  label,
  active,
  warning = false,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      backgroundColor: active
        ? warning
          ? '#fff3cd'
          : '#d4edda'
        : '#f8f9fa',
      borderRadius: '4px',
      border: `1px solid ${active ? (warning ? '#ffc107' : '#28a745') : '#dee2e6'}`,
      fontSize: '11px',
    }}
  >
    <span
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: active ? (warning ? '#ffc107' : '#28a745') : '#dee2e6',
      }}
    />
    <span style={{ color: active ? '#000' : '#6c757d' }}>{label}</span>
  </div>
);

/**
 * Step size preset buttons
 */
const STEP_SIZES = [0.1, 1, 10, 100];

/**
 * Main popup component
 */
export const AxisDetailsPopup: React.FC<AxisDetailsPopupProps> = ({ data }) => {
  const nodeId = data?.nodeId as string;
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stepControlEnabled, setStepControlEnabled] = useState(() => isStepControlAvailable());
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());
  const [activeTab, setActiveTab] = useState<TabType>('control');

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setStepControlEnabled(isStepControlAvailable());
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
          <p>Node state not found. Please ensure the axis is properly configured.</p>
        </div>
      </div>
    );
  }

  const handleAcknowledge = (errorIndex: number): void => {
    acknowledgeError(nodeId, errorIndex);
    setUpdateCounter((c) => c + 1);
  };

  const handleStepSizeChange = (size: number): void => {
    setSelectedStep(size);
    setStepSize(nodeId, size);
  };

  const handleStep = async (direction: number): Promise<void> => {
    setIsLoading(true);
    const stepValue = selectedStep * direction;
    await sendStepCommand(nodeId, stepValue);
    setIsLoading(false);
  };

  const motionStateName = MotionStateNames[nodeState.currentState] || 'Unknown';
  const { activityBits, statusMask } = nodeState;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Axis: {nodeState.axisName}</h2>
        <div style={styles.headerInfo}>
          <span style={styles.formatLabel}>
            {mqttFormat === 'release11' ? 'Release 11' : 'Release 10'}
          </span>
          {stepControlEnabled && (
            <span style={styles.sfLabel}>SF: {nodeState.functionNo}</span>
          )}
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: getMotionStateColor(nodeState.currentState),
            }}
          >
            {motionStateName}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('control')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'control' ? styles.tabButtonActive : {}),
          }}
        >
          Control & Position
        </button>
        <button
          onClick={() => setActiveTab('status')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'status' ? styles.tabButtonActive : {}),
            ...(mqttFormat !== 'release11' ? styles.tabButtonDisabled : {}),
          }}
          disabled={mqttFormat !== 'release11'}
        >
          Status Flags
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'errors' ? styles.tabButtonActive : {}),
          }}
        >
          Errors {nodeState.errors.length > 0 && `(${nodeState.errors.length})`}
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'control' && (
          <>
            {/* Position & Velocity */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Position & Velocity</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>World Position:</span>
                  <span style={styles.dataValue}>{nodeState.worldPosition.toFixed(3)} mm</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Actual Position:</span>
                  <span style={styles.dataValue}>{nodeState.position.toFixed(3)} mm</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Velocity:</span>
                  <span style={styles.dataValue}>{nodeState.velocity.toFixed(3)} mm/s</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Last Update:</span>
                  <span style={styles.dataValue}>
                    {nodeState.lastUpdate ? nodeState.lastUpdate.toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Control */}
            {stepControlEnabled ? (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Step Control</h3>
                <div style={styles.stepControl}>
                  <div style={styles.stepSizeSelector}>
                    <span style={styles.stepLabel}>Step Size:</span>
                    <div style={styles.stepButtons}>
                      {STEP_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleStepSizeChange(size)}
                          style={{
                            ...styles.stepSizeButton,
                            backgroundColor: selectedStep === size ? '#007bff' : '#e9ecef',
                            color: selectedStep === size ? '#fff' : '#333',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.stepActions}>
                    <button
                      onClick={() => handleStep(-1)}
                      disabled={isLoading}
                      style={{
                        ...styles.stepActionButton,
                        backgroundColor: '#dc3545',
                      }}
                    >
                      - {selectedStep}
                    </button>
                    <button
                      onClick={() => handleStep(1)}
                      disabled={isLoading}
                      style={{
                        ...styles.stepActionButton,
                        backgroundColor: '#28a745',
                      }}
                    >
                      + {selectedStep}
                    </button>
                  </div>
                  {isLoading && (
                    <div style={styles.loadingIndicator}>Sending command...</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Step Control</h3>
                <div style={styles.release10Notice}>
                  <span style={{ fontSize: '18px' }}>&#9432;</span>
                  <span>Step-Betrieb nur mit Release 11 Format verfuegbar</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'status' && mqttFormat === 'release11' && (
          <>
            {/* Status Flags (motMsk) */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Status Flags (motMsk)</h3>
              <div style={styles.bitGrid}>
                <StatusBit label="Ready" active={statusMask.isReady} />
                <StatusBit label="Enabled" active={statusMask.isEnabled} />
                <StatusBit label="Switched On" active={statusMask.isSwitchedOn} />
                <StatusBit label="Homed" active={statusMask.isHomed} />
                <StatusBit label="Commutated" active={statusMask.isCommutated} />
                <StatusBit label="In Velocity" active={statusMask.isInVelocity} />
                <StatusBit label="Override" active={statusMask.overrideEnabled} />
                <StatusBit label="HW Enable" active={statusMask.hardwareEnableActivated} />
                <StatusBit label="Internal Limit" active={statusMask.internalLimitIsActive} warning />
                <StatusBit label="Warning" active={statusMask.hasWarning} warning />
                <StatusBit label="Error" active={statusMask.hasError} warning />
                <StatusBit label="Home Switch" active={statusMask.hardwareHomeSwitchActivated} />
                <StatusBit label="HW Limit-" active={statusMask.hardwareLimitSwitchNegativeActivated} warning />
                <StatusBit label="HW Limit+" active={statusMask.hardwareLimitSwitchPositiveActivated} warning />
                <StatusBit label="SW Limit-" active={statusMask.softwareLimitSwitchNegativeActivated} warning />
                <StatusBit label="SW Limit+" active={statusMask.softwareLimitSwitchPositiveActivated} warning />
                <StatusBit label="SW Reached-" active={statusMask.softwareLimitSwitchNegativeReached} warning />
                <StatusBit label="SW Reached+" active={statusMask.softwareLimitSwitchPositiveReached} warning />
                <StatusBit label="Emergency" active={statusMask.emergencyDetectedDelayedEnabled} warning />
              </div>
            </div>

            {/* Activity Status (mtAcMk) */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Activity Status (mtAcMk)</h3>
              <div style={styles.bitGrid}>
                <StatusBit label="Motion Active" active={activityBits.motionIsActive} />
                <StatusBit label="Jog-" active={activityBits.jogNegativeIsActive} />
                <StatusBit label="Jog+" active={activityBits.jogPositiveIsActive} />
                <StatusBit label="Homing" active={activityBits.homingIsActive} />
                <StatusBit label="Vel+" active={activityBits.velocityPositiveIsActive} />
                <StatusBit label="Vel-" active={activityBits.velocityNegativeIsActive} />
                <StatusBit label="Stopping" active={activityBits.stoppingIsActive} />
                <StatusBit label="Reset Fault" active={activityBits.resetControllerFaultIsActive} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'errors' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Error Log (Last 5)</h3>
            {nodeState.errors.length === 0 ? (
              <div style={styles.noErrors}>
                <span style={{ fontSize: '24px' }}>&#10003;</span>
                <p>No errors recorded</p>
              </div>
            ) : (
              <div style={styles.errorListFull}>
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
  sfLabel: {
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  formatLabel: {
    fontSize: '11px',
    color: '#fff',
    backgroundColor: '#6c757d',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
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
  },
  tabButtonActive: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderBottom: '2px solid #007bff',
  },
  tabButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  tabContent: {
    minHeight: '200px',
  },
  release10Notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    color: '#856404',
    fontSize: '13px',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
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
  bitGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
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
  stepControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepSizeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#666',
  },
  stepButtons: {
    display: 'flex',
    gap: '6px',
  },
  stepSizeButton: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  stepActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  stepActionButton: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    minWidth: '120px',
  },
  loadingIndicator: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
  },
  noErrors: {
    textAlign: 'center',
    padding: '20px',
    color: '#28a745',
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  errorListFull: {
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
    color: '#ff4444',
  },
};
