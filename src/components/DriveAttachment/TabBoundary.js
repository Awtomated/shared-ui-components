import { Component } from "react";

// Contains any failure from caller-supplied tab content (a remote that
// fails to load, a render-time crash inside it) to that one tab, so it can
// never propagate to - and unmount/reload - the surrounding form or modal.
// A class component because error boundaries still require one;
// deliberately self-contained so this package takes no react-error-boundary
// dependency. Remount it (via `key`) to retry.
class TabBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

export default TabBoundary;
