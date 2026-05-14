import { useEffect, useState } from 'react';
import { Loader, Wifi, Check, ArrowRight, ArrowLeft, SkipForward, Radio, Tv } from 'lucide-react';
import { getDestinations, getOttDestinations } from '../api/vimeo';

const SERVICE_LABELS = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitch: 'Twitch',
  twitter: 'X (Twitter)',
  custom_rtmp: 'Custom RTMP',
};

function DestinationList({ destinations, selected, onToggle, icon: Icon, emptyMessage }) {
  function toggleAll() {
    const allUris = destinations.map(d => d.uri);
    const allSelected = allUris.every(u => selected.includes(u));
    onToggle(allSelected ? selected.filter(u => !allUris.includes(u)) : [...new Set([...selected, ...allUris])]);
  }

  if (destinations.length === 0) {
    return (
      <div className="destinations-empty">
        <Wifi size={28} style={{ color: 'var(--border)' }} />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const allSelected = destinations.every(d => selected.includes(d.uri));

  return (
    <>
      <div className="selection-summary">
        <span className="selection-count">
          <span>{destinations.filter(d => selected.includes(d.uri)).length}</span> of {destinations.length} selected
        </span>
        <button className="btn btn-ghost" onClick={toggleAll} style={{ padding: '4px 10px', fontSize: 12 }}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="destinations-list">
        {destinations.map(dest => {
          const isSelected = selected.includes(dest.uri);
          const serviceLabel = SERVICE_LABELS[dest.service_name] || dest.service_name || dest.type || 'Destination';
          return (
            <div
              key={dest.uri}
              className={`destination-item${isSelected ? ' selected' : ''}`}
              onClick={() => onToggle(isSelected ? selected.filter(u => u !== dest.uri) : [...selected, dest.uri])}
            >
              <div className="destination-checkbox">
                {isSelected && <Check size={12} strokeWidth={3} color="#141414" />}
              </div>
              <div className="destination-icon">
                <Icon size={16} />
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
  );
}

export default function DestinationsStep({ token, userId, selected, onSelectionChange, selectedOtt, onOttSelectionChange, onNext, onBack }) {
  const [destinations, setDestinations] = useState([]);
  const [ottDestinations, setOttDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDestinations(token),
      userId ? getOttDestinations(token, userId) : Promise.resolve([]),
    ]).then(([dest, ott]) => {
      setDestinations(dest);
      setOttDestinations(ott);
      setLoading(false);
    });
  }, [token, userId]);

  const handleNext = () => onNext(destinations, ottDestinations);

  return (
    <>
      <h2 className="step-heading">Simulcast destinations</h2>
      <p className="step-desc">
        Select destinations to add to every event in the batch. Skip this step if you don't need simulcasting.
      </p>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '32px 0' }}>
          <Loader size={18} className="spin" /> Fetching destinations…
        </div>
      ) : (
        <>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Simulcast
          </h4>
          <DestinationList
            destinations={destinations}
            selected={selected}
            onToggle={onSelectionChange}
            icon={Radio}
            emptyMessage="No simulcast destinations found. Add them in your Vimeo Live settings."
          />

          <h4 style={{ margin: '24px 0 12px', fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OTT
          </h4>
          <DestinationList
            destinations={ottDestinations}
            selected={selectedOtt}
            onToggle={onOttSelectionChange}
            icon={Tv}
            emptyMessage="No OTT destinations found on this account."
          />
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
