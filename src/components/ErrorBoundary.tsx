import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden border border-red-100 flex flex-col max-h-[90vh]">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4 shrink-0">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-700 mb-2">Application Crashed</h1>
                <p className="text-red-600 font-medium text-lg">
                  {this.state.error?.message || "An unexpected runtime error occurred."}
                </p>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-900 grow">
              <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider">Stack Trace</h3>
              <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap break-words mb-6 p-4 bg-slate-950 rounded-lg border border-red-900/30">
                {this.state.error?.stack}
              </pre>

              {this.state.errorInfo && (
                <>
                  <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider">React Component Stack</h3>
                  <pre className="text-amber-400 text-sm font-mono whitespace-pre-wrap break-words p-4 bg-slate-950 rounded-lg border border-amber-900/30">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 justify-end shrink-0">
              <button 
                onClick={this.handleClearAndReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
                title="Clears local storage, unregisters service workers, and reloads"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache & Reload
              </button>
              <button 
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
