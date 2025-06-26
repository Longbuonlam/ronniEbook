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
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0);
  const [releasePage, setReleasePage] = useState(0);
  const [unreleasePage, setUnReleasePage] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const [totalReleasePages, setTotalReleasePages] = useState(1);
  const [totalUnreleasePages, setTotalUnreleasePages] = useState(1);
  const [totalRecommendedPages, setTotalRecommendedPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Vietnamese proverbs array
  const vietnameseProverbs = [
    {
      text: 'Học, học nữa, học mãi',
      author: 'Hồ Chí Minh',
      meaning: 'Khuyến khích việc học tập không ngừng nghỉ',
    },
    {
      text: 'Đi một ngày đàng, học một sàng khôn',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Mỗi hành trình đều mang lại kiến thức mới',
    },
    {
      text: 'Có chí thì nên',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Với ý chí quyết tâm, mọi việc đều có thể thành công',
    },
    {
      text: 'Uống nước nhớ nguồn',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Luôn ghi nhớ ơn nghĩa của những người đã giúp đỡ',
    },
    {
      text: 'Cần cù bù thông minh',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Sự chăm chỉ có thể bù đắp cho thiếu hụt về tài năng',
    },
    {
      text: 'Thương người như thể thương thân',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Yêu thương và quan tâm đến người khác như chính bản thân',
    },
    {
      text: 'Giọt nước làm tròn tảng đá',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Sự kiên trì có thể vượt qua mọi khó khăn',
    },
    {
      text: 'Gần mực thì đen, gần đèn thì sáng',
      author: 'Tục ngữ Việt Nam',
      meaning: 'Môi trường xung quanh ảnh hưởng đến con người',
    },
  ];

  const fetchReleaseBooks = (pageNumber = 0, search = '') => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/release-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setReleaseBooks(data.content);
        setReleasePage(data.number);
        setTotalReleasePages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  const fetchUnRealeseBooks = (pageNumber = 0, search = '') => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/unrelease-books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setUnReleaseBooks(data.content);
        setUnReleasePage(data.number);
        setTotalUnreleasePages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  const fetchRecommendedBooks = (pageNumber = 0) => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/recommend-books?page=${pageNumber}&size=6`)
      .then(response => response.json())
      .then(data => {
        setRecommendedBooks(data.content);
        setRecommendedPage(data.number);
        setTotalRecommendedPages(data.totalPages);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching books:', error));
    setIsLoading(false);
  };

  const fetchFeaturedBooks = () => {
    fetch(`http://localhost:9000/api/recommend-books?page=0&size=8`)
      .then(response => response.json())
      .then(data => {
        setFeaturedBooks(data.content);
      })
      .catch(error => console.error('Error fetching featured books:', error));
  };

  useEffect(() => {
    fetchReleaseBooks(0, searchQuery);
    fetchUnRealeseBooks(0, searchQuery);
    fetchRecommendedBooks(0);
    fetchFeaturedBooks();
  }, [searchQuery]);

  // Proverb rotation effect
  useEffect(() => {
    const proverbInterval = setInterval(() => {
      setCurrentProverbIndex(prevIndex => (prevIndex + 1) % vietnameseProverbs.length);
    }, 7000); // Change every 7 seconds

    return () => clearInterval(proverbInterval);
  }, [vietnameseProverbs.length]);

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

  const gotoNextRecommendedPage = () => {
    if (recommendedPage < totalRecommendedPages - 1) {
      fetchRecommendedBooks(recommendedPage + 1);
    }
  };

  const gotoPreviousRecommendedPage = () => {
    if (recommendedPage > 0) {
      fetchRecommendedBooks(recommendedPage - 1);
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
          placeholder="Tìm kiếm sách..."
          className="search-input"
          value={searchText}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </div>

      {/* Hero Section with Vietnamese Proverbs */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Khám phá thế giới sách</h1>
            <p>Tìm kiếm và đọc những cuốn sách tuyệt vời nhất</p>
          </div>
          <div className="proverb-display">
            <h3>Danh ngôn Việt Nam</h3>
            <div className="proverb-container">
              <div className="proverb-card">
                <div className="proverb-text">"{vietnameseProverbs[currentProverbIndex].text}"</div>
                <div className="proverb-author">- {vietnameseProverbs[currentProverbIndex].author} -</div>
                <div className="proverb-meaning">{vietnameseProverbs[currentProverbIndex].meaning}</div>
              </div>
              <div className="proverb-indicators">
                {vietnameseProverbs.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentProverbIndex ? 'active' : ''}`}
                    onClick={() => setCurrentProverbIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2>Đã phát hành</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : releaseBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {releaseBooks.map(book => (
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
            <button className="pagination-btn prev-btn" onClick={goToPreviousReleasePage} disabled={releasePage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {releasePage + 1} / {totalReleasePages}
            </span>
            <button className="pagination-btn next-btn" onClick={goToNextReleasePage} disabled={releasePage === totalReleasePages - 1}>
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}

      <h2>Đang phát hành</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : unreleaseBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {unreleaseBooks.map(book => (
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
            <button className="pagination-btn prev-btn" onClick={gotoPreviousUnreleasePage} disabled={unreleasePage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {unreleasePage + 1} / {totalUnreleasePages}
            </span>
            <button
              className="pagination-btn next-btn"
              onClick={gotoNextUnreleasePage}
              disabled={unreleasePage === totalUnreleasePages - 1}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}

      <h2>Gợi ý cho bạn</h2>

      {isLoading ? (
        <div className="loading-state">
          <p>Đang tải...</p>
        </div>
      ) : recommendedBooks.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          <div className="book-row">
            {recommendedBooks.map(book => (
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
            <button className="pagination-btn prev-btn" onClick={gotoPreviousRecommendedPage} disabled={recommendedPage === 0}>
              <FontAwesomeIcon icon={faCircleChevronLeft} />
            </button>
            <span className="page-info">
              Trang {recommendedPage + 1} / {totalRecommendedPages}
            </span>
            <button
              className="pagination-btn next-btn"
              onClick={gotoNextRecommendedPage}
              disabled={recommendedPage === totalRecommendedPages - 1}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
