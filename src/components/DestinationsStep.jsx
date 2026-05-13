import { useEffect, useState } from 'react';
import { Loader, Wifi, Check, ArrowRight, ArrowLeft, SkipForward, Radio } from 'lucide-react';
import { getDestinations } from '../api/vimeo';

const SERVICE_LABELS = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitch: 'Twitch',
  twitter: 'X (Twitter)',
  custom_rtmp: 'Custom RTMP',
};

export default function DestinationsStep({ token, selected, onSelectionChange, onNext, onBack }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinations(token).then(data => {
      setDestinations(data);
      setLoading(false);
    });
  }, [token]);

  const handleNext = () => onNext(destinations);

  function toggle(uri) {
    onSelectionChange(
      selected.includes(uri) ? selected.filter(u => u !== uri) : [...selected, uri]
    );
  }

  function toggleAll() {
    onSelectionChange(selected.length === destinations.length ? [] : destinations.map(d => d.uri));
  }

  return (
    <>
      <h2 className="step-heading">Simulcast destinations</h2>
      <p className="step-desc">
        Select destinations from your Vimeo account to add to every event in the batch.
        You can skip this step if you don't need simulcasting.
      </p>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '32px 0' }}>
          <Loader size={18} className="spin" /> Fetching destinations…
        </div>
      ) : destinations.length === 0 ? (
        <div className="destinations-empty">
          <Wifi size={36} style={{ color: 'var(--border)' }} />
          <p>No simulcast destinations found on this account.<br />You can add them in your Vimeo Live settings, or skip this step.</p>
        </div>
      ) : (
        <>
          <div className="selection-summary">
            <span className="selection-count">
              <span>{selected.length}</span> of {destinations.length} selected
            </span>
            <button className="btn btn-ghost" onClick={toggleAll} style={{ padding: '4px 10px', fontSize: 12 }}>
              {selected.length === destinations.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="destinations-list">
            {destinations.map(dest => {
              const isSelected = selected.includes(dest.uri);
              const serviceLabel = SERVICE_LABELS[dest.service_name] || dest.service_name || 'Destination';
              return (
                <div
                  key={dest.uri}
                  className={`destination-item${isSelected ? ' selected' : ''}`}
                  onClick={() => toggle(dest.uri)}
                >
                  <div className="destination-checkbox">
                    {isSelected && <Check size={12} strokeWidth={3} color="#141414" />}
                  </div>
                  <div className="destination-icon">
                    <Radio size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="destination-name">{dest.display_name || dest.name || serviceLabel}</div>
                    <div className="destination-service">{serviceLabel}</div>
                  </div>
                  {isSelected && (
                    <span className="badge" style={{ background: 'rgba(23,213,255,0.12)', color: 'var(--accent)' }}>
                      Added
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="step-actions-right">
          <button className="btn btn-ghost" onClick={handleNext}>
            <SkipForward size={15} /> Skip
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
            Continue <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
