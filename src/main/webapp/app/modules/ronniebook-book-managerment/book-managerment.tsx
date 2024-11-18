import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './book-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Book } from '../../shared/model/book.model';

function BookManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Books, setBooks] = useState<Book[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  return (
    <div className="container">
      <div className="header-div">
        <div className="action-buttons">
          <button className="btn" onClick={toggleModal}>
            + Add Book
          </button>
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
                <div className={`badge status ${book.bookStatus !== 'DONE' ? 'in-progress' : ''}`}>
                  <span>{book.bookStatus === 'DONE' ? 'Done' : 'In Progress'}</span>
                </div>
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

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Book</h2>
            <form>
              <label>Book Name:</label>
              <input id="bookName" type="text" placeholder="Enter book name" required />

              <label>Author:</label>
              <input id="author" type="text" placeholder="Enter author name" />

              <label>Title:</label>
              <input id="title" type="text" placeholder="Enter title" required />

              <label>Category:</label>
              <input id="category" type="text" placeholder="Enter category" />

              <label htmlFor="language">Language:</label>
              <select id="language" required>
                <option value="" disabled selected>
                  Select language
                </option>
                <option value="EN">English</option>
                <option value="VN">Vietnamese</option>
                <option value="JP">Japanese</option>
              </select>

              <label htmlFor="bookStatus">Book Status:</label>
              <select id="bookStatus">
                <option value="" disabled selected>
                  Select status
                </option>
                <option value="DONE">Done</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

              <label htmlFor="imageUrl">Image URL:</label>
              <input id="imageUrl" type="url" placeholder="Enter image URL" maxLength={2048} />

              <label>Description:</label>
              <textarea id="description" placeholder="Enter description"></textarea>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={toggleModal}>
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
    </div>
  );
}

export default BookManagerment;
