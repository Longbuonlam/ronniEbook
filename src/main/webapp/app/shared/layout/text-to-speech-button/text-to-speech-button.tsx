import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './text-to-speech-button.scss';

export default function TextToSpeechButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div className="tts-container">
      <button onClick={onClick} className={`tts-button ${isActive ? 'active' : ''}`}>
        {isActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
        <span>{isActive ? 'Choosing voice' : 'Hear This Chapter'}</span>
      </button>
    </div>
  );
}
