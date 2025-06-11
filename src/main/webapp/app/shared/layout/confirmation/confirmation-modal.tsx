import React from 'react';
import './confirmation-modal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">
          <span>Xác nhận</span>
          <button className="confirm-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn-cancel" onClick={onClose}>
            Không, hủy bỏ
          </button>
          <button className="confirm-btn-confirm" onClick={onConfirm}>
            Vâng, tôi chắc chắn
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
