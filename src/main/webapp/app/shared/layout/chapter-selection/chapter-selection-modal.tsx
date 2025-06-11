import React from 'react';
import './chapter-selection-modal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

function ChapterSelectionModal({ isOpen, onClose, onSelect, chapterCount, chapterStorageIds = {}, chaptersRead = new Set() }) {
  if (!isOpen) return null;

  return (
    <div className="chapter-modal-overlay">
      <div className="chapter-modal-content">
        <div className="chapter-modal-header">
          <span>Chọn Chương</span>
          <button className="chapter-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="chapter-modal-body">
          {chapterCount === 0 ? (
            <div className="no-chapters-message">Hiện chưa có chương nào.</div>
          ) : (
            <div className="chapter-grid">
              {[...Array(chapterCount)].map((_, index) => {
                const chapterNumber = index + 1;
                const isRead = chaptersRead.has(chapterStorageIds[chapterNumber]);
                return (
                  <div
                    key={index}
                    className={classNames('chapter-item', {
                      'chapter-item-read': isRead,
                      'chapter-item-unread': !isRead,
                    })}
                    onClick={() => onSelect(chapterNumber)}
                  >
                    Chương {chapterNumber}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterSelectionModal;
