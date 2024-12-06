import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import { useNavigate, useParams } from 'react-router-dom';
import './book-detail.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPen, faStar } from '@fortawesome/free-solid-svg-icons';
import { Comment } from '../../shared/model/comment.model';
import toast, { Toaster } from 'react-hot-toast';

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Comment[] | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('related');
  const navigate = useNavigate();

  const fetchBook = () => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setBook(data);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const fetchReviews = () => {
    fetch(`http://localhost:9000/api/${bookId}/comments?page=0&size=20`)
      .then(response => response.json())
      .then(data => {
        setReviews(data.content);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const addToFavorites = () => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to add book to favourite: XSRF token is missing');
      return;
    }

    fetch('http://localhost:9000/api/favourite-books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify({ bookId }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Book added to favorites');
          toast.success('Add to favorite successfully');
        } else {
          console.error('Failed to add book to favorites');
        }
      })
      .catch(error => {
        console.error('Error adding book to favourite:', error);
        toast.error('Failed to add book to favorites');
      });
  };

  const toggleReviews = () => {
    setShowReviews(!showReviews);
    if (!showReviews) fetchReviews();
  };

  const handleTabClick = tab => {
    setActiveTab(tab);
    if (tab === 'related') {
      setShowReviews(false);
    } else if (tab === 'reviews') {
      toggleReviews();
    }
  };

  //function to calculate time from the review created date
  const timeAgo = date => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return rtf.format(-diffInMinutes, 'minute');
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return rtf.format(-diffInHours, 'hour');
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return rtf.format(-diffInDays, 'day');
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return rtf.format(-diffInMonths, 'month');
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return rtf.format(-diffInYears, 'year');
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  return (
    <div>
      <div className="book-detail-container">
        {book ? (
          <>
            <div className="book-cover">
              <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
              <div className="progress">
                <span>%</span>
                <p></p>
              </div>
            </div>
            <div className="book-info">
              <h1>{book.title}</h1>

              <div className="book-meta">
                <span className="publisher"></span>
                <span className="pages"> Pages</span>
                <span className="estimated-time">~1 Hour</span>
              </div>

              <div className="action-btn">
                <button className="continue-btn">
                  <FontAwesomeIcon icon={faBookOpen} /> Continue
                </button>
                <FontAwesomeIcon icon={faStar} className="icon" onClick={addToFavorites} />
                {/* <FontAwesomeIcon icon={faDownload} className="icon" /> */}
              </div>

              <p className="book-description">{book.description}</p>

              <div className="book-details">
                <div>
                  <strong>Author</strong>
                  <p>{book.author}</p>
                </div>

                <div>
                  <strong>Number of Chapter</strong>
                  <p>{book.chapterCount}</p>
                </div>

                <div>
                  <strong>Status</strong>
                  <p>{book.bookStatus || '—'}</p>
                </div>

                <div>
                  <strong>Category</strong>
                  <p> {book.category}</p>
                </div>

                <div>
                  <strong>Language</strong>
                  <p> {book.language}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="tab-navigation-div">
        <nav className="tab-navigation">
          <a
            className={`tab-link ${activeTab === 'related' ? 'active' : ''}`}
            onClick={e => {
              e.preventDefault();
              handleTabClick('related');
            }}
          >
            Related
          </a>
          <a
            className={`tab-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={e => {
              e.preventDefault();
              handleTabClick('reviews');
            }}
          >
            Reviews
          </a>
        </nav>
      </div>
      {showReviews && reviews && reviews.length > 0 && (
        <div className="reviews-section">
          <h2 className="reviews">
            Reviews <FontAwesomeIcon icon={faPen} />
          </h2>
          <div className="review-box">
            {reviews.map((review, index) => (
              <div key={index} className="single-review">
                <div className="review-user">
                  <img src="/path-to-avatar.jpg" alt={review.userId} className="review-avatar" />
                  <p className="review-username">{review.userId}</p>
                  <p className="review-date">{timeAgo(review.createdDate)}</p>
                </div>
                <div className="review-rating">
                  {[...Array(review.rating)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="star-icon" />
                  ))}
                </div>
                <p className="review-description">{review.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default BookDetail;
