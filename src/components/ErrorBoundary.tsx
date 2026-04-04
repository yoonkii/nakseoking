"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching render errors.
 * Shows a friendly message instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h1 className="font-jua text-2xl mb-2">앗! 뭔가 잘못됐어요</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            게임에 문제가 생겼습니다. 새로고침해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-white border-[3px] border-[var(--text)] rounded-[4px] px-8 py-3 font-jua text-lg"
            style={{ background: "var(--safe)" }}
          >
            새로고침 🔄
          </button>
          {this.state.error && (
            <details className="mt-6 text-left w-full max-w-md">
              <summary className="text-xs cursor-pointer" style={{ color: "var(--muted)" }}>
                에러 상세
              </summary>
              <pre className="text-xs mt-2 p-2 bg-white border rounded overflow-auto" style={{ maxHeight: 150 }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
