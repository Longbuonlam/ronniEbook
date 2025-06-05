import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './favourite.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import toast, { Toaster } from 'react-hot-toast';

function FavouriteBook() {
  const [favouriteBooks, setFavouriteBooks] = useState<Book[]>([]);
  const [favouritePage, setFavouritePage] = useState(0);
  const [totalFavouritePages, setTotalFavouritePages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
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

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleDeleteClick = (bookId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the book click event
    setSelectedBookId(bookId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBookId) {
      handleDeleteFavourite(selectedBookId);
      setIsConfirmOpen(false);
    }
  };

  const handleDeleteFavourite = (bookId: string) => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to remove from favourites: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/favourite-books/${bookId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          // Remove the book from the current list
          setFavouriteBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
          toast.success('Removed from favourites successfully');

          // Refresh the list to get updated pagination
          fetchFavouriteBooks(favouritePage, searchQuery);
        } else {
          console.error('Failed to remove book from favourites');
          toast.error('Failed to remove from favourites');
        }
      })
      .catch(error => {
        console.error('Error removing book from favourites:', error);
        toast.error('Failed to remove from favourites');
      });
  };

  return (
    <div className="book-container">
      <div className="search-bar-container">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          className="search-input"
          value={searchText}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </div>
      <h2>Sách yêu thích</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : favouriteBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {favouriteBooks.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => handleBookClick(book.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBookClick(book.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Đọc sách ${book.title} của ${book.author}`}
              >
                <div className="book-image-container">
                  <img src={book.imageUrl || 'default-image.jpg'} alt={`Bìa sách ${book.title}`} className="book-image" />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                </div>
                <button
                  className="delete-favourite-btn"
                  onClick={e => handleDeleteClick(book.id, e)}
                  title="Remove from favourites"
                  aria-label={`Xóa ${book.title} khỏi danh sách yêu thích`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button className="pagination-btn prev-btn" onClick={goToPreviousFavouritePage} disabled={favouritePage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {favouritePage + 1} / {totalFavouritePages}
            </span>
            <button
              className="pagination-btn next-btn"
              onClick={goToNextFavouritePage}
              disabled={favouritePage === totalFavouritePages - 1}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Bạn có chắc muốn xóa cuốn sách này khỏi danh sách yêu thích không?"
      />

      <Toaster />
    </div>
  );
}

export default FavouriteBook;
