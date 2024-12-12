import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './book-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Book } from '../../shared/model/book.model';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import toast, { Toaster } from 'react-hot-toast';

function BookManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Books, setBooks] = useState<Book[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookName, setBookName] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [bookStatus, setBookStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchBooks = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/books?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setBooks(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
        setTotalBooks(data.totalElements);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const fetchSelectedBook = bookId => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedBookId(data.id);
        setBookName(data.bookName);
        setTitle(data.title);
        setAuthor(data.author);
        setDescription(data.description);
        setCategory(data.category);
        setLanguage(data.language);
        setBookStatus(data.bookStatus);
        setImageUrl(data.imageUrl);
        toggleModal(true);
      })
      .catch(error => console.error('Error fetching selected book:', error));
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

  const toggleModal = (editing = false) => {
    setIsModalOpen(!isModalOpen);
    setIsEditing(editing);
    if (!isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      setBookName('');
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setLanguage('');
      setBookStatus('');
      setImageUrl('');
      document.body.classList.remove('modal-open');
    }
  };

  const handleClick = bookId => {
    navigate(`/app/admin/book-managerment/${bookId}`);
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSaveBook = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save book: XSRF token is missing');
      return;
    }

    const bookData = {
      bookName,
      title,
      author,
      description,
      category,
      chapterCount: 0,
      language,
      bookStatus,
      imageUrl,
      deleted: false,
    };

    fetch(`http://localhost:9000/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(bookData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Book saved:', data);
        toggleModal();
        fetchBooks(Page, searchText);
        toast.success('Book saved successfully');
      })
      .catch(error => {
        console.error('Error saving book:', error);
        toast.error('Failed to save book');
      });
  };

  const handleEditBook = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to edit book: XSRF token is missing');
      return;
    }

    const bookData = {
      id: selectedBookId,
      bookName,
      title,
      author,
      description,
      category,
      language,
      bookStatus,
      imageUrl,
    };

    fetch(`http://localhost:9000/api/books/${selectedBookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(bookData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Book edited:', data);
        toggleModal();
        fetchBooks(Page, searchText);
        toast.success('Book edited successfully');
      })
      .catch(error => {
        console.error('Error editing book:', error);
        toast.error('Failed to edit book');
      });
  };

  const handleDeleteBook = bookId => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to delete book: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          setBooks(Books.filter(book => book.id !== bookId));
          toast.success('Book deleted successfully');
        } else {
          console.error('Error deleting book:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      });
  };

  const handleDeleteClick = bookId => {
    setSelectedBookId(bookId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBookId) {
      handleDeleteBook(selectedBookId);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="container">
      <div className="header-div">
        <div className="action-buttons">
          <button className="btn" onClick={() => toggleModal(false)}>
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
              <td>
                <span onClick={() => handleClick(book.id)} className="clickable-book-name">
                  {book.bookName}
                </span>
              </td>
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
                  <FontAwesomeIcon icon={faEdit} onClick={() => fetchSelectedBook(book.id)} />
                </button>
                <button className="action-btn" style={{ marginLeft: '10px' }} onClick={() => handleDeleteClick(book.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>
          Showing page {Page + 1} of {totalPages} - Total books: {totalBooks}
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
            <h2>{isEditing ? 'Edit Book' : 'New Book'}</h2>
            <form onSubmit={isEditing ? handleEditBook : handleSaveBook}>
              <label>Book Name:</label>
              <input
                id="bookName"
                type="text"
                placeholder="Enter book name"
                value={bookName}
                onChange={e => setBookName(e.target.value)}
                required
              />

              <label>Author:</label>
              <input
                id="author"
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
              />

              <label>Title:</label>
              <input id="title" type="text" placeholder="Enter title" value={title} onChange={e => setTitle(e.target.value)} required />

              <label>Category:</label>
              <input
                id="category"
                type="text"
                placeholder="Enter category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />

              <label htmlFor="language">Language:</label>
              <select id="language" value={language} onChange={e => setLanguage(e.target.value)} required>
                <option value="" disabled selected>
                  Select language
                </option>
                <option value="ENGLISH">English</option>
                <option value="VIETNAMESE">Vietnamese</option>
                <option value="JAPANESE">Japanese</option>
              </select>

              <label htmlFor="bookStatus">Book Status:</label>
              <select id="bookStatus" value={bookStatus} onChange={e => setBookStatus(e.target.value)} required>
                <option value="" disabled selected>
                  Select status
                </option>
                <option value="DONE">Done</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

              <label htmlFor="imageUrl">Image URL:</label>
              <input
                id="imageUrl"
                type="url"
                placeholder="Enter image URL"
                maxLength={2048}
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />

              <label>Description:</label>
              <textarea
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => toggleModal(true)}>
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
        message="All the information of this book will be deleted. Are you sure you want to continue delete it?"
      />
      <Toaster />
    </div>
  );
}

export default BookManagerment;
