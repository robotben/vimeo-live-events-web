import { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import TokenStep from './components/TokenStep';
import DestinationsStep from './components/DestinationsStep';
import CsvStep from './components/CsvStep';
import ResultsStep from './components/ResultsStep';

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
  csvEvents: [],
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);

  function update(patch) {
    setState(s => ({ ...s, ...patch }));
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <VimeoIcon />
        </div>
        <span className="app-title">Live Events Creator</span>
        <span className="app-subtitle">Batch creation tool</span>
      </header>

      <main className="app-main">
        <div className="wizard-container">
          <StepIndicator current={state.step} />

          <div className="card">
            {state.step === 1 && (
              <TokenStep
                onValidated={(token, user) => update({ token, user, step: 2 })}
              />
            )}

            {state.step === 2 && (
              <DestinationsStep
                token={state.token}
                selected={state.selectedDestinations}
                onSelectionChange={selectedDestinations => update({ selectedDestinations })}
                onNext={destinations => update({ destinations: destinations ?? state.destinations, step: 3 })}
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
                events={state.csvEvents}
                selectedDestinations={state.selectedDestinations}
                allDestinations={state.destinations}
                onReset={reset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
