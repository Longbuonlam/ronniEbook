import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import { useNavigate, useParams } from 'react-router-dom';
import './book-detail.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPen, faStar, faClose, faEllipsisH, faHeart } from '@fortawesome/free-solid-svg-icons';
import { Comment } from '../../shared/model/comment.model';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import ChapterSelectionModal from '../../shared/layout/chapter-selection/chapter-selection-modal';
import UploadOrRecordAudioModal from '../../shared/layout/upload-record-speech/upload-record-speech';
import { UserRecord } from '../../shared/model/record.model';
import VoiceSelectionModal from '../../shared/layout/user-record-selection/user-record-select';

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Comment[] | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showRelatedBook, setShowRelatedBook] = useState(true);
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
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [userRecord, setUserRecord] = useState<UserRecord[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedUserRecord, setSelectedUserRecord] = useState<UserRecord | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [chaptersRead, setChaptersRead] = useState(new Set());
  const [isFavourite, setIsFavourite] = useState<boolean>(false);

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
        toggleCommentModal(true);
      })
      .catch(error => console.error('Error fetching selected book:', error));
    setOpenMenuIndex(null);
  };

  const fetchCurrentUserRating = () => {
    fetch(`http://localhost:9000/api/comments/getRating/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setRating(data.bookRating);
      })
      .catch(error => console.error('Error fetching rating:', error));
  };

  const fetchRelatedBooks = (pageNumber = 0) => {
    setIsLoading(true);
    fetch(`http://localhost:9000/api/recommend/similar-books/${bookId}?page=${pageNumber}&size=6`)
      .then(response => response.json())
      .then(data => {
        setRelatedBooks(data.content);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching related books:', error));
    setIsLoading(false);
  };

  const fetchReadingProgress = () => {
    fetch(`http://localhost:9000/api/reading-progress/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setReadingProgress(data);
      })
      .catch(error => console.error('Error fetching reading progress:', error));
  };

  const fetchChaptersRead = () => {
    fetch(`http://localhost:9000/api/reading-progress/get-finished-chapters/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setChaptersRead(new Set(data));
      })
      .catch(error => console.error('Error fetching chapters read:', error));
  };

  const fetchFavouriteStatus = () => {
    fetch(`http://localhost:9000/api/favourite-books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setIsFavourite(data);
      })
      .catch(error => console.error('Error fetching favourite status:', error));
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const toggleFavourite = () => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to update favourite: XSRF token is missing');
      return;
    }

    if (isFavourite) {
      // Remove from favourites
      fetch(`http://localhost:9000/api/favourite-books/${bookId}`, {
        method: 'DELETE',
        headers: {
          Accept: '*/*',
          'X-XSRF-TOKEN': token,
        },
      })
        .then(response => {
          if (response.ok) {
            setIsFavourite(false);
            toast.success('Removed from favourites successfully');
          } else {
            console.error('Failed to remove book from favourites');
            toast.error('Failed to remove from favourites');
          }
        })
        .catch(error => {
          console.error('Error removing book from favourites:', error);
          toast.error('Failed to remove from favourites');
        });
    } else {
      // Add to favourites
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
            setIsFavourite(true);
            toast.success('Added to favourites successfully');
          } else {
            console.error('Failed to add book to favourites');
            toast.error('Failed to add to favourites');
          }
        })
        .catch(error => {
          console.error('Error adding book to favourites:', error);
          toast.error('Failed to add to favourites');
        });
    }
  };

  const handleTabClick = tab => {
    setActiveTab(tab);
    if (tab === 'related') {
      setShowReviews(false);
      setShowRelatedBook(true);
      fetchRelatedBooks();
    } else if (tab === 'reviews') {
      setShowRelatedBook(false);
      setShowReviews(true);
      fetchReviews();
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
    if (chapterStorageId && bookId) {
      navigate(`/app/reading/${chapterStorageId}`, {
        state: { bookId },
      });
    }
    setIsChapterModalOpen(false);
  };

  const handleSelectVoice = (voice: UserRecord) => {
    setSelectedUserRecord(voice);
    setIsVoiceModalOpen(false);
    toast.success(`Selected voice: ${voice.originalName}`);
  };

  const handleAudioUpload = async (file: File | Blob) => {
    if (!file) {
      toast.error('No file selected for upload.');
      return;
    }

    const token = getXsrfToken();
    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to upload audio: XSRF token is missing');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:9000/api/user-record/upload', {
        method: 'POST',
        headers: {
          'X-XSRF-TOKEN': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to upload audio:', errorText);
        throw new Error(`Failed to upload audio: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Uploaded audio successfully:', result);
      toast.success('Audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio. Please try again.');
    }
  };

  useEffect(() => {
    fetchBook();
    fetchChapterStorageIds();
    fetchRelatedBooks();
    fetchReadingProgress();
    fetchChaptersRead();
    fetchFavouriteStatus();
  }, [bookId]);

  return (
    <div>
      <div className="book-detail-container">
        {book ? (
          <>
            <div className="book-cover">
              <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
              <div className="progress">
                <span>{readingProgress} %</span>
                <p></p>
              </div>
            </div>
            <div className="book-info">
              <h1>{book.bookName}</h1>

              <div className="book-meta">
                <span className="publisher"></span>
                <span className="estimated-time">~1 Hour</span>
              </div>

              <div className="action-btn">
                <button className="continue-btn" onClick={() => setIsChapterModalOpen(true)}>
                  <FontAwesomeIcon icon={faBookOpen} /> Select Chapter
                </button>
                <button className="continue-btn">
                  <FontAwesomeIcon icon={faBookOpen} /> Continue
                </button>
                <button className="continue-btn" onClick={() => setIsAudioModalOpen(true)}>
                  <FontAwesomeIcon icon={faBookOpen} /> Upload/Record Audio
                </button>
                <FontAwesomeIcon icon={faHeart} className={`icon ${isFavourite ? 'favourite-active' : ''}`} onClick={toggleFavourite} />
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
                  <p>{Object.keys(chapterStorageIds).length}</p>
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

      {showRelatedBook && (
        <div className="related-book-container">
          {isLoading ? (
            <p>Loading...</p>
          ) : relatedBooks.length === 0 ? (
            <p>No data is available</p>
          ) : (
            <>
              <div className="related-book-row">
                {relatedBooks.map(book => (
                  <div
                    key={book.id}
                    className="related-book-card"
                    onClick={() => navigate(`/app/book/${book.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <p className="related-book-description">{book.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

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
                        <button
                          onClick={() => {
                            fetchSelectedReview(review.id);
                            fetchCurrentUserRating();
                          }}
                        >
                          Edit
                        </button>
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
        chapterCount={Object.keys(chapterStorageIds).length}
        onSelect={handleSelectChapter}
        chapterStorageIds={chapterStorageIds}
        chaptersRead={chaptersRead}
      />

      <UploadOrRecordAudioModal isOpen={isAudioModalOpen} onClose={() => setIsAudioModalOpen(false)} onUpload={handleAudioUpload} />

      <VoiceSelectionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSelect={handleSelectVoice}
        voices={userRecord}
      />

      <Toaster />
    </div>
  );
}

export default BookDetail;
