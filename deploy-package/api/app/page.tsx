import React from 'react';
import VoiceChat from './components/VoiceChat';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Universal Pine</h1>
        <h2 className="text-2xl text-center mb-12">人とAIを繋げる</h2>
        
        <div className="flex justify-center w-full">
          <VoiceChat />
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-2">© 2025 Universal Pine. All rights reserved.</p>
          <p className="text-xs text-gray-400">Powered by OpenAI Voice API</p>
        </div>
      </div>
    </main>
  );
}
