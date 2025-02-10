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
          <span>Upload and attach file</span>
          <button className="upload-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="upload-modal-body">
          <div className="upload-box">
            <input type="file" id="fileInput" onChange={handleFileChange} accept=".docx,.txt,.xlsx,.pptx,.xml" hidden />
            <label htmlFor="fileInput" className="upload-label">
              <FontAwesomeIcon icon={faUpload} />
              <p>Click to upload or drag and drop</p>
              <p className="file-types">DOCX, TXT, XLSX, PPTX, XML</p>
            </label>
            {selectedFile && <p className="selected-file">Selected file: {selectedFile.name}</p>}
          </div>
        </div>
        <div className="upload-modal-actions">
          <button className="upload-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="upload-btn-confirm" onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadFileModal;
