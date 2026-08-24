import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Kept intentionally minimal — no console noise in production builds.
    this.setState({ error, info });
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-pen/40 rounded-lg p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 text-pen" size={32} strokeWidth={1.5} />
            <h1 className="font-display text-2xl text-ink mb-2">
              Something tore the page
            </h1>
            <p className="text-muted text-sm font-sans mb-6">
              Margin hit an unexpected error rendering this view. Your other
              uploaded posts are safe — reload to start fresh here.
            </p>
            <button
              onClick={this.handleReset}
              className="font-sans text-sm font-medium bg-pen hover:bg-pen-dim text-paper px-5 py-2.5 rounded-md transition-colors"
            >
              Reload Margin
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
