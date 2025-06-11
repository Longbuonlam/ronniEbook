import React, { useState } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import './upload-record-speech.scss';
import { Upload, Mic, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UploadOrRecordAudioModal = ({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File | Blob) => Promise<void>;
}) => {
  const [viewMode, setViewMode] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (audioBlob: File | Blob) => {
    setUploading(true);
    try {
      await onUpload(audioBlob);
      onClose();
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <span className="modal-title">
            <span className="modal-icon">🎵</span>
            Ghi âm hoặc Tải lên Giọng nói
          </span>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="modal-instruction">📄 Bạn có thể tải lên một tệp hoặc ghi âm giọng nói của bạn với nội dung sau:</p>
        <blockquote className="modal-quote">
          "Tôi tên là Nguyễn Văn A. Tôi rất vui được gặp bạn hôm nay. Sau đây tôi xin thu âm giọng nói của mình để phục vụ cho đồ án tốt
          nghiệp của tôi."
        </blockquote>

        {viewMode === 'upload' ? (
          <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className="upload-icon-container">
              <Upload size={32} />
            </div>
            <div className="upload-text">
              <p className="upload-heading">Kéo và thả tệp âm thanh vào đây</p>
              <p className="upload-separator">- hoặc -</p>
              <p className="upload-heading">Nhấn để tải lên</p>
            </div>
            <input type="file" accept="audio/*" onChange={handleFileChange} className="file-input" id="audio-upload" />
            <label htmlFor="audio-upload" className="file-label">
              Chọn tệp
            </label>
            {file && (
              <div className="selected-file">
                <p className="file-name">Đã chọn tệp: {file.name}</p>
                <button className="upload-button" onClick={() => file && handleUpload(file)} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="record-area">
            <ReactMediaRecorder
              audio
              render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                <div className="recorder-container">
                  <div className="record-controls">
                    {status === 'recording' ? (
                      <button className="stop-button" onClick={stopRecording}>
                        <div className="record-indicator recording"></div>
                        Dừng ghi âm
                      </button>
                    ) : (
                      <button className="record-button" onClick={startRecording}>
                        <div className="record-indicator"></div>
                        Ghi âm
                      </button>
                    )}
                    <div className="mic-select">Mặc định - Micrô</div>
                  </div>

                  <div className="status-display">
                    Trạng thái: <span className={`status-text ${status === 'recording' ? 'recording' : ''}`}>{status}</span>
                  </div>

                  {mediaBlobUrl && (
                    <div className="audio-preview">
                      <audio src={mediaBlobUrl} controls className="audio-player" />
                      <button
                        className="upload-button"
                        onClick={async () => {
                          const blob = await fetch(mediaBlobUrl).then(res => res.blob());
                          handleUpload(blob);
                        }}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload Recorded Audio'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        )}

        <div className="toggle-controls">
          <button className={`toggle-button ${viewMode === 'upload' ? 'active' : ''}`} onClick={() => setViewMode('upload')}>
            <Upload size={20} />
          </button>
          <button className={`toggle-button ${viewMode === 'record' ? 'active' : ''}`} onClick={() => setViewMode('record')}>
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadOrRecordAudioModal;
