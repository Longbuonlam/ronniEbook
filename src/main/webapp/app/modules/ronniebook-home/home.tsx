import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './home.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [releaseBooks, setReleaseBooks] = useState<Book[]>([]);
  const [unreleaseBooks, setUnReleaseBooks] = useState<Book[]>([]);
  const [releasePage, setReleasePage] = useState(0);
  const [unreleasePage, setUnReleasePage] = useState(0);
  const [totalReleasePages, setTotalReleasePages] = useState(1);
  const [totalUnreleasePages, setTotalUnreleasePages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchReleaseBooks = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/release-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setReleaseBooks(data.content);
        setReleasePage(data.number);
        setTotalReleasePages(data.totalPages);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const fetchUnRealeseBooks = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/unrelease-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setUnReleaseBooks(data.content);
        setUnReleasePage(data.number);
        setTotalUnreleasePages(data.totalPages);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  useEffect(() => {
    fetchReleaseBooks(0, searchQuery);
    fetchUnRealeseBooks(0, searchQuery);
  }, [searchQuery]);

  const goToNextReleasePage = () => {
    if (releasePage < totalReleasePages - 1) {
      fetchReleaseBooks(releasePage + 1);
    }
  };

  const goToPreviousReleasePage = () => {
    if (releasePage > 0) {
      fetchReleaseBooks(releasePage - 1);
    }
  };

  const gotoNextUnreleasePage = () => {
    if (unreleasePage < totalUnreleasePages - 1) {
      fetchUnRealeseBooks(unreleasePage + 1);
    }
  };

  const gotoPreviousUnreleasePage = () => {
    if (unreleasePage > 0) {
      fetchUnRealeseBooks(unreleasePage - 1);
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
      <h2>On Deck</h2>
      <div className="book-row">
        {releaseBooks.map(book => (
          <div key={book.id} className="book-card" onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
            <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p className="book-description">{book.description}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <span
          onClick={goToPreviousReleasePage}
          style={{
            cursor: releasePage === 0 ? 'not-allowed' : 'pointer',
            opacity: releasePage === 0 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronLeft} />
        </span>
        <span>
          Page {releasePage + 1} / {totalReleasePages}
        </span>
        <span
          onClick={goToNextReleasePage}
          style={{
            cursor: releasePage === totalReleasePages - 1 ? 'not-allowed' : 'pointer',
            opacity: releasePage === totalReleasePages - 1 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronRight} />
        </span>
      </div>

      <h2>Release Soon</h2>
      <div className="book-row">
        {unreleaseBooks.map(book => (
          <div key={book.id} className="book-card" onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
            <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p className="book-description">{book.description}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <span
          onClick={gotoPreviousUnreleasePage}
          style={{
            cursor: unreleasePage === 0 ? 'not-allowed' : 'pointer',
            opacity: unreleasePage === 0 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronLeft} />
        </span>
        <span>
          Page {unreleasePage + 1} / {totalUnreleasePages}
        </span>
        <span
          onClick={gotoNextUnreleasePage}
          style={{
            cursor: unreleasePage === totalUnreleasePages - 1 ? 'not-allowed' : 'pointer',
            opacity: unreleasePage === totalUnreleasePages - 1 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronRight} />
        </span>
      </div>
    </div>
  );
}

export default Home;
