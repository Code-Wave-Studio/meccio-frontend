import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MECCIO render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="font-display text-4xl tracking-[0.2em] mb-4">MECCIO</h1>
            <p className="text-stone mb-6">Something went wrong. Please refresh the page.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-charcoal text-cream text-sm uppercase tracking-wider"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
