import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import { useNavigate, useParams } from 'react-router-dom';
import './book-detail.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPen, faStar, faClose, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { Comment } from '../../shared/model/comment.model';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import ChapterSelectionModal from '../../shared/layout/chapter-selection/chapter-selection-modal';

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Comment[] | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('related');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCommentEditing, setCommentIsEditing] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [rating, setRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterStorageIds, setChapterStorageIds] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();

  const fetchBook = () => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setBook(data);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const fetchChapterStorageIds = () => {
    fetch(`http://localhost:9000/api/chapters/get-storageId?bookId=${bookId}`)
      .then(response => response.json())
      .then(data => {
        setChapterStorageIds(data);
      })
      .catch(error => console.error('Error fetching chapter storage IDs:', error));
  };

  const fetchReviews = () => {
    fetch(`http://localhost:9000/api/${bookId}/comments?page=0&size=20`)
      .then(response => response.json())
      .then(data => {
        setReviews(data.content);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const fetchSelectedReview = commentId => {
    fetch(`http://localhost:9000/api/comments/${commentId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedCommentId(data.id);
        setDescription(data.description);
        setRating(data.rating);
        toggleCommentModal(true);
      })
      .catch(error => console.error('Error fetching selected book:', error));
    setOpenMenuIndex(null);
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

  const formatDate = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const toggleOptionsMenu = index => {
    setOpenMenuIndex(prev => (prev === index ? null : index));
  };

  const handleStarClick = index => {
    setRating(index + 1);
  };

  const toggleCommentModal = (editing = false) => {
    setIsModalOpen(!isModalOpen);
    setCommentIsEditing(editing);
    if (!isModalOpen) {
      document.body.classList.add('comment-modal-open');
    } else {
      setDescription('');
      setRating(0);
      document.body.classList.remove('comment-modal-open');
    }
  };

  const handleDeleteClick = commentId => {
    setSelectedCommentId(commentId);
    setIsConfirmOpen(true);
    setOpenMenuIndex(null);
  };

  const handleConfirmDelete = () => {
    if (selectedCommentId) {
      handleDeleteComment(selectedCommentId);
      setIsConfirmOpen(false);
    }
  };

  // Save comment
  const handleSaveComment = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save comment: XSRF token is missing');
      return;
    }

    const commentData = {
      description,
      rating,
    };

    fetch(`http://localhost:9000/api/${bookId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(commentData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Comment saved:', data);
        toggleCommentModal();
        fetchReviews();
        toast.success('Comment saved successfully');
      })
      .catch(error => {
        console.error('Error saving comment:', error);
        toast.error('Failed to save comment');
      });
  };

  // Edit comment
  const handleEditComment = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to edit comment: XSRF token is missing');
      return;
    }

    const commentData = {
      id: selectedCommentId,
      description,
      rating,
    };

    fetch(`http://localhost:9000/api/comments/${selectedCommentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(commentData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Comment edited:', data);
        toggleCommentModal();
        fetchReviews();
        toast.success('Comment edited successfully');
      })
      .catch(error => {
        console.error('Error editing comment:', error);
        toast.error('Failed to edit comment');
      });
  };

  // Delete comment
  const handleDeleteComment = commentId => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to delete comment: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          if (reviews) {
            setReviews(reviews.filter(review => review.id !== commentId));
          }
          toast.success('Comment deleted successfully');
        } else {
          console.error('Error deleting comment:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      });
  };

  const handleSelectChapter = (chapter: number) => {
    const chapterStorageId = chapterStorageIds[chapter];
    if (chapterStorageId) {
      navigate(`/app/reading/${chapterStorageId}`);
    }
    setIsChapterModalOpen(false);
  };

  useEffect(() => {
    fetchBook();
    fetchChapterStorageIds();
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
              <h1>{book.bookName}</h1>

              <div className="book-meta">
                <span className="publisher"></span>
                <span className="pages"> Pages</span>
                <span className="estimated-time">~1 Hour</span>
              </div>

              <div className="action-btn">
                <button className="continue-btn" onClick={() => setIsChapterModalOpen(true)}>
                  <FontAwesomeIcon icon={faBookOpen} /> Select Chapter
                </button>
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
      {showReviews && reviews && (
        <div className="reviews-section">
          <h2 className="reviews">
            Reviews <FontAwesomeIcon icon={faPen} onClick={() => toggleCommentModal()} />
          </h2>
          <div className="review-box">
            {reviews.map((review, index) => (
              <div key={index} className="single-review">
                <div className="review-user">
                  <img src="/path-to-avatar.jpg" alt={review.userId} className="review-avatar" />
                  <p className="review-username">{review.userId}</p>
                  <p className="review-date" title={formatDate(new Date(review.createdDate))}>
                    {timeAgo(review.createdDate)}
                  </p>
                  <div className="options-menu">
                    <FontAwesomeIcon icon={faEllipsisH} className="options-icon" onClick={() => toggleOptionsMenu(index)} />
                    {openMenuIndex === index && (
                      <div className="options-dropdown">
                        <button onClick={() => fetchSelectedReview(review.id)}>Edit</button>
                        <button onClick={() => handleDeleteClick(review.id)}>Delete</button>
                      </div>
                    )}
                  </div>
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

      {isModalOpen && (
        <div className="comment-modal">
          <div className="comment-modal-content">
            <h2>{isCommentEditing ? 'Edit Comment' : 'New Comment'}</h2>
            <form onSubmit={isCommentEditing ? handleEditComment : handleSaveComment}>
              <label>Rating:</label>
              <div className="stars-container">
                {[...Array(5)].map((_, index) => (
                  <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className={`star-icon-form ${index < rating ? 'selected' : ''}`}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
              </div>

              <label>Description:</label>
              <textarea
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => toggleCommentModal(true)}>
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

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this comment?"
      />

      <ChapterSelectionModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        chapterCount={book?.chapterCount || 0}
        onSelect={handleSelectChapter}
      />

      <Toaster />
    </div>
  );
}

export default BookDetail;
