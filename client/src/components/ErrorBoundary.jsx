import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h1 style={{ color: '#e53e3e', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>Error Details</summary>
            <pre style={{ 
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
