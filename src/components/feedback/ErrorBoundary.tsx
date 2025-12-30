import { Component, ReactNode } from "react";

type ErrorBoundaryFallback =
  | ReactNode
  | ((args: { error: unknown; reset: () => void }) => ReactNode);

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ErrorBoundaryFallback;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  error: unknown | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  private reset() {
    this.props.onReset?.();
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      return fallback;
    }

    return this.props.children;
  }
}
