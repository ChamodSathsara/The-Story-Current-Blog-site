import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode;}, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#FF5A00]">Something went wrong</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#111827]">We hit an unexpected error</h1>
        <p className="mt-2 max-w-md text-[#6B7280]">Please refresh the page. If the problem continues, contact us and let us know what happened.</p>
        <button onClick={() => window.location.assign('/')} className="mt-6 rounded-md bg-[#FF5A00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E94E00]">
          Back to homepage
        </button>
      </div>);

  }
}