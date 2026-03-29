
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
      <p className="text-gray-700 mb-4">Something went wrong while loading the application.</p>
      <details className="mb-4">
        <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {error.message}
          {error.stack}
        </pre>
      </details>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  root.render(<ErrorFallback error={error as Error} />);
}
