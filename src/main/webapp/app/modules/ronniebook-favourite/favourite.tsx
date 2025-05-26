import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './favourite.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function FavouriteBook() {
  const [favouriteBooks, setFavouriteBooks] = useState<Book[]>([]);
  const [favouritePage, setFavouritePage] = useState(0);
  const [totalFavouritePages, setTotalFavouritePages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFavouriteBooks = (pageNumber = 0, search = '') => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/favourite-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setFavouriteBooks(data.content);
        setFavouritePage(data.number);
        setTotalFavouritePages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFavouriteBooks(0, searchQuery);
  }, [searchQuery]);

  const goToNextFavouritePage = () => {
    if (favouritePage < totalFavouritePages - 1) {
      fetchFavouriteBooks(favouritePage + 1);
    }
  };

  const goToPreviousFavouritePage = () => {
    if (favouritePage > 0) {
      fetchFavouriteBooks(favouritePage - 1);
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
      <h2>Favourite</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : favouriteBooks.length === 0 ? (
        <p>No data is available</p>
      ) : (
        <>
          <div className="book-row">
            {favouriteBooks.map(book => (
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
              onClick={goToPreviousFavouritePage}
              style={{
                cursor: favouritePage === 0 ? 'not-allowed' : 'pointer',
                opacity: favouritePage === 0 ? 0.5 : 1,
                marginRight: '10px',
              }}
            >
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </span>
            <span>
              Page {favouritePage + 1} / {totalFavouritePages}
            </span>
            <span
              className="right-chevron"
              onClick={goToNextFavouritePage}
              style={{
                cursor: favouritePage === totalFavouritePages - 1 ? 'not-allowed' : 'pointer',
                opacity: favouritePage === totalFavouritePages - 1 ? 0.5 : 1,
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

export default FavouriteBook;
