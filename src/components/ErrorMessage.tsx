import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showDetails?: boolean;
  details?: string;
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  action,
  secondaryAction,
  showDetails = false,
  details,
}: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              {action && (
                <button
                  onClick={action.onClick}
                  className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  {action.label}
                </button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="ml-3 rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          </div>
          {showDetails && details && (
            <div className="mt-4">
              <div className="rounded-md bg-red-100 p-3">
                <pre className="text-sm text-red-800 overflow-auto">
                  {details}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 