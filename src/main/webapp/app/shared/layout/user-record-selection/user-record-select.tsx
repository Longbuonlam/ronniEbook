import React, { useRef, useState } from 'react';
import './user-record-select.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

function VoiceSelectionModal({ isOpen, onClose, onSelect, voices }) {
  const [playingAudio, setPlayingAudio] = useState<{ id: string; audio: HTMLAudioElement } | null>(null);
  const audioMap = useRef(new Map());

  if (!isOpen) return null;

  const handlePlayAudio = (event, voiceId, recordUrl) => {
    // Prevent the click from selecting the voice
    event.stopPropagation();

    // If there's currently audio playing, stop it
    if (playingAudio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;

      // If user clicked on the same voice that was playing, just stop it
      if (playingAudio.id === voiceId) {
        setPlayingAudio(null);
        return;
      }
    }

    // Play the new audio
    const audio = new Audio(recordUrl);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
    setPlayingAudio({ id: voiceId, audio });
  };

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal-content">
        <div className="voice-modal-header">
          <span>Select Voice</span>
          <button className="voice-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="voice-modal-body">
          {voices.length === 0 ? (
            <div className="no-voices-message">No voices available.</div>
          ) : (
            <div className="voice-grid">
              {voices.map((voice, index) => (
                <div key={voice.id || index} className="voice-item" onClick={() => onSelect(voice)}>
                  <div className="voice-name">{voice.userId || `Voice ${index + 1}`}</div>

                  {voice.recordUrl && (
                    <button
                      className="voice-audio-btn"
                      onClick={e => handlePlayAudio(e, voice.id || index, voice.recordUrl)}
                      aria-label={playingAudio?.id === (voice.id || index) ? 'Pause audio' : 'Play audio'}
                    >
                      <FontAwesomeIcon icon={playingAudio?.id === (voice.id || index) ? faPause : faPlay} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceSelectionModal;
