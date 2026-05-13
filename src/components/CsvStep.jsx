import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, X, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';

export default function CsvStep({ events, onEventsChange, onNext, onBack }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      onEventsChange([]);
      return;
    }
    setError('');
    try {
      const parsed = await parseCSV(file);
      setFileName(file.name);
      onEventsChange(parsed);
    } catch (err) {
      setError(err.message);
      onEventsChange([]);
    }
  }, [onEventsChange]);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function clearFile() {
    setFileName('');
    onEventsChange([]);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  const hasEvents = events.length > 0;

  return (
    <>
      <h2 className="step-heading">Upload your event CSV</h2>
      <p className="step-desc">
        CSV must have a <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>title</code> column.
        An optional <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>description</code> column is also supported.
      </p>

      {!hasEvents ? (
        <div
          className={`drop-zone${dragging ? ' dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="drop-zone-icon">
            <Upload size={32} />
          </div>
          <h3>{dragging ? 'Drop it!' : 'Drag & drop your CSV'}</h3>
          <p>or click to browse files</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="drop-zone has-file" style={{ marginBottom: 24 }} onClick={() => inputRef.current?.click()}>
          <div className="drop-zone-icon">
            <FileText size={28} />
          </div>
          <h3>{fileName}</h3>
          <p>{events.length} event{events.length !== 1 ? 's' : ''} ready to create</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {error && (
        <div className="feedback error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {hasEvents && (
        <>
          <div className="preview-header">
            <h4>Preview</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{events.length} row{events.length !== 1 ? 's' : ''}</span>
              <button className="btn-icon" onClick={clearFile} title="Remove file">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((e, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                    <td className="cell-title">{e.title}</td>
                    <td className="cell-desc">{e.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}</td>
                  </tr>
                ))}
                {events.length > 10 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: 13 }}>
                      + {events.length - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="feedback success" style={{ marginTop: 16 }}>
            <CheckCircle size={15} /> Ready to create {events.length} live event{events.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!hasEvents}>
          Create {hasEvents ? events.length : ''} event{events.length !== 1 ? 's' : ''} <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}
