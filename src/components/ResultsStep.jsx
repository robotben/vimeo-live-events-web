import { useEffect, useRef, useState } from 'react';
import {
  Loader, CheckCircle, AlertCircle, Copy, Check, ExternalLink,
  Download, RotateCcw, Clock,
} from 'lucide-react';
import { createLiveEvent, addDestinationToEvent, addOttDestinationToEvent } from '../api/vimeo';
import { exportResultsCSV } from '../utils/csvParser';

function CopyCell({ value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <div className="cell-copy">
      <span title={value}>{value}</span>
      <button className={`btn-icon${copied ? ' copied' : ''}`} onClick={copy} title="Copy">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'pending')  return <span className="badge badge-pending"><Clock size={10} /> Pending</span>;
  if (status === 'creating') return <span className="badge badge-creating"><Loader size={10} className="spin" /> Creating</span>;
  if (status === 'success')  return <span className="badge badge-success"><CheckCircle size={10} /> Done</span>;
  if (status === 'error')    return <span className="badge badge-error"><AlertCircle size={10} /> Error</span>;
  return null;
}

export default function ResultsStep({ token, userId, events, selectedDestinations, allDestinations, selectedOttDestinations, allOttDestinations, onReset }) {
  const [results, setResults] = useState(() =>
    events.map(e => ({ ...e, status: 'pending', eventId: null, managementUrl: '', streamUrl: '', streamKey: '', error: '' }))
  );
  const [started, setStarted] = useState(false);
  const runRef = useRef(false);

  const done  = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;
  const total  = results.length;
  const finished = done + errors === total && started;
  const progress = total ? Math.round(((done + errors) / total) * 100) : 0;

  useEffect(() => {
    if (runRef.current) return;
    runRef.current = true;
    setStarted(true);

    const destObjs = allDestinations.filter(d => selectedDestinations.includes(d.uri));
    const ottDestObjs = allOttDestinations.filter(d => selectedOttDestinations.includes(d.uri));

    async function run() {
      for (let i = 0; i < events.length; i++) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'creating' } : r));

        try {
          const event = await createLiveEvent(token, events[i]);
          const eventId = event.uri?.split('/').pop() || '';
          const managementUrl = `https://vimeo.com/manage/events/${eventId}`;
          const streamUrl = event.rtmps_link || event.rtmp_link || '';
          const streamKey = event.stream_key || '';

          for (const dest of destObjs) {
            try {
              await addDestinationToEvent(token, eventId, dest);
            } catch {
              // non-fatal
            }
          }

          for (const dest of ottDestObjs) {
            try {
              await addOttDestinationToEvent(token, userId, eventId, dest);
            } catch {
              // non-fatal
            }
          }

          setResults(prev => prev.map((r, idx) =>
            idx === i ? { ...r, status: 'success', eventId, managementUrl, streamUrl, streamKey } : r
          ));
        } catch (err) {
          setResults(prev => prev.map((r, idx) =>
            idx === i ? { ...r, status: 'error', error: err.message } : r
          ));
        }
      }
    }

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <h2 className="step-heading">
        {!finished ? 'Creating events…' : errors === total ? 'All events failed' : errors > 0 ? `${done} created, ${errors} failed` : `${done} event${done !== 1 ? 's' : ''} created`}
      </h2>
      <p className="step-desc" style={{ marginBottom: 20 }}>
        {!finished
          ? `Creating ${total} live event${total !== 1 ? 's' : ''}${selectedDestinations.length + selectedOttDestinations.length ? ` and linking ${selectedDestinations.length + selectedOttDestinations.length} destination${selectedDestinations.length + selectedOttDestinations.length !== 1 ? 's' : ''}` : ''}…`
          : 'Stream URLs and keys are below. Copy them into your encoder.'}
      </p>

      <div className="progress-wrap">
        <div className="progress-meta">
          <span>{done + errors} of {total} processed</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {finished && (
        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => exportResultsCSV(results)}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-ghost" onClick={onReset}>
            <RotateCcw size={14} /> Start over
          </button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Management</th>
              <th>Stream URL</th>
              <th>Stream Key</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <>
                <tr key={i}>
                  <td className="cell-title">{r.title}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="cell-link">
                    {r.managementUrl
                      ? <a href={r.managementUrl} target="_blank" rel="noopener noreferrer">
                          Open <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                        </a>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td>{r.streamUrl ? <CopyCell value={r.streamUrl} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{r.streamKey ? <CopyCell value={r.streamKey} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                </tr>
                {r.status === 'error' && r.error && (
                  <tr key={`${i}-error`}>
                    <td colSpan={5} style={{ padding: '6px 12px 10px', background: 'var(--surface-2)' }}>
                      <div className="feedback error" style={{ margin: 0, fontSize: 12 }}>
                        <AlertCircle size={13} /> {r.error}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
