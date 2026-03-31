import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

class UnitPanelErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Erreur inconnue' };
  }

  componentDidCatch(error: Error) {
    console.error('UnitPanelErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[min(92vw,340px)] rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100 shadow-2xl backdrop-blur-md">
          <div className="font-bold mb-1">⚠️ Panneau unité désactivé</div>
          <div className="text-xs text-red-200/80">{this.state.message}</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default UnitPanelErrorBoundary;
