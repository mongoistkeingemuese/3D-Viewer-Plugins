/**
 * Axis Details Popup Component
 *
 * Purpose: Display comprehensive axis information with step control
 * Usage: Shown when user clicks "Show Axis Details" in context menu
 * Rationale: Provides detailed monitoring and control interface for axis status
 */

import React, { useEffect, useState } from 'react';
import type { PluginI18n } from '@3dviewer/plugin-sdk';
import {
  getNodeState,
  acknowledgeError,
  acknowledgeAllErrors,
  sendStepCommand,
  sendSwitchOnCommand,
  sendHomingCommand,
  sendMoveToPositionCommand,
  setStepSize,
  isStepControlAvailable,
  getCurrentMqttFormat,
  getUnacknowledgedErrorCount,
} from '../index';
import { MotionStateKeys, DefaultTranslations, type NodeState } from '../types';
import { formatTime } from '../utils';

/**
 * Get the usePluginI18n hook from the host window.
 * Plugin popup components are wrapped with PluginI18nProvider by the host.
 */
function usePluginI18n(): PluginI18n {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook = (window as any).usePluginI18n;
  if (hook) {
    return hook();
  }
  // Fallback if hook not available (e.g., in dev/test environment)
  return {
    language: 'de',
    t: (text: string) => text,
    getLanguages: () => ['de', 'en'],
    formatNumber: (value: number) => value.toString(),
    formatDate: (date: Date | number | string) => new Date(date).toLocaleString(),
  };
}

/**
 * Translate a key using DefaultTranslations based on current language
 */
function translateKey(key: string, language: string): string {
  const translations = DefaultTranslations[language] || DefaultTranslations['de'];
  return translations[key] || key;
}

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
  const i18n = usePluginI18n();

  // Local translate function using DefaultTranslations
  const t = (key: string): string => translateKey(key, i18n.language);

  const [nodeState, setNodeState] = useState<NodeState | undefined>(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchOnLoading, setIsSwitchOnLoading] = useState(false);
  const [isHomingLoading, setIsHomingLoading] = useState(false);
  const [isMoveToLoading, setIsMoveToLoading] = useState(false);
  const [targetPosition, setTargetPosition] = useState(0);
  const [stepControlEnabled, setStepControlEnabled] = useState(() => isStepControlAvailable());
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());
  const [activeTab, setActiveTab] = useState<TabType>('control');

  // Selected error index for detail view
  const [selectedErrorIdx, setSelectedErrorIdx] = useState<number | null>(null);

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
          <h3>{t('ui.noDataAvailable')}</h3>
          <p>{t('ui.nodeStatusNotFound')}</p>
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

  const handleSwitchOn = async (): Promise<void> => {
    setIsSwitchOnLoading(true);
    await sendSwitchOnCommand(nodeId);
    setIsSwitchOnLoading(false);
  };

  const handleHoming = async (): Promise<void> => {
    setIsHomingLoading(true);
    await sendHomingCommand(nodeId);
    setIsHomingLoading(false);
  };

  const handleMoveTo = async (): Promise<void> => {
    setIsMoveToLoading(true);
    await sendMoveToPositionCommand(nodeId, targetPosition);
    setIsMoveToLoading(false);
  };

  // Translate state name based on current language
  const motionStateKey = MotionStateKeys[nodeState.currentState] || 'state.disabled';
  const motionStateName = translateKey(motionStateKey, i18n.language);
  const { activityBits, statusMask } = nodeState;
  const unacknowledgedCount = getUnacknowledgedErrorCount(nodeId);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{t('ui.axis')}: {nodeState.axisName}</h2>
        <div style={styles.headerInfo}>
          <span style={styles.formatLabel}>
            {mqttFormat === 'release11' ? 'Release 11' : 'Release 10'}
          </span>
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
          {t('ui.controlAndPosition')}
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
          {t('ui.statusFlags')}
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'errors' ? styles.tabButtonActive : {}),
          }}
        >
          {t('ui.errors')}
          {unacknowledgedCount > 0 && (
            <span style={styles.errorBadge}>{unacknowledgedCount}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'control' && (
          <>
            {/* Position & Velocity */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.positionAndVelocity')}</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.worldPosition')}:</span>
                  <span style={styles.dataValue}>{nodeState.worldPosition.toFixed(3)} mm</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.actualPosition')}:</span>
                  <span style={styles.dataValue}>{nodeState.position.toFixed(3)} mm</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.velocity')}:</span>
                  <span style={styles.dataValue}>{nodeState.velocity.toFixed(3)} mm/s</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.lastUpdate')}:</span>
                  <span style={styles.dataValue}>{formatTime(nodeState.lastUpdate)}</span>
                </div>
              </div>
            </div>

            {/* Step Control */}
            {stepControlEnabled ? (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>{t('ui.stepControl')}</h3>
                <div style={styles.stepControlRow}>
                  {/* Buttons left */}
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
                  {/* Step size right */}
                  <div style={styles.stepSizePanel}>
                    <div style={styles.stepPresets}>
                      {STEP_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleStepSizeChange(size)}
                          style={{
                            ...styles.stepPresetButton,
                            backgroundColor: selectedStep === size ? '#007bff' : '#e9ecef',
                            color: selectedStep === size ? '#fff' : '#333',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div style={styles.customStepRow}>
                      <input
                        type="number"
                        value={selectedStep}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            handleStepSizeChange(val);
                          }
                        }}
                        style={styles.customStepInput}
                        min="0.001"
                        step="0.1"
                      />
                      <span style={styles.stepUnit}>mm</span>
                    </div>
                  </div>
                </div>
                {isLoading && (
                  <div style={styles.loadingIndicator}>{t('ui.sending')}</div>
                )}
              </div>
            ) : (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>{t('ui.stepControl')}</h3>
                <div style={styles.release10Notice}>
                  <span style={{ fontSize: '18px' }}>&#9432;</span>
                  <span>{t('ui.stepControlRelease11Only')}</span>
                </div>
              </div>
            )}

            {/* Move To Position */}
            {stepControlEnabled && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>{t('ui.moveAbsolute')}</h3>
                <div style={styles.moveToRow}>
                  <div style={styles.moveToInputGroup}>
                    <input
                      type="number"
                      value={targetPosition}
                      onChange={(e) => setTargetPosition(parseFloat(e.target.value) || 0)}
                      style={styles.moveToInput}
                      step="0.1"
                    />
                    <span style={styles.stepUnit}>mm</span>
                  </div>
                  <button
                    onClick={handleMoveTo}
                    disabled={isMoveToLoading}
                    style={styles.moveToButton}
                  >
                    {isMoveToLoading ? t('ui.sending') : t('ui.moveTo')}
                  </button>
                </div>
              </div>
            )}

            {/* Axis Commands */}
            {stepControlEnabled && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>{t('ui.axisCommands')}</h3>
                <div style={styles.axisCommandsRow}>
                  <button
                    onClick={handleSwitchOn}
                    disabled={isSwitchOnLoading}
                    style={styles.axisCommandButton}
                  >
                    {isSwitchOnLoading ? t('ui.sending') : t('ui.switchOn')}
                  </button>
                  <button
                    onClick={handleHoming}
                    disabled={isHomingLoading}
                    style={{
                      ...styles.axisCommandButton,
                      backgroundColor: '#17a2b8',
                    }}
                  >
                    {isHomingLoading ? t('ui.sending') : t('ui.homing')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'status' && mqttFormat === 'release11' && (
          <>
            {/* Status Flags (motMsk) */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.statusFlagsMotMsk')}</h3>
              <div style={styles.bitGrid}>
                <StatusBit label={t('ui.ready')} active={statusMask.isReady} />
                <StatusBit label={t('ui.enabled')} active={statusMask.isEnabled} />
                <StatusBit label={t('ui.switchedOn')} active={statusMask.isSwitchedOn} />
                <StatusBit label={t('ui.homed')} active={statusMask.isHomed} />
                <StatusBit label={t('ui.commutated')} active={statusMask.isCommutated} />
                <StatusBit label={t('ui.inVelocity')} active={statusMask.isInVelocity} />
                <StatusBit label={t('ui.override')} active={statusMask.overrideEnabled} />
                <StatusBit label={t('ui.hwEnable')} active={statusMask.hardwareEnableActivated} />
                <StatusBit label={t('ui.internalLimit')} active={statusMask.internalLimitIsActive} warning />
                <StatusBit label={t('ui.warning')} active={statusMask.hasWarning} warning />
                <StatusBit label={t('ui.error')} active={statusMask.hasError} warning />
                <StatusBit label={t('ui.homeSwitch')} active={statusMask.hardwareHomeSwitchActivated} />
                <StatusBit label={t('ui.hwLimitNeg')} active={statusMask.hardwareLimitSwitchNegativeActivated} warning />
                <StatusBit label={t('ui.hwLimitPos')} active={statusMask.hardwareLimitSwitchPositiveActivated} warning />
                <StatusBit label={t('ui.swLimitNeg')} active={statusMask.softwareLimitSwitchNegativeActivated} warning />
                <StatusBit label={t('ui.swLimitPos')} active={statusMask.softwareLimitSwitchPositiveActivated} warning />
                <StatusBit label={t('ui.swReachedNeg')} active={statusMask.softwareLimitSwitchNegativeReached} warning />
                <StatusBit label={t('ui.swReachedPos')} active={statusMask.softwareLimitSwitchPositiveReached} warning />
                <StatusBit label={t('ui.emergency')} active={statusMask.emergencyDetectedDelayedEnabled} warning />
              </div>
            </div>

            {/* Activity Status (mtAcMk) */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.activityStatusMtAcMk')}</h3>
              <div style={styles.bitGrid}>
                <StatusBit label={t('ui.motionActive')} active={activityBits.motionIsActive} />
                <StatusBit label={t('ui.jogNeg')} active={activityBits.jogNegativeIsActive} />
                <StatusBit label={t('ui.jogPos')} active={activityBits.jogPositiveIsActive} />
                <StatusBit label={t('ui.homing')} active={activityBits.homingIsActive} />
                <StatusBit label={t('ui.velPos')} active={activityBits.velocityPositiveIsActive} />
                <StatusBit label={t('ui.velNeg')} active={activityBits.velocityNegativeIsActive} />
                <StatusBit label={t('ui.stopping')} active={activityBits.stoppingIsActive} />
                <StatusBit label={t('ui.resetFault')} active={activityBits.resetControllerFaultIsActive} />
              </div>
            </div>
          </>
        )}

        {/* ERRORS TAB */}
        {activeTab === 'errors' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              {t('ui.errorMessages')} ({nodeState.errors.length}) - {unacknowledgedCount} {t('ui.open')}
            </h3>

            {/* Alle Quittieren Button */}
            {unacknowledgedCount > 0 && (
              <button
                onClick={() => {
                  acknowledgeAllErrors(nodeId);
                  setSelectedErrorIdx(null);
                  setUpdateCounter((c) => c + 1);
                }}
                style={{
                  marginBottom: '12px',
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  width: '100%',
                }}
              >
                {t('ui.acknowledgeAll')} ({unacknowledgedCount})
              </button>
            )}

            {nodeState.errors.length === 0 ? (
              <pre style={{ color: '#28a745', padding: '20px', textAlign: 'center', margin: 0 }}>
                {t('ui.noErrors')}
              </pre>
            ) : (
              <>
                {/* Error Summary List */}
                <pre style={{
                  margin: '0 0 8px 0',
                  padding: '10px',
                  backgroundColor: '#2d2d2d',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '150px',
                  overflow: 'auto',
                }}>
{nodeState.errors.map((err, idx) => {
  try {
    const p = JSON.parse(err.rawPayload || '{}');
    const msg = p.msg?.txt || p.msg?.text || p.msg || 'No message';
    const ack = err.acknowledged ? '✓' : '○';
    const sel = selectedErrorIdx === idx ? '▶' : ' ';
    return `${sel}[${idx}] ${ack} ${err.level}: ${msg}\n`;
  } catch {
    return ` [${idx}] ○ ${err.level}: Parse error\n`;
  }
}).join('')}
                </pre>

                {/* Error Selection Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {Array.from({ length: nodeState.errors.length }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedErrorIdx(selectedErrorIdx === idx ? null : idx)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: selectedErrorIdx === idx ? '#007bff' : '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      #{idx}
                    </button>
                  ))}
                </div>

                {/* Selected Error Detail */}
                {selectedErrorIdx !== null && nodeState.errors[selectedErrorIdx] && (
                  <>
                    <pre style={{
                      margin: 0,
                      padding: '10px',
                      backgroundColor: '#1a1a1a',
                      color: '#0f0',
                      fontSize: '11px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      borderRadius: '4px',
                      border: `2px solid ${getErrorLevelColor(nodeState.errors[selectedErrorIdx].level)}`,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}>
{(() => {
  const err = nodeState.errors[selectedErrorIdx];
  try {
    return JSON.stringify(JSON.parse(err.rawPayload || '{}'), null, 2);
  } catch {
    return err.rawPayload || 'No payload';
  }
})()}
                    </pre>
                    {/* Acknowledge single error button */}
                    {!nodeState.errors[selectedErrorIdx].acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(selectedErrorIdx)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        {t('ui.acknowledge')}
                      </button>
                    )}
                  </>
                )}
              </>
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
          <span style={styles.footerLabel}>AxisCmd:</span>
          <span style={styles.footerValue}>{nodeState.axisCommandNo}</span>
        </div>
        <div style={styles.footerInfo}>
          <span style={styles.footerLabel}>MoveCmd:</span>
          <span style={styles.footerValue}>{nodeState.moveCommandNo}</span>
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
  tabButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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
  stepControlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  stepActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  stepActionButton: {
    padding: '14px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    minWidth: '100px',
  },
  stepSizePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  stepPresets: {
    display: 'flex',
    gap: '4px',
  },
  stepPresetButton: {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  customStepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  customStepInput: {
    width: '80px',
    padding: '6px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  stepUnit: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold',
  },
  moveToRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  moveToInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },
  moveToInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '16px',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  moveToButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#6f42c1',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  axisCommandsRow: {
    display: 'flex',
    gap: '12px',
  },
  axisCommandButton: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#ffc107',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  loadingIndicator: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
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
