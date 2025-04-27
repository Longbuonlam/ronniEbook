import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../shared/layout/spinner/spinner';
import VoiceSelectionModal from '../../shared/layout/user-record-selection/user-record-select';
import TextToSpeechButton from '../../shared/layout/text-to-speech-button/text-to-speech-button';
import { UserRecord } from '../../shared/model/record.model';

import './reading.scss';

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
      const response = await fetch(
        `http://localhost:9000/api/TTS/process-audio?content=${encodeURIComponent(rawContent)}&language=${language}&path=${voice.path}&recordUrl=${voice.recordUrl}&originalName=${voice.originalName}&size=${voice.size}`,
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
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

  useEffect(() => {
    fetchFileType();
    fetchChapterInfo();
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
        <button className="setting-btn">☰</button>
        <h1>{bookName}</h1>
        <button className="close-btn">✖</button>
        <button>&gt;</button>
      </div>
      <div className="file-content-body">
        <div className="chapter-info">
          <h2>
            Chapter <span>{chapterNumber}</span> : {chapterName}
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
          <div dangerouslySetInnerHTML={{ __html: content }} />
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
