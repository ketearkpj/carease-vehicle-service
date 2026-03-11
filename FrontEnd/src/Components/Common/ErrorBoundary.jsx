import React from 'react';
import '../../Styles/ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Application crash captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <h1>Application Error</h1>
            <p>A runtime error occurred. Details are shown below for debugging.</p>
            <pre className="error-boundary-message">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <details className="error-boundary-details">
              <summary>Stack trace</summary>
              <pre>{this.state.error?.stack}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
            <button type="button" onClick={this.handleReload}>Reload App</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
