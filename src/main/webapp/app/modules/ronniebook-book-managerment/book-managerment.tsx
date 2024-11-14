import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './book-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Book } from '../../shared/model/book.model';

function BookManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Books, setBooks] = useState<Book[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setBooks(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  useEffect(() => {
    fetchBooks(0, searchQuery);
  }, [searchQuery]);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchBooks(pageNumber);
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

  return (
    <div className="container">
      <div className="action-buttons">
        <button className="btn">+ Add Book</button>
      </div>

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

      <h2>Books</h2>
      <table className="book-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Author</th>
            <th>Category</th>
            <th>Chapters</th>
            <th>Language</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Books.map((book, index) => (
            <tr key={index}>
              <td>{book.bookName}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.chapterCount}</td>
              <td>{book.language}</td>
              <td>
                <span className={`badge status ${book.bookStatus !== 'DONE' ? 'in-progress' : ''}`}>
                  {book.bookStatus === 'DONE' ? 'Done' : 'In Progress'}
                </span>
              </td>
              <td>
                <button className="action-btn">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>
          Showing page {Page + 1} of {totalPages}
        </span>
        <div>
          <button className="page-btn" onClick={() => handlePageChange(Page - 1)} disabled={Page === 0}>
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} className={`page-btn ${Page === index ? 'active' : ''}`} onClick={() => handlePageChange(index)}>
              {index + 1}
            </button>
          ))}
          <button className="page-btn" onClick={() => handlePageChange(Page + 1)} disabled={Page === totalPages - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookManagerment;
