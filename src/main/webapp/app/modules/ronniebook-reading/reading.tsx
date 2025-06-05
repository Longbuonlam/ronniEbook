import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../shared/layout/spinner/spinner';
import VoiceSelectionModal from '../../shared/layout/user-record-selection/user-record-select';
import TextToSpeechButton from '../../shared/layout/text-to-speech-button/text-to-speech-button';
import { UserRecord } from '../../shared/model/record.model';

import './reading.scss';
import toast from 'react-hot-toast';

function FileContent() {
  const { fileId } = useParams();
  const [content, setContent] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [chapterNumber, setChapterNumber] = useState(0);
  const [bookName, setBookName] = useState('');
  const [language, setLanguage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [googleDriveId, setGoogleDriveId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedUserRecord, setSelectedUserRecord] = useState<UserRecord | null>(null);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [ttsButtonActive, setTtsButtonActive] = useState(false);
  const location = useLocation();
  const bookId = location.state?.bookId;
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('serif');

  const defaultVoice: UserRecord = {
    id: '',
    userId: 'nữ lưu loát',
    path: '/tmp/gradio/01b4edbba4aec9b7bba6fb7e7d5170287b4739f4/nu-luu-loat.wav',
    recordUrl: 'https://thinhlpg-vixtts-demo.hf.space/file=/tmp/gradio/01b4edbba4aec9b7bba6fb7e7d5170287b4739f4/nu-luu-loat.wav',
    originalName: 'nu-luu-loat.wav',
    size: 0,
  };

  const fetchFileContent = () => {
    fetch(`http://localhost:9000/api/files/${fileId}`)
      .then(response => response.text())
      .then(data => {
        setContent(data);
      })
      .catch(error => console.error('Error fetching file:', error));
  };

  const fetchRawContent = () => {
    fetch(`http://localhost:9000/api/files/${fileId}/get-raw-content`)
      .then(response => response.text())
      .then(data => {
        setRawContent(data);
      })
      .catch(error => console.error('Error fetching raw content:', error));
  };

  const fetchChapterInfo = () => {
    fetch(`http://localhost:9000/api/chapters/get-info/${fileId}`)
      .then(response => response.json())
      .then(data => {
        setChapterName(data.chapterName);
        setChapterNumber(data.chapterNumber);
        setBookName(data.bookName);
        setLanguage(data.language);
      })
      .catch(error => console.error('Error fetching chapter info:', error));
  };

  const streamTextToSpeech = async (voice: UserRecord) => {
    setLoadingAudio(true);
    try {
      const token = getXsrfToken();

      if (!token) {
        console.error('XSRF token is missing');
        toast.error('Failed to process audio: XSRF token is missing');
        setLoadingAudio(false);
        return;
      }

      const requestBody = {
        content: rawContent,
        language: language,
        path: voice.path,
        recordUrl: voice.recordUrl,
        originalName: voice.originalName,
        size: voice.size,
      };

      const response = await fetch('http://localhost:9000/api/TTS/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/wav',
          'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
      toast.error(`Failed to process audio: ${error.message}`);
    } finally {
      setLoadingAudio(false);
    }
  };

  const fetchFileType = () => {
    fetch(`http://localhost:9000/api/files/${fileId}/get-files-info`)
      .then(response => response.text())
      .then(data => {
        if (data === 'docx') {
          setFileType('docx');
        } else {
          setFileType('google-drive');
          setGoogleDriveId(data);
        }
      })
      .catch(error => console.error('Error fetching file type:', error));
  };

  const fetchUserRecord = (pageNumber = 0) => {
    fetch(`http://localhost:9000/api/user-record?page=${pageNumber}&size=10`)
      .then(response => response.json())
      .then(data => {
        setUserRecords([defaultVoice, ...data.content]);
      })
      .catch(error => console.error('Error fetching user records:', error));
  };

  const checkSavedProgress = () => {
    fetch(`http://localhost:9000/api/reading-progress/check-saved-chapters?bookId=${bookId}&chapterStorageId=${fileId}`)
      .then(response => {
        if (response.ok) {
          response.json().then(result => {
            setHasSavedProgress(result);
          });
        } else {
          toast.error('Failed to check saved progress');
        }
      })
      .catch(error => {
        console.error('Error checking saved progress:', error);
      });
  };

  const handleTextToSpeechClick = () => {
    fetchUserRecord();
    setIsVoiceModalOpen(true);
    setTtsButtonActive(true);
  };

  const handleVoiceSelect = (voice: UserRecord) => {
    setSelectedUserRecord(voice);
    setIsVoiceModalOpen(false);
    setTtsButtonActive(false);

    streamTextToSpeech(voice);
  };

  const handleModalClose = () => {
    setIsVoiceModalOpen(false);
    setTtsButtonActive(false);
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const saveReadingProgress = (bookId: string, chapterStorageId: string) => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save reading progress: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/reading-progress?bookId=${bookId}&chapterStorageId=${chapterStorageId}`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          console.log('Reading progress saved successfully');
        } else {
          console.error('Failed to save reading progress');
        }
      })
      .catch(error => {
        console.error('Error saving reading progress:', error);
      });
  };

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        // User has reached the bottom of the page
        if (!hasSavedProgress && bookId && fileId) {
          saveReadingProgress(bookId, fileId);
          setHasSavedProgress(true);
        }
      }
    }
  };

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('reading-font-size') || 'medium';
    const savedFontFamily = localStorage.getItem('reading-font-family') || 'serif';
    setFontSize(savedFontSize);
    setFontFamily(savedFontFamily);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reading-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('reading-font-family', fontFamily);
  }, [fontFamily]);

  // Handle keyboard events for settings panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    fetchFileType();
    fetchChapterInfo();
    checkSavedProgress();
  }, [fileId]);

  useEffect(() => {
    if (fileType === 'docx') {
      fetchFileContent();
      fetchRawContent();
    }
  }, [fileType, fileId]);

  return (
    <div className="file-content">
      <div className="file-content-header">
        <button onClick={() => navigate(-1)}>&lt;</button>
        <h1>{bookName}</h1>
        <div className="header-controls">
          {fileType === 'docx' && (
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="settings-btn"
              title="Text settings"
              aria-label="Open text settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
              </svg>
            </button>
          )}
          <button>&gt;</button>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div
          className="settings-panel"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setIsSettingsOpen(false);
            }
          }}
        >
          <div className="settings-content">
            <h3>Cài đặt chế độ đọc</h3>

            <div className="setting-group">
              <label>Cỡ chữ:</label>
              <div className="font-size-controls">
                <button className={fontSize === 'small' ? 'active' : ''} onClick={() => setFontSize('small')} title="Small text">
                  A
                </button>
                <button className={fontSize === 'medium' ? 'active' : ''} onClick={() => setFontSize('medium')} title="Medium text">
                  A
                </button>
                <button className={fontSize === 'large' ? 'active' : ''} onClick={() => setFontSize('large')} title="Large text">
                  A
                </button>
                <button
                  className={fontSize === 'extra-large' ? 'active' : ''}
                  onClick={() => setFontSize('extra-large')}
                  title="Extra large text"
                >
                  A
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Phông chữ:</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} title="Choose font family">
                <option value="serif">Serif (Default)</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="monospace">Monospace</option>
                <option value="georgia">Georgia</option>
                <option value="times">Times New Roman</option>
                <option value="arial">Arial</option>
                <option value="helvetica">Helvetica</option>
                <option value="verdana">Verdana</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Bản xem trước:</label>
              <div className={`preview-text font-${fontSize} font-${fontFamily}`}>
                <p>
                  Đây là cách văn bản của bạn sẽ hiển thị với các cài đặt hiện tại. Bạn có thể điều chỉnh cỡ chữ và kiểu chữ theo sở thích
                  của mình.
                </p>
              </div>
            </div>

            <button onClick={() => setIsSettingsOpen(false)} className="close-settings-btn" title="Close settings (Press Esc)">
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className={`file-content-body font-${fontSize} font-${fontFamily}`} onScroll={handleScroll} ref={contentRef}>
        <div className="chapter-info">
          <h2>
            {bookName} - {chapterName}
          </h2>
          {fileType === 'docx' && // Only show the button for docx files
            (loadingAudio ? (
              <Spinner />
            ) : audioUrl ? (
              <audio controls src={audioUrl} />
            ) : (
              <TextToSpeechButton onClick={handleTextToSpeechClick} isActive={ttsButtonActive} />
            ))}
        </div>
        {fileType === 'docx' ? (
          <div className="reading-content" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="pdf-container">
            {googleDriveId ? (
              <iframe src={`https://drive.google.com/file/d/${googleDriveId}/preview`} allow="autoplay"></iframe>
            ) : (
              <p>Error loading preview</p>
            )}
          </div>
        )}
      </div>

      <VoiceSelectionModal isOpen={isVoiceModalOpen} onClose={handleModalClose} onSelect={handleVoiceSelect} voices={userRecords} />
    </div>
  );
}

export default FileContent;
