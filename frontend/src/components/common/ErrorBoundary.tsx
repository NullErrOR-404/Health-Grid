import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🛡️ [HealthGrid ErrorBoundary] Caught render exception:', error, errorInfo);
  }

  handleReload = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[480px] w-full flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-900/5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              {this.props.fallbackTitle || 'Workspace Error Caught'}
            </h2>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              HealthGrid active self-healing shield prevented this view from crashing. You can safely reload the component or return to the main dashboard.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Technical Details
                </div>
                <div className="text-xs font-mono text-rose-600 break-words line-clamp-3">
                  {this.state.error.message || 'Unknown runtime error'}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Workspace
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
