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
  const [imageFile, setImageFile] = useState<File | null>(null);

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

    // Create FormData object to send multipart/form-data
    const formData = new FormData();
    formData.append('bookName', bookName);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('language', language);
    formData.append('bookStatus', bookStatus);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    fetch(`http://localhost:9000/api/books`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: formData,
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
            + Thêm sách mới
          </button>
        </div>

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
      </div>

      <h2>Quản lý sách</h2>
      <table className="book-table">
        <thead>
          <tr>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>Số chương</th>
            <th>Ngôn ngữ</th>
            <th>Tình trạng</th>
            <th>Hành động</th>
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
          Trang {Page + 1}/{totalPages} - Tổng số sách hiện có: {totalBooks}
        </span>
        <div>
          <button className="page-btn" onClick={() => handlePageChange(Page - 1)} disabled={Page === 0}>
            Trang trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} className={`page-btn ${Page === index ? 'active' : ''}`} onClick={() => handlePageChange(index)}>
              {index + 1}
            </button>
          ))}
          <button className="page-btn" onClick={() => handlePageChange(Page + 1)} disabled={Page === totalPages - 1}>
            Trang sau
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2>
            <form onSubmit={isEditing ? handleEditBook : handleSaveBook}>
              <label>Tên sách:</label>
              <input
                id="bookName"
                type="text"
                placeholder="Nhập tên sách"
                value={bookName}
                onChange={e => setBookName(e.target.value)}
                required
              />

              <label>Tác giả:</label>
              <input
                id="author"
                type="text"
                placeholder="Nhập tên tác giả"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
              />

              <label>Tiêu đề:</label>
              <input id="title" type="text" placeholder="Nhập tiêu đề" value={title} onChange={e => setTitle(e.target.value)} required />

              <label>Thể loại:</label>
              <input
                id="category"
                type="text"
                placeholder="Nhập thể loại"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />

              <label htmlFor="language">Ngôn ngữ:</label>
              <select id="language" value={language} onChange={e => setLanguage(e.target.value)} required>
                <option value="" disabled selected>
                  Chọn ngôn ngữ
                </option>
                <option value="ENGLISH">English</option>
                <option value="VIETNAMESE">Vietnamese</option>
                <option value="JAPANESE">Japanese</option>
              </select>

              <label htmlFor="bookStatus">Trạng thái:</label>
              <select id="bookStatus" value={bookStatus} onChange={e => setBookStatus(e.target.value)} required>
                <option value="" disabled selected>
                  Chọn trạng thái
                </option>
                <option value="DONE">Done</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

              <label htmlFor="imageUrl">Ảnh bìa:</label>
              <input
                id="imageUrl"
                type="file"
                placeholder="Tải lên ảnh bìa"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />

              <label>Mô tả:</label>
              <textarea
                id="description"
                placeholder="Nhập mô tả sách"
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
        message="Tất cả thông tin về cuốn sách này sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục xóa không?"
      />
      <Toaster />
    </div>
  );
}

export default BookManagerment;
