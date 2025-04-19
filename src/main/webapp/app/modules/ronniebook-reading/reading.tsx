import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../shared/layout/spinner/spinner';

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

  const streamTextToSpeech = async () => {
    setLoadingAudio(true);
    try {
      const response = await fetch(`http://localhost:9000/api/text-to-speech?content=${encodeURIComponent(rawContent)}&nation=${language}`);
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

  useEffect(() => {
    if (rawContent && language) {
      streamTextToSpeech();
    }
  }, [rawContent, language]);

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
          {loadingAudio ? <Spinner /> : audioUrl && <audio controls src={audioUrl} />}
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
    </div>
  );
}

export default FileContent;
