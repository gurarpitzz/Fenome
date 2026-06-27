import * as React from 'react';
import { AlertCircle, RefreshCw, Terminal, ArrowLeft } from 'lucide-react';


interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error inside FINOME React Tree:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }


  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-white select-text overflow-y-auto">
          {/* Futuristic grid scanlines backgrounds */}
          <div className="absolute inset-0 bg-radial-gradient(circle, rgba(255, 31, 31, 0.05) 0%, transparent 80%) opacity-50 pointer-events-none" />
          <div className="scanline" />
          <div className="grain pointer-events-none" />

          <div className="w-full max-w-2xl bg-glass border border-red-threat/20 rounded-[2rem] p-10 relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(255,31,31,0.15)] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-threat to-amber-neon animate-pulse" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-threat/10 border border-red-threat/30 flex items-center justify-center text-red-threat animate-pulse">
                <AlertCircle size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black font-mono tracking-tight text-white uppercase">FINOME Diagnostic Core</h1>
                <p className="text-[9px] font-mono leading-none tracking-widest text-red-threat font-bold mt-1 uppercase">RESCUE INTERCEPT ACTIVE</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-6">
              The neural operating system intercepted a thread execution crash. The safety core has sandboxed the exception details below to allow troubleshooting and system restoration.
            </p>

            {/* Error Message Details display container */}
            <div className="bg-black/60 border border-white/5 rounded-2xl p-6 font-mono text-xs text-red-threat/90 overflow-x-auto max-h-56 custom-scrollbar mb-8 leading-relaxed space-y-3">
              <div className="flex gap-2 text-white/50 border-b border-white/5 pb-2 uppercase text-[9px] font-bold tracking-widest">
                <Terminal size={12} /> Registry Error Logs
              </div>
              <div>
                <strong className="text-red-threat">Message:</strong> {this.state.error?.toString()}
              </div>
              {this.state.errorInfo?.componentStack && (
                <div className="text-[10px] text-white/40 border-t border-white/5 pt-3 whitespace-pre break-all">
                  <strong>Stack trace:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            {/* Action controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3.5 bg-red-threat text-black hover:bg-red-400 font-extrabold uppercase text-[10px] tracking-[0.25em] rounded-xl flex items-center justify-center gap-3 transition-colors shadow-[0_4px_20px_rgba(255,31,31,0.2)] cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin" /> Reload Neural Core
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 font-extrabold uppercase text-[10px] tracking-[0.25em] rounded-xl flex items-center justify-center gap-3 transition-colors text-white cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Gateway
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
