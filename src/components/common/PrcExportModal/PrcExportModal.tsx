import React, { useState, useEffect } from 'react';
import { X, Award, Download, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../../ui/Button/Button';
import {
  fetchEligibleParticipants,
  executePrcExport,
  type PrcParticipant,
  type PrcExportOptions
} from '../../../services/prcExportService';
import './PrcExportModal.css';

interface PrcExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  companyName?: string;
}

export const PrcExportModal: React.FC<PrcExportModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  companyName = 'SPARK CPD'
}) => {
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [participants, setParticipants] = useState<PrcParticipant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form options
  const [providerName, setProviderName] = useState(companyName || 'SPARK CPD');
  const [providerAccrNo, setProviderAccrNo] = useState('PTR-2024-001');
  const [programAccrNo, setProgramAccrNo] = useState(`CPD-${new Date().getFullYear()}-EDU-${courseId}`);
  const [exportMode, setExportMode] = useState<'zip_package' | 'single_pdf'>('zip_package');
  const [maskSensitiveData, setMaskSensitiveData] = useState(true);

  // Export progress
  const [isExporting, setIsExporting] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !courseId) return;

    const loadData = async () => {
      setLoadingParticipants(true);
      setErrorMsg(null);
      try {
        const list = await fetchEligibleParticipants(courseId);
        setParticipants(list);

        // Auto-select 3 or 4 candidates (prefer completed ones with PRC IDs)
        const autoSelected = list.slice(0, 4).map((p) => p.id);
        setSelectedIds(autoSelected);
      } catch (err: any) {
        console.error('Failed to load eligible participants:', err);
        setErrorMsg('Failed to load participant data. You can still export curriculum.');
      } finally {
        setLoadingParticipants(false);
      }
    };

    loadData();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTop4 = () => {
    setSelectedIds(participants.slice(0, 4).map((p) => p.id));
  };

  const handleExport = async () => {
    if (selectedIds.length < 3) {
      alert('PRC compliance requires selecting at least 3 completed participants as evidence.');
      return;
    }

    setIsExporting(true);
    setProgressPct(5);
    setProgressStatus('Initializing PRC Dossier Export...');
    setErrorMsg(null);

    const chosenParticipants = participants.filter((p) => selectedIds.includes(p.id));

    const options: PrcExportOptions = {
      courseId,
      providerName,
      providerAccreditationNo: providerAccrNo,
      programAccreditationNo: programAccrNo,
      selectedParticipants: chosenParticipants,
      exportMode,
      maskSensitiveData,
      onProgress: (status, pct) => {
        setProgressStatus(status);
        setProgressPct(pct);
      }
    };

    try {
      await executePrcExport(options);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      setErrorMsg(err.message || 'An unexpected error occurred during PDF export.');
    }
  };

  const isValidCount = selectedIds.length >= 3;

  return (
    <div className="prc-modal-backdrop" onClick={() => !isExporting && onClose()}>
      <div className="prc-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="prc-modal-header">
          <div className="prc-modal-header-left">
            <div className="prc-modal-icon-badge">
              <Award size={24} />
            </div>
            <div>
              <h2 className="prc-modal-title">Export PRC CPD Evidence Dossier</h2>
              <p className="prc-modal-subtitle">
                Generate official audit-ready documentation for PRC Continuing Professional Development validation.
              </p>
            </div>
          </div>
          <button
            className="prc-modal-close"
            onClick={() => !isExporting && onClose()}
            disabled={isExporting}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="prc-modal-body">
          {/* Course Banner */}
          <div className="prc-course-banner">
            <div>
              <div className="prc-course-banner-title">{courseTitle}</div>
              <div className="prc-course-banner-meta">
                Target Body: Professional Regulation Commission (PRC) CPD Council
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontSize: 12, fontWeight: 700 }}>
              <ShieldCheck size={16} /> Verified Format
            </div>
          </div>

          {/* Form Fields */}
          <div className="prc-form-grid">
            <div className="prc-field">
              <label className="prc-label">CPD Provider Name</label>
              <input
                className="prc-input"
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                disabled={isExporting}
              />
            </div>
            <div className="prc-field">
              <label className="prc-label">Provider Accreditation No.</label>
              <input
                className="prc-input"
                type="text"
                placeholder="e.g. PTR-2024-001"
                value={providerAccrNo}
                onChange={(e) => setProviderAccrNo(e.target.value)}
                disabled={isExporting}
              />
            </div>
            <div className="prc-field">
              <label className="prc-label">Program Accreditation No.</label>
              <input
                className="prc-input"
                type="text"
                placeholder="e.g. CPD-2024-EDU-104"
                value={programAccrNo}
                onChange={(e) => setProgramAccrNo(e.target.value)}
                disabled={isExporting}
              />
            </div>
            <div className="prc-field">
              <label className="prc-label">Deliverable Package Format</label>
              <select
                className="prc-input"
                value={exportMode}
                onChange={(e) => setExportMode(e.target.value as any)}
                disabled={isExporting}
              >
                <option value="zip_package">📦 ZIP Archive (Curriculum + All Student PDFs + Manifest)</option>
                <option value="single_pdf">📄 Master Curriculum & Manifest PDFs</option>
              </select>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <input
              type="checkbox"
              id="maskPrivacy"
              checked={maskSensitiveData}
              onChange={(e) => setMaskSensitiveData(e.target.checked)}
              disabled={isExporting}
              className="prc-checkbox"
            />
            <label htmlFor="maskPrivacy" style={{ fontSize: 12.5, color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
              Apply Republic Act 10173 (Data Privacy Act) email masking on public-facing teacher sheets
            </label>
          </div>

          {/* Participants Selection */}
          <div className="prc-participants-section">
            <div className="prc-participants-header">
              <span className="prc-participants-title">
                Select 3–4 Sample Participants as Official Evidence:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleSelectAllTop4}
                  style={{ background: 'none', border: 'none', color: '#FF6B00', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Auto-Select Top 4
                </button>
                <span
                  className={`prc-counter-badge ${isValidCount ? 'prc-counter-badge--valid' : 'prc-counter-badge--invalid'}`}
                >
                  {selectedIds.length} Selected (Min. 3 required)
                </span>
              </div>
            </div>

            {loadingParticipants ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Loader2 className="animate-spin" size={18} color="#FF6B00" />
                Scanning participant records and assessment logs...
              </div>
            ) : participants.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: 13, background: '#f8fafc', borderRadius: 8 }}>
                No enrolled participants found in this course.
              </div>
            ) : (
              <div className="prc-table-wrapper">
                <table className="prc-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>Licensed Participant</th>
                      <th>PRC License ID</th>
                      <th>School / Institution</th>
                      <th>Score</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          onClick={() => !isExporting && toggleSelect(p.id)}
                          style={{ cursor: 'pointer', background: isSelected ? '#fff7ed' : undefined }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="prc-checkbox"
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{p.position}</div>
                          </td>
                          <td>
                            {p.prcLicenseNo ? (
                              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                                {p.prcLicenseNo}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: 11 }}>Unlisted</span>
                            )}
                          </td>
                          <td style={{ color: '#475569' }}>{p.schoolName}</td>
                          <td style={{ fontWeight: 700, color: p.avgScore >= 70 ? '#166534' : '#b45309' }}>
                            {p.avgScore}%
                          </td>
                          <td>
                            {p.progressPct === 100 ? (
                              <span style={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                <CheckCircle2 size={13} /> Completed
                              </span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: 11 }}>{p.progressPct}%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Progress / Status display */}
          {isExporting && (
            <div className="prc-progress-box">
              <div className="prc-progress-text">
                <span>{progressStatus}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="prc-progress-bar-bg">
                <div className="prc-progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="prc-modal-footer">
          <Button
            variant="outline"
            rounded="pill"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            rounded="pill"
            leftIcon={isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            onClick={handleExport}
            disabled={isExporting || !isValidCount || loadingParticipants}
            style={{
              background: isValidCount ? '#FF6B00' : undefined,
              borderColor: isValidCount ? '#FF6B00' : undefined,
              minWidth: 160
            }}
          >
            {isExporting ? 'Generating PDFs...' : 'Export PRC Dossier'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrcExportModal;

