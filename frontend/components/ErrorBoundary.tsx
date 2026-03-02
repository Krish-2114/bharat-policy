"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default function ErrorBoundaryWrapper({ children }: Props) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-zinc-800 bg-zinc-900/40 rounded-2xl max-w-2xl mx-auto mt-12 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-6 max-w-md">
            An unexpected error occurred in this component. We&apos;ve logged the issue and are looking into it.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors ring-1 ring-zinc-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
