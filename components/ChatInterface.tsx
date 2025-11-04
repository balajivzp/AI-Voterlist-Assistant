
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Voter } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const VoterCard: React.FC<{ voter: Voter }> = ({ voter }) => {
    const genderIconEl = (
        <div className={`mr-1.5 p-1 rounded-full ${voter.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${voter.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 w-full text-sm text-slate-700 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-base text-slate-800">{voter.name}</h4>
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold py-1 px-2 rounded-full">
                    S.No: {voter.serialNumber}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="flex items-center" title="Voter ID">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 9h6" /></svg>
                    <span className="font-mono text-slate-600 truncate">{voter.voterId}</span>
                </div>
                 <div className="flex items-center" title="House Number">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="truncate">H.No: {voter.houseNumber}</span>
                </div>
                 <div className="flex items-center" title="Gender & Age">
                    {genderIconEl}
                    <span className="capitalize">{voter.gender}, {voter.age} yrs</span>
                </div>
                 <div className="flex items-center" title="Relation">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197M12 12a4 4 0 110-8 4 4 0 010 8z" /></svg>
                    <span className="capitalize truncate">{voter.relationType}: {voter.relationName}</span>
                </div>
            </div>
        </div>
    );
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto pr-2 bg-slate-50/70 rounded-lg p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-xl max-w-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>

            {msg.role === 'model' && msg.voters && msg.voters.length > 0 && (
              <div className="mt-2 w-full max-w-lg space-y-2">
                {msg.voters.map(voter => <VoterCard key={voter.voterId || voter.serialNumber} voter={voter} />)}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="p-3 rounded-xl rounded-bl-none max-w-lg bg-white text-slate-800 border border-slate-200">
               <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about the voter list..."
          disabled={isLoading}
          className="flex-grow p-3 bg-white border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 transition-colors"
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white font-bold p-3 rounded-r-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors duration-300 flex items-center justify-center"
          aria-label="Send message"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(90 12 12)" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
