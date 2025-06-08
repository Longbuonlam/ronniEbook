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

  // SSE streaming states
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isStreamingAudio, setIsStreamingAudio] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

    streamTextToSpeechSSE(voice);
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

  // Debug state changes
  useEffect(() => {
    console.log('State change - loadingAudio:', loadingAudio);
  }, [loadingAudio]);

  useEffect(() => {
    console.log('State change - audioUrl:', audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    console.log('State change - audioQueue:', audioQueue);
  }, [audioQueue]);

  useEffect(() => {
    console.log('State change - isStreamingAudio:', isStreamingAudio);
  }, [isStreamingAudio]);

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

  const streamTextToSpeechSSE = async (voice: UserRecord) => {
    console.log('Starting SSE streaming...');
    setLoadingAudio(true);
    setIsStreamingAudio(true);
    setAudioQueue([]);
    setCurrentAudioIndex(0);
    setAudioBlobs(new Map());
    setAudioUrl(''); // Clear existing audio

    // Also clear the audio element source
    if (audioRef.current) {
      audioRef.current.src = '';
      audioRef.current.load();
    }

    try {
      const token = getXsrfToken();

      if (!token) {
        console.error('XSRF token is missing');
        toast.error('Failed to process audio: XSRF token is missing');
        setLoadingAudio(false);
        setIsStreamingAudio(false);
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

      // Step 1: Initialize the stream and get stream ID
      console.log('Initializing stream...');
      const initResponse = await fetch('http://localhost:9000/api/TTS/init-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!initResponse.ok) {
        throw new Error(`Failed to initialize stream: ${initResponse.status}: ${initResponse.statusText}`);
      }

      const streamId = await initResponse.text();
      console.log('Stream initialized with ID:', streamId);

      // Step 2: Connect to the SSE stream using EventSource
      console.log('Connecting to SSE stream...');
      const eventSource = new EventSource(`http://localhost:9000/api/TTS/stream/${streamId}`);
      eventSourceRef.current = eventSource;

      // Handle audio events
      eventSource.addEventListener('audio', (event: MessageEvent) => {
        const audioUrl = event.data.trim();
        console.log('Received audio URL via EventSource:', audioUrl, 'at time:', new Date().toISOString());

        if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('/'))) {
          setAudioQueue(prev => {
            const newQueue = [...prev, audioUrl];
            console.log('Audio queue updated:', newQueue);
            // If this is the first URL, start playback immediately
            if (newQueue.length === 1) {
              console.log('Starting playback of first audio');
              loadAndPlayAudio(audioUrl, 0);
            }
            return newQueue;
          });
        }
      });

      // Handle error events
      eventSource.addEventListener('error', (event: MessageEvent) => {
        const errorMessage = event.data;
        console.error('Backend audio generation error:', errorMessage);
        toast.error('Lỗi tạo âm thanh: ' + errorMessage);
        eventSource.close();
        eventSourceRef.current = null;
        setIsStreamingAudio(false);
        setLoadingAudio(false);
      });

      // Handle general messages (fallback)
      eventSource.onmessage = event => {
        const data = event.data.trim();
        console.log('Received general message:', data, 'at time:', new Date().toISOString());

        if (data === '[DONE]') {
          console.log('SSE streaming completed');
          eventSource.close();
          eventSourceRef.current = null;
          setIsStreamingAudio(false);
          setLoadingAudio(false);
          return;
        }

        // Fallback for audio URLs without specific event type
        if (data && (data.startsWith('http') || data.startsWith('/'))) {
          console.log('Treating as audio URL (fallback):', data);
          setAudioQueue(prev => {
            const newQueue = [...prev, data];
            if (newQueue.length === 1) {
              loadAndPlayAudio(data, 0);
            }
            return newQueue;
          });
        }
      };

      // Handle connection errors
      eventSource.onerror = event => {
        console.error('EventSource error:', event);
        eventSource.close();
        eventSourceRef.current = null;
        setIsStreamingAudio(false);
        setLoadingAudio(false);
        toast.error('Kết nối SSE bị lỗi');
      };
    } catch (error) {
      console.error('Error with SSE streaming:', error);
      toast.error(`Failed to stream audio: ${error.message}`);
      setIsStreamingAudio(false);
      setLoadingAudio(false);
    }
  };

  const loadAndPlayAudio = async (audioUrl: string, index: number) => {
    try {
      console.log('Loading audio URL:', audioUrl, 'at index:', index);

      // Check if we already have this audio blob cached
      if (audioBlobs.has(audioUrl)) {
        const cachedBlobUrl = audioBlobs.get(audioUrl)!;
        console.log('Using cached blob URL:', cachedBlobUrl);
        setAudioUrl(cachedBlobUrl);
        setCurrentAudioIndex(index);
        return;
      }

      // Fetch the audio blob
      console.log('Fetching audio from:', audioUrl);
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('Created blob URL:', blobUrl, 'for audio URL:', audioUrl);

      // Cache the blob URL
      setAudioBlobs(prev => {
        const newMap = new Map(prev).set(audioUrl, blobUrl);
        console.log('Updated audioBlobs map, size:', newMap.size);
        return newMap;
      });

      // Set as current audio
      console.log('Setting audioUrl to:', blobUrl);
      setAudioUrl(blobUrl);
      setCurrentAudioIndex(index);

      // Remove loading state if this is the first audio
      if (index === 0) {
        console.log('Setting loadingAudio to false');
        setLoadingAudio(false);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error(`Failed to load audio segment: ${error.message}`);

      // Try to play next audio if available
      if (index + 1 < audioQueue.length) {
        loadAndPlayAudio(audioQueue[index + 1], index + 1);
      }
    }
  };

  const handleAudioEnded = () => {
    const nextIndex = currentAudioIndex + 1;

    if (nextIndex < audioQueue.length) {
      // Load and play next audio
      loadAndPlayAudio(audioQueue[nextIndex], nextIndex);
    } else if (!isStreamingAudio) {
      // All audio finished and streaming is complete
      console.log('All audio playback completed');
    }
    // If streaming is still ongoing, we'll wait for more URLs to arrive
  };

  // Cleanup blob URLs on component unmount or when audio queue changes
  useEffect(() => {
    return () => {
      audioBlobs.forEach(blobUrl => {
        URL.revokeObjectURL(blobUrl);
      });
    };
  }, [audioBlobs]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Close EventSource if it's open
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Cleanup all blob URLs
      audioBlobs.forEach(blobUrl => {
        URL.revokeObjectURL(blobUrl);
      });
    };
  }, []);

  const handlePreviousAudio = () => {
    const prevIndex = currentAudioIndex - 1;
    if (prevIndex >= 0 && audioQueue.length > 0) {
      loadAndPlayAudio(audioQueue[prevIndex], prevIndex);
    }
  };

  const handleNextAudio = () => {
    const nextIndex = currentAudioIndex + 1;
    if (nextIndex < audioQueue.length) {
      loadAndPlayAudio(audioQueue[nextIndex], nextIndex);
    }
  };

  const handleStopAudio = () => {
    // Close EventSource if it's open
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Clear audio state
    setAudioUrl('');
    setAudioQueue([]);
    setCurrentAudioIndex(0);
    setIsStreamingAudio(false);
    setLoadingAudio(false);

    // Cleanup blob URLs
    audioBlobs.forEach(blobUrl => {
      URL.revokeObjectURL(blobUrl);
    });
    setAudioBlobs(new Map());

    toast.success('Đã dừng phát âm thanh');
  };

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
          {fileType === 'docx' && ( // Only show the button for docx files
            <div className="audio-section">
              {loadingAudio ? (
                <div className="audio-loading">
                  <Spinner />
                  {isStreamingAudio && <p>Đang tải âm thanh...</p>}
                </div>
              ) : audioUrl ? (
                <div className="audio-player">
                  <div className="audio-controls">
                    <audio ref={audioRef} controls src={audioUrl} onEnded={handleAudioEnded} />
                    {audioQueue.length > 1 && (
                      <div className="audio-navigation">
                        <button
                          onClick={handlePreviousAudio}
                          disabled={currentAudioIndex === 0}
                          className="audio-nav-btn"
                          title="Đoạn trước"
                        >
                          ⏮
                        </button>
                        <button
                          onClick={handleNextAudio}
                          disabled={currentAudioIndex >= audioQueue.length - 1}
                          className="audio-nav-btn"
                          title="Đoạn tiếp theo"
                        >
                          ⏭
                        </button>
                      </div>
                    )}
                    <button onClick={handleStopAudio} className="audio-stop-btn" title="Dừng phát âm thanh">
                      ⏹
                    </button>
                  </div>
                  {audioQueue.length > 1 && (
                    <div className="audio-progress">
                      Đoạn {currentAudioIndex + 1} / {audioQueue.length}
                      {isStreamingAudio && ' (Đang tải thêm...)'}
                    </div>
                  )}
                </div>
              ) : (
                <TextToSpeechButton onClick={handleTextToSpeechClick} isActive={ttsButtonActive} />
              )}
            </div>
          )}
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
