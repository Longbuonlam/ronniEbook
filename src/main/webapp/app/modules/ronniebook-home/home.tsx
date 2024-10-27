import React, { useEffect, useState } from 'react';
import { Book } from '../../shared/model/book.model';
import './home.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = (pageNumber = 0) => {
    fetch(`http://localhost:9000/api/books?page=${pageNumber}`)
      .then(response => response.json())
      .then(data => {
        setBooks(data.content);
        setPage(data.number);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const goToNextPage = () => {
    if (page < totalPages - 1) {
      fetchBooks(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 0) {
      fetchBooks(page - 1);
    }
  };

  return (
    <div className="book-container">
      <h2>On Deck</h2>
      <div className="book-row">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <img src={book.imageUrl || 'default-image.jpg'} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p className="book-description">{book.description}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <span
          onClick={goToPreviousPage}
          style={{
            cursor: page === 0 ? 'not-allowed' : 'pointer',
            opacity: page === 0 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronLeft} />
        </span>
        <span>
          Page {page + 1} / {totalPages}
        </span>
        <span
          onClick={goToNextPage}
          style={{
            cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
            opacity: page === totalPages - 1 ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronRight} />
        </span>
      </div>
    </div>
  );
}

export default BookList;
