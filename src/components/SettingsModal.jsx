import { useState } from 'react';
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { validateToken } from '../api/vimeo';

export default function SettingsModal({ currentToken, onSave, onClear, onClose }) {
  const [token, setToken] = useState(currentToken || '');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSave() {
    if (!token.trim() || status === 'loading') return;
    setStatus('loading');
    setError('');
    try {
      const user = await validateToken(token.trim());
      setStatus('success');
      onSave(token.trim(), user);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Settings</h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="field">
          <label className="label">Vimeo API Access Token</label>
          <div className="input-row">
            <input
              className="input mono"
              type={show ? 'text' : 'password'}
              value={token}
              onChange={e => { setToken(e.target.value); setStatus('idle'); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Paste your access token…"
              autoComplete="off"
            />
            <button className="btn-icon" onClick={() => setShow(v => !v)} title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {status === 'error' && (
            <div className="feedback error"><AlertCircle size={15} /> {error}</div>
          )}
          {status === 'success' && (
            <div className="feedback success"><CheckCircle size={15} /> Token validated and saved</div>
          )}
        </div>

        <div className="modal-actions">
          {currentToken && (
            <button className="btn btn-ghost" onClick={onClear} style={{ color: 'var(--error)' }}>
              <Trash2 size={14} /> Clear token
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!token.trim() || status === 'loading'}
            style={{ marginLeft: 'auto' }}
          >
            {status === 'loading' ? <><Loader size={15} className="spin" /> Validating…</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
