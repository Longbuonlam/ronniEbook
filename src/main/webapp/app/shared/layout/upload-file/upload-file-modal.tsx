import React, { useState } from 'react';
import './upload-file-modal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faUpload } from '@fortawesome/free-solid-svg-icons';

function UploadFileModal({ isOpen, onClose, onUpload, file }) {
  const [selectedFile, setSelectedFile] = useState(file || null);

  const handleFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-content">
        <div className="upload-modal-header">
          <span>Tải lên và đính kèm tệp</span>
          <button className="upload-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="upload-modal-body">
          <div className="upload-box">
            <input type="file" id="fileInput" onChange={handleFileChange} accept=".docx,.pdf" hidden />
            <label htmlFor="fileInput" className="upload-label">
              <FontAwesomeIcon icon={faUpload} />
              <p>Nhấn để tải lên hoặc kéo thả</p>
              <p className="file-types">DOCX or PDF</p>
            </label>
            {selectedFile && <p className="selected-file">Tệp đã chọn: {selectedFile.name}</p>}
          </div>
        </div>
        <div className="upload-modal-actions">
          <button className="upload-btn-cancel" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="upload-btn-confirm" onClick={handleUpload} disabled={!selectedFile}>
            Tải lên
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadFileModal;
