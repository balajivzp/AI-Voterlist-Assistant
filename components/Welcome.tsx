
import React from 'react';

const Welcome: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
             <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-slate-700">Ready to Extract</h3>
            <p className="mt-2 max-w-md">
                Upload an image or PDF of a voter list page on the left, then click "Extract Details" to let the AI process the document and display the structured information here.
            </p>
        </div>
    );
};

export default Welcome;
