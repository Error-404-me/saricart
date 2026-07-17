import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Swap for real error reporting (Sentry, etc.) when this ships.
    console.error("Uncaught render error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-4 text-center">
        <span className="rounded-full bg-[var(--color-crate)]/10 p-3 text-[var(--color-crate)]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          Something went wrong
        </h1>
        <p className="max-w-sm text-[var(--color-muted)]">
          That wasn't supposed to happen. Try going back to the home page — if it keeps
          happening, let us know what you were doing.
        </p>
        <Button variant="secondary" onClick={this.handleReload}>
          Back to home
        </Button>
      </div>
    );
  }
}
