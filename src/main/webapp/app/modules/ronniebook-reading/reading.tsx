import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './reading.scss';

function FileContent() {
  const { fileId } = useParams();
  const [content, setContent] = useState('');
  const [chapter, setChapter] = useState('');
  const [book, setBook] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:9000/api/files/${fileId}`)
      .then(response => response.text())
      .then(data => {
        setContent(data);
      })
      .catch(error => console.error('Error fetching file:', error));
  }, [fileId]);

  return (
    <div className="file-content">
      <div className="file-content-header">
        <button onClick={() => navigate(-1)}>&lt;</button>
        <button className="setting-btn">☰</button>
        <h1>The Lost Continent</h1>
        <button className="close-btn">✖</button>
        <button>&gt;</button>
      </div>
      <div className="file-content-body">
        <h2>
          Chapter <span>7</span>
        </h2>
        <h3>The Biters of the City Walls (Further Account)</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

export default FileContent;
