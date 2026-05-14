import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import TokenStep from './components/TokenStep';
import DestinationsStep from './components/DestinationsStep';
import CsvStep from './components/CsvStep';
import ResultsStep from './components/ResultsStep';
import SettingsModal from './components/SettingsModal';
import { validateToken } from './api/vimeo';

const TOKEN_KEY = 'vimeo_token';

function VimeoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#141414" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.4 7.3c-.1 2.4-1.8 5.7-5 9.8C14.1 21.4 11.3 23 9.1 23c-1.4 0-2.5-1.3-3.5-3.8L3.8 13c-.7-2.5-1.5-3.7-2.3-3.7-.2 0-.8.4-1.9 1.1L-.3 9c1.2-1 2.3-2.1 3.4-3.1 1.5-1.3 2.7-2 3.5-2 1.8-.2 2.9 1.1 3.3 3.8.5 2.9.8 4.7 1 5.4.5 2.4 1.1 3.6 1.7 3.6.5 0 1.2-.7 2.1-2.2.9-1.5 1.4-2.6 1.4-3.3.1-1.2-.3-1.9-1.4-1.9-.5 0-1 .1-1.5.3 1-3.3 2.9-4.9 5.7-4.8 2.1 0 3.1 1.4 3 4.5z"/>
    </svg>
  );
}

const INITIAL_STATE = {
  step: 1,
  token: '',
  user: null,
  destinations: [],
  selectedDestinations: [],
  ottDestinations: [],
  selectedOttDestinations: [],
  csvEvents: [],
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [showSettings, setShowSettings] = useState(false);
  const [autoValidating, setAutoValidating] = useState(false);

  function update(patch) {
    setState(s => ({ ...s, ...patch }));
  }

  function reset() {
    setState(s => ({ ...INITIAL_STATE, token: s.token, user: s.user, step: s.token ? 2 : 1 }));
  }

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return;
    setAutoValidating(true);
    validateToken(saved)
      .then(user => update({ token: saved, user, step: 2 }))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setAutoValidating(false));
  }, []);

  function handleTokenValidated(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    update({ token, user, step: 2 });
  }

  function handleSettingsSave(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    update({ token, user, step: 2 });
    setShowSettings(false);
  }

  function handleSettingsClear() {
    localStorage.removeItem(TOKEN_KEY);
    setState({ ...INITIAL_STATE });
    setShowSettings(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo"><VimeoIcon /></div>
        <span className="app-title">Live Events Creator</span>
        <span className="app-subtitle">Batch creation tool</span>
        <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings" style={{ marginLeft: 8 }}>
          <Settings size={18} />
        </button>
      </header>

      {showSettings && (
        <SettingsModal
          currentToken={state.token}
          onSave={handleSettingsSave}
          onClear={handleSettingsClear}
          onClose={() => setShowSettings(false)}
        />
      )}

      <main className="app-main">
        <div className="wizard-container">
          <StepIndicator current={state.step} />

          <div className="card">
            {autoValidating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '32px 0' }}>
                <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                Signing in…
              </div>
            ) : state.step === 1 ? (
              <TokenStep onValidated={handleTokenValidated} />
            ) : null}

            {state.step === 2 && (
              <DestinationsStep
                token={state.token}
                userId={state.user?.uri?.split('/').pop()}
                selected={state.selectedDestinations}
                onSelectionChange={selectedDestinations => update({ selectedDestinations })}
                selectedOtt={state.selectedOttDestinations}
                onOttSelectionChange={selectedOttDestinations => update({ selectedOttDestinations })}
                onNext={(destinations, ottDestinations) => update({
                  destinations: destinations ?? state.destinations,
                  ottDestinations: ottDestinations ?? state.ottDestinations,
                  step: 3,
                })}
                onBack={() => update({ step: 1 })}
              />
            )}

            {state.step === 3 && (
              <CsvStep
                events={state.csvEvents}
                onEventsChange={csvEvents => update({ csvEvents })}
                onNext={() => update({ step: 4 })}
                onBack={() => update({ step: 2 })}
              />
            )}

            {state.step === 4 && (
              <ResultsStep
                token={state.token}
                userId={state.user?.uri?.split('/').pop()}
                events={state.csvEvents}
                selectedDestinations={state.selectedDestinations}
                allDestinations={state.destinations}
                selectedOttDestinations={state.selectedOttDestinations}
                allOttDestinations={state.ottDestinations}
                onReset={reset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
