import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center">
                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="ml-4">
                <h1 className="text-2xl font-bold text-slate-800">AI Voter List Extractor</h1>
                <p className="text-xs text-slate-500 -mt-1">Powered by the Gemini API</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;