import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './chapter-management.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Chapter } from '../../shared/model/chapter.model';

function ChapterManagerment() {
  const { bookId } = useParams();
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Chapters, setChapters] = useState<Chapter[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [number, setNumber] = useState('');
  const [language, setLanguage] = useState('');
  const [chapterStatus, setChapterStatus] = useState('');

  const fetchChapters = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/chapters?page=${pageNumber}&size=6&searchText=${search}&bookId=${bookId}`)
      .then(response => response.json())
      .then(data => {
        setChapters(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching chapters:', error));
  };

  useEffect(() => {
    fetchChapters(0, searchQuery);
  }, [searchQuery]);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchChapters(pageNumber);
    }
  };

  const handleSearchChange = event => {
    setSearchText(event.target.value);
  };

  const handleSearchKeyPress = event => {
    if (event.key === 'Enter') {
      setSearchQuery(searchText);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSaveChapter = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      return;
    }

    const chapterData = {
      number,
      chapterName,
      language,
      chapterStatus,
      deleted: false,
    };

    fetch(`http://localhost:9000/api/chapters?bookId=${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(chapterData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Chapter saved:', data);
        toggleModal();
        fetchChapters(Page, searchText);
      })
      .catch(error => console.error('Error saving chapter:', error));
  };

  return (
    <div className="container">
      <div className="header-div">
        <div className="action-buttons">
          <button className="btn" onClick={toggleModal}>
            + Add Chapter
          </button>
        </div>

        <div className="search-bar-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input
            type="text"
            placeholder="Search Chapter..."
            className="search-input"
            value={searchText}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
      </div>

      <h2>Chapters</h2>
      <table className="book-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Language</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Chapters.map((chapter, index) => (
            <tr key={index}>
              <td>{chapter.number}</td>
              <td>{chapter.chapterName}</td>
              <td>{chapter.language}</td>
              <td>
                <div className={`badge status ${chapter.chapterStatus !== 'DONE' ? 'in-progress' : ''}`}>
                  <span>{chapter.chapterStatus === 'DONE' ? 'Done' : 'In Progress'}</span>
                </div>
              </td>
              <td>
                <button className="action-btn">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>
          Showing page {Page + 1} of {totalPages}
        </span>
        <div>
          <button className="page-btn" onClick={() => handlePageChange(Page - 1)} disabled={Page === 0}>
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} className={`page-btn ${Page === index ? 'active' : ''}`} onClick={() => handlePageChange(index)}>
              {index + 1}
            </button>
          ))}
          <button className="page-btn" onClick={() => handlePageChange(Page + 1)} disabled={Page === totalPages - 1}>
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Chapter</h2>
            <form onSubmit={handleSaveChapter}>
              <label>Chapter Name:</label>
              <input
                id="chapterName"
                type="text"
                placeholder="Enter chapter name"
                value={chapterName}
                onChange={e => setChapterName(e.target.value)}
                required
              />

              <label>Chapter Number:</label>
              <input
                id="number"
                type="text"
                placeholder="Enter chapter number"
                value={number}
                onChange={e => setNumber(e.target.value)}
                required
              />

              <label htmlFor="language">Language:</label>
              <select id="language" value={language} onChange={e => setLanguage(e.target.value)} required>
                <option value="" disabled selected>
                  Select language
                </option>
                <option value="ENGLISH">English</option>
                <option value="VIETNAMESE">Vietnamese</option>
                <option value="JAPANESE">Japanese</option>
              </select>

              <label htmlFor="chapterStatus">Chapter Status:</label>
              <select id="chapterStatus" value={chapterStatus} onChange={e => setChapterStatus(e.target.value)} required>
                <option value="" disabled selected>
                  Select status
                </option>
                <option value="DONE">Done</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={toggleModal}>
                  <FontAwesomeIcon icon={faClose} />
                </button>
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChapterManagerment;
