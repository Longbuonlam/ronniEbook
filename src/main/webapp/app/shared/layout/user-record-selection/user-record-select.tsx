import React from 'react';
import './user-record-select.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function VoiceSelectionModal({ isOpen, onClose, onSelect, voices }) {
  if (!isOpen) return null;

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
                <div
                  key={voice.id || index}
                  className="voice-item"
                  onClick={() => onSelect(voice)} // Pass the full UserRecord object
                >
                  {voice.userId || `Voice ${index + 1}`}
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
