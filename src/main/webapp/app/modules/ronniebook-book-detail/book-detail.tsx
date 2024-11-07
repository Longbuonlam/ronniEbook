import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import { useNavigate, useParams } from 'react-router-dom';
import './book-detail.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faStar } from '@fortawesome/free-solid-svg-icons';

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const navigate = useNavigate();

  const fetchBook = () => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setBook(data);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  return (
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

            <div className="action-buttons">
              <button className="continue-btn">
                <FontAwesomeIcon icon={faBookOpen} /> Continue
              </button>
              <FontAwesomeIcon icon={faStar} className="icon" />
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

          <div className="tab-navigation">
            <button onClick={() => navigate(`/app/book/${bookId}/related`)}>Related </button>
            <button onClick={() => navigate(`/app/book/${bookId}/reviews`)}>Reviews </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default BookDetail;
