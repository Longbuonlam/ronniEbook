import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './book.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import toast, { Toaster } from 'react-hot-toast';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
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
      handleDeleteInProgress(selectedBookId);
      setIsConfirmOpen(false);
    }
  };

  const handleDeleteInProgress = (bookId: string) => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to remove from reading list: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/reading-progress/${bookId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          // Remove the book from the current list
          setInProgressBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
          toast.success('Đã xóa khỏi danh sách đang đọc thành công');

          // Refresh the list to get updated pagination
          fetchInProgressBooks(inProgressPage, searchQuery);
        } else {
          console.error('Failed to remove book from reading list');
          toast.error('Xóa khỏi danh sách đang đọc không thành công');
        }
      })
      .catch(error => {
        console.error('Error removing book from reading list:', error);
        toast.error('Xóa khỏi danh sách đang đọc không thành công');
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
      <h2>Đang đọc</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : inProgressBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {inProgressBooks.map(book => (
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
                  className="delete-reading-btn"
                  onClick={e => handleDeleteClick(book.id, e)}
                  title="Remove from reading list"
                  aria-label={`Xóa ${book.title} khỏi danh sách đang đọc`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button className="pagination-btn prev-btn" onClick={goToPreviousInProgressPage} disabled={inProgressPage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {inProgressPage + 1} / {totalInProgressPages}
            </span>
            <button
              className="pagination-btn next-btn"
              onClick={goToNextInProgressPage}
              disabled={inProgressPage === totalInProgressPages - 1}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}

      <h2>Có thể bạn cũng thích</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : otherBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {otherBooks.map(book => (
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
              </div>
            ))}
          </div>
          <div className="pagination">
            <button className="pagination-btn prev-btn" onClick={gotoPreviousOtherPage} disabled={otherPage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {otherPage + 1} / {totalOtherPages}
            </span>
            <button className="pagination-btn next-btn" onClick={gotoNextOtherPage} disabled={otherPage === totalOtherPages - 1}>
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Bạn có chắc muốn xóa cuốn sách này khỏi danh sách đang đọc không?"
      />

      <Toaster />
    </div>
  );
}

export default MainBook;
