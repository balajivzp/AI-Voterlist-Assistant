
import React from 'react';

interface ErrorDisplayProps {
    message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full p-4">
            <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-red-700">An Error Occurred</h3>
            <p className="mt-2 max-w-md text-red-600">
                {message}
            </p>
        </div>
    );
};

export default ErrorDisplay;
