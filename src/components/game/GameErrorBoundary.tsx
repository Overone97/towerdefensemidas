import React from 'react';

type State = { hasError: boolean; message?: string };

export default class GameErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Game crashed:', error, errorInfo);
  }

  private handleSoftReset = () => {
    try {
      localStorage.removeItem('td_save_v1');
    } catch (error) {
      console.warn('Impossible de supprimer la sauvegarde locale', error);
    }
    window.location.reload();
  };

  private handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#070d16] text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-xl border border-red-400/40 bg-red-500/10 p-5">
          <h2 className="text-xl font-bold mb-2">⚠️ Le jeu a planté</h2>
          <p className="text-sm text-red-100/90 mb-2">On a intercepté l’erreur au lieu d’afficher un écran blanc.</p>
          <p className="text-xs font-mono text-red-200/90 mb-4 break-all">{this.state.message}</p>
          <div className="flex gap-2">
            <button onClick={this.handleReload} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm">Recharger</button>
            <button onClick={this.handleSoftReset} className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-sm">Reset save locale</button>
          </div>
        </div>
      </div>
    );
  }
}
