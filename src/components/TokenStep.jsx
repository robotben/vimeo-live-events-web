import { useState } from 'react';
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { validateToken } from '../api/vimeo';

export default function TokenStep({ onValidated }) {
  const [token, setToken] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  async function handleValidate() {
    if (!token.trim() || status === 'loading') return;
    setStatus('loading');
    setError('');
    try {
      const u = await validateToken(token.trim());
      setUser(u);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  return (
    <>
      <h2 className="step-heading">Connect your Vimeo account</h2>
      <p className="step-desc">
        Enter a Vimeo API access token with <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>create</code>,{' '}
        <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>edit</code>, and{' '}
        <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>public</code> scopes.
      </p>

      <div className="field">
        <label className="label">API Access Token</label>
        <div className="input-row">
          <input
            className="input mono"
            type={show ? 'text' : 'password'}
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleValidate()}
            placeholder="Paste your access token…"
            autoComplete="off"
          />
          <button className="btn-icon" onClick={() => setShow(v => !v)} title={show ? 'Hide' : 'Show'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleValidate}
            disabled={!token.trim() || status === 'loading'}
          >
            {status === 'loading'
              ? <><Loader size={15} className="spin" /> Validating…</>
              : 'Validate'}
          </button>
        </div>

        {status === 'error' && (
          <div className="feedback error">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {status === 'success' && user && (
          <div className="feedback success">
            <CheckCircle size={15} /> Authenticated as <strong style={{ marginLeft: 4 }}>{user.name}</strong>
          </div>
        )}
      </div>

      <div className="step-actions">
        <a
          className="link"
          href="https://developer.vimeo.com/apps"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get an API token →
        </a>
        <button
          className="btn btn-primary"
          onClick={() => onValidated(token.trim(), user)}
          disabled={status !== 'success'}
        >
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}
