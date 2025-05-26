import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './book.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function MainBook() {
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [inProgressPage, setInProgressPage] = useState(0);
  const [otherPage, setOtherPage] = useState(0);
  const [totalInProgressPages, setTotalInProgressPages] = useState(1);
  const [totalOtherPages, setTotalOtherPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInProgressBooks = (pageNumber = 0, search = '') => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/reading-progress?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setInProgressBooks(data.content);
        setInProgressPage(data.number);
        setTotalInProgressPages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  const fetchOtherBooks = (pageNumber = 0, search = '') => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/other-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setOtherBooks(data.content);
        setOtherPage(data.number);
        setTotalOtherPages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInProgressBooks(0, searchQuery);
    fetchOtherBooks(0, searchQuery);
  }, [searchQuery]);

  const goToNextInProgressPage = () => {
    if (inProgressPage < totalInProgressPages - 1) {
      fetchInProgressBooks(inProgressPage + 1);
    }
  };

  const goToPreviousInProgressPage = () => {
    if (inProgressPage > 0) {
      fetchInProgressBooks(inProgressPage - 1);
    }
  };

  const gotoNextOtherPage = () => {
    if (otherPage < totalOtherPages - 1) {
      fetchOtherBooks(otherPage + 1);
    }
  };

  const gotoPreviousOtherPage = () => {
    if (otherPage > 0) {
      fetchOtherBooks(otherPage - 1);
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

  const handleBookClick = bookId => {
    navigate(`/app/book/${bookId}`);
  };

  return (
    <div className="book-container">
      <div className="search-bar-container">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        <input
          type="text"
          placeholder="Search Book..."
          className="search-input"
          value={searchText}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </div>
      <h2>In Progress</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : inProgressBooks.length === 0 ? (
        <p>No data is available</p>
      ) : (
        <>
          <div className="book-row">
            {inProgressBooks.map(book => (
              <div key={book.id} className="book-card" onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
                <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <span
              className="left-chevron"
              onClick={goToPreviousInProgressPage}
              style={{
                cursor: inProgressPage === 0 ? 'not-allowed' : 'pointer',
                opacity: inProgressPage === 0 ? 0.5 : 1,
                marginRight: '10px',
              }}
            >
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </span>
            <span>
              Page {inProgressPage + 1} / {totalInProgressPages}
            </span>
            <span
              className="right-chevron"
              onClick={goToNextInProgressPage}
              style={{
                cursor: inProgressPage === totalInProgressPages - 1 ? 'not-allowed' : 'pointer',
                opacity: inProgressPage === totalInProgressPages - 1 ? 0.5 : 1,
                marginLeft: '10px',
              }}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </span>
          </div>
        </>
      )}

      <h2>Others</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : otherBooks.length === 0 ? (
        <p>No data is available</p>
      ) : (
        <>
          <div className="book-row">
            {otherBooks.map(book => (
              <div key={book.id} className="book-card" onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
                <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <span
              className="left-chevron"
              onClick={gotoPreviousOtherPage}
              style={{
                cursor: otherPage === 0 ? 'not-allowed' : 'pointer',
                opacity: otherPage === 0 ? 0.5 : 1,
                marginRight: '10px',
              }}
            >
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </span>
            <span>
              Page {otherPage + 1} / {totalOtherPages}
            </span>
            <span
              className="right-chevron"
              onClick={gotoNextOtherPage}
              style={{
                cursor: otherPage === totalOtherPages - 1 ? 'not-allowed' : 'pointer',
                opacity: otherPage === totalOtherPages - 1 ? 0.5 : 1,
                marginLeft: '10px',
              }}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default MainBook;
