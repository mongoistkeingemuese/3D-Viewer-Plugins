/**
 * Valve Details Popup Component
 *
 * Purpose: Display comprehensive valve information with control tabs
 * Usage: Shown when user clicks "Show Valve Details" in context menu
 * Rationale: Provides detailed monitoring and control interface for valve status
 */

import React, { useEffect, useState } from 'react';
import type { PluginI18n } from '@3dviewer/plugin-sdk';
import {
  getNodeState,
  sendMoveToBase,
  sendMoveToWork,
  sendPressureFree,
  sendModeMonostable,
  sendModeBistablePulsed,
  sendModeBistablePermanent,
  sendModeBistableMiddle,
  getCurrentMqttFormat,
  getUnacknowledgedErrorCount,
  acknowledgeAllErrors,
} from '../index';
import {
  GenericState,
  ValvePosition,
  GenericStateKeys,
  ValvePositionKeys,
  DefaultTranslations,
} from '../types';
import { formatDuration, formatTime } from '../utils';

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
 * Main popup component
 */
export const ValveDetailsPopup: React.FC<ValveDetailsPopupProps> = ({ data }) => {
  const nodeId = data?.nodeId as string;
  const i18n = usePluginI18n();

  // Local translate function using DefaultTranslations
  const t = (key: string): string => translateKey(key, i18n.language);
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());

  // Selected error index for detail view
  const [selectedErrorIdx, setSelectedErrorIdx] = useState<number | null>(null);

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
          <h3>{t('ui.noDataAvailable')}</h3>
          <p>{t('ui.nodeStatusNotFound')}</p>
        </div>
      </div>
    );
  }

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

  // Translate state names based on current language
  const positionKey = ValvePositionKeys[nodeState.specificState] || 'position.undefined';
  const genericKey = GenericStateKeys[nodeState.genericState] || 'state.unknown';
  const positionStateName = translateKey(positionKey, i18n.language);
  const genericStateName = translateKey(genericKey, i18n.language);
  const unacknowledgedCount = getUnacknowledgedErrorCount(nodeId);

  return (
    <div style={styles.container}>
      {/* Status Badge Row */}
      <div style={styles.statusRow}>
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

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('status')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'status' ? styles.tabButtonActive : {}),
          }}
        >
          {t('ui.status')}
        </button>
        <button
          onClick={() => setActiveTab('control')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'control' ? styles.tabButtonActive : {}),
          }}
        >
          {t('ui.control')}
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
        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <>
            {/* Valve Status */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.valveStatus')}</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.generalStatus')}:</span>
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
                  <span style={styles.dataLabel}>{t('ui.specificStatus')}:</span>
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
                    <span style={styles.dataLabel}>{t('ui.recipe')}:</span>
                    <span style={styles.dataValue}>{nodeState.recipe}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Runtime Measurements */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.runtimes')}</h3>
              <div style={styles.dataGrid}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.lastBaseToWork')}:</span>
                  <span style={styles.dataValue}>
                    {formatDuration(nodeState.lastDurationGstToAst)}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>{t('ui.lastWorkToBase')}:</span>
                  <span style={styles.dataValue}>
                    {formatDuration(nodeState.lastDurationAstToGst)}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div style={styles.section}>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>{t('ui.lastUpdate')}:</span>
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
                  {t('ui.noFunctionNumber')}
                </div>
              </div>
            )}

            {/* Main Controls */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.mainControl')}</h3>
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
                  {isLoadingAst ? t('ui.sending') : t('ui.moveToWork')}
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
                  {isLoadingGst ? t('ui.sending') : t('ui.moveToBase')}
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
                  {isLoadingPressureFree ? t('ui.sending') : t('ui.pressureFree')}
                </button>
              </div>
            </div>

            {/* Mode Selection */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>{t('ui.operatingMode')}</h3>
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
                {t('ui.modeHint')}
              </p>
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
                  <pre style={{
                    margin: 0,
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    color: '#0f0',
                    fontSize: '11px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    borderRadius: '4px',
                    border: '2px solid #dc3545',
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
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
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
    gap: '4px',
  },
  errorItem: {
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  errorDropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.15s',
  },
  errorHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  errorHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  expandIcon: {
    fontSize: '10px',
    color: '#666',
    width: '12px',
  },
  errorLevelBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  errorNumber: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  errorMessagePreview: {
    fontSize: '12px',
    color: '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  },
  errorTime: {
    fontSize: '11px',
    color: '#666',
    flexShrink: 0,
  },
  ackButtonSmall: {
    width: '24px',
    height: '24px',
    padding: 0,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgedIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#28a745',
    fontSize: '14px',
  },
  errorExpandedContent: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dee2e6',
  },
  errorDetailSection: {
    marginBottom: '12px',
  },
  errorDetailLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  errorDetailValue: {
    fontSize: '13px',
    color: '#212529',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  errorPayload: {
    fontSize: '11px',
    fontFamily: 'monospace',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  errorActions: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #dee2e6',
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
  errorMessage: {
    fontSize: '14px',
    color: '#212529',
    marginBottom: '8px',
    marginTop: '8px',
    lineHeight: '1.4',
    fontWeight: 'normal',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    wordBreak: 'break-word',
  },
  errorValues: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '6px',
    padding: '4px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  errorValueItem: {
    fontSize: '11px',
    color: '#555',
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace',
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
