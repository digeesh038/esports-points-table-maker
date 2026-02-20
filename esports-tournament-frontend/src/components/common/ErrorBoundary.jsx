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
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg text-center my-4">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong.</h2>
                    <p className="text-gray-400 text-sm mb-4">We encountered an error displaying this component.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                    <details className="mt-4 text-left text-xs text-gray-500 font-mono bg-black/20 p-2 rounded overflow-auto max-h-40">
                        {this.state.error && this.state.error.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
