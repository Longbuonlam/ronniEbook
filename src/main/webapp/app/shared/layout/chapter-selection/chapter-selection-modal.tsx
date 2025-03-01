import React from 'react';
import './chapter-selection-modal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function ChapterSelectionModal({ isOpen, onClose, onSelect, chapterCount }) {
  if (!isOpen) return null;

  return (
    <div className="chapter-modal-overlay">
      <div className="chapter-modal-content">
        <div className="chapter-modal-header">
          <span>Select Chapter</span>
          <button className="chapter-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="chapter-modal-body">
          {chapterCount === 0 ? (
            <div className="no-chapters-message">No chapters available.</div>
          ) : (
            <div className="chapter-grid">
              {[...Array(chapterCount)].map((_, index) => (
                <div key={index} className="chapter-item" onClick={() => onSelect(index + 1)}>
                  Chapter {index + 1}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterSelectionModal;
