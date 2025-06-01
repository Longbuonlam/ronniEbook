import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './chapter-management.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Chapter } from '../../shared/model/chapter.model';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import toast, { Toaster } from 'react-hot-toast';

function ChapterManagerment() {
  const { bookId } = useParams();
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Chapters, setChapters] = useState<Chapter[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterName, setChapterName] = useState('');
  const [number, setNumber] = useState('');
  const [language, setLanguage] = useState('');
  const [chapterStatus, setChapterStatus] = useState('');
  const [bookName, setBookName] = useState('');

  const fetchChapters = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/chapters?page=${pageNumber}&size=6&searchText=${search}&bookId=${bookId}`)
      .then(response => response.json())
      .then(data => {
        setChapters(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching chapters:', error));
  };

  const fetchSelectedChapter = chapterId => {
    fetch(`http://localhost:9000/api/chapters/${chapterId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedChapterId(data.id);
        setChapterName(data.chapterName);
        setNumber(data.number);
        setLanguage(data.language);
        setChapterStatus(data.chapterStatus);
        toggleModal(true);
      })
      .catch(error => console.error('Error fetching selected book:', error));
  };

  const fetchBookName = () => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setBookName(data.bookName);
      })
      .catch(error => console.error('Error fetching book name:', error));
  };

  useEffect(() => {
    fetchBookName();
    fetchChapters(0, searchQuery);
  }, [searchQuery]);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchChapters(pageNumber);
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
      setChapterName('');
      setNumber('');
      setLanguage('');
      setChapterStatus('');
      document.body.classList.remove('modal-open');
    }
  };

  const handleClick = chapterId => {
    navigate(`/app/admin/chapter-managerment/${chapterId}`);
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleEditChapter = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to edit chapter: XSRF token is missing');
      return;
    }

    const chapterData = {
      id: selectedChapterId,
      chapterName,
      number,
      language,
      chapterStatus,
    };

    fetch(`http://localhost:9000/api/chapters/${selectedChapterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(chapterData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Chapter edited:', data);
        toggleModal();
        fetchChapters(Page, searchText);
        toast.success('Chapter edited successfully');
      })
      .catch(error => {
        console.error('Error edit chapter:', error);
        toast.error('Failed to edit chapter');
      });
  };

  const handleSaveChapter = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save chapter: XSRF token is missing');
      return;
    }

    const chapterData = {
      number,
      chapterName,
      language,
      chapterStatus,
      deleted: false,
    };

    fetch(`http://localhost:9000/api/chapters?bookId=${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(chapterData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Chapter saved:', data);
        toggleModal();
        fetchChapters(Page, searchText);
        toast.success('Chapter saved successfully');
      })
      .catch(error => {
        console.error('Error saving chapter:', error);
        toast.error('Failed to save chapter');
      });
  };

  const handleDeleteChapter = chapterId => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to delete chapter: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          setChapters(Chapters.filter(chapter => chapter.id !== chapterId));
          toast.success('Chapter deleted successfully');
        } else {
          console.error('Error deleting chapter:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error deleting chapter:', error);
        toast.error('Failed to delete chapter');
      });
  };

  const handleDeleteClick = chapterId => {
    setSelectedChapterId(chapterId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedChapterId) {
      handleDeleteChapter(selectedChapterId);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="container">
      <div className="header-div">
        <div className="header-breadcrumbs">
          <span onClick={() => navigate('/app/admin/book-managerment')}>Quản lý sách</span>
          <span>&gt;</span>
          <span>{bookName}</span>
        </div>

        <div className="action-buttons">
          <button className="btn" onClick={() => toggleModal(false)}>
            + Thêm chương mới
          </button>
        </div>

        <div className="search-bar-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm chương..."
            className="search-input"
            value={searchText}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
      </div>

      <h2>Quản lý chương</h2>
      <table className="book-table">
        <thead>
          <tr>
            <th>Thứ tự</th>
            <th>Tên chương</th>
            <th>Ngôn ngữ</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Chapters.map((chapter, index) => (
            <tr key={index}>
              <td>{chapter.number}</td>
              <td>
                <span onClick={() => handleClick(chapter.id)} className="clickable-chapter-name">
                  {chapter.chapterName}
                </span>
              </td>
              <td>{chapter.language}</td>
              <td>
                <div className={`badge status ${chapter.chapterStatus !== 'DONE' ? 'in-progress' : ''}`}>
                  <span>{chapter.chapterStatus === 'DONE' ? 'Done' : 'In Progress'}</span>
                </div>
              </td>
              <td>
                <button className="action-btn">
                  <FontAwesomeIcon icon={faEdit} onClick={() => fetchSelectedChapter(chapter.id)} />
                </button>
                <button className="action-btn" style={{ marginLeft: '10px' }} onClick={() => handleDeleteClick(chapter.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>
          Trang {Page + 1}/{totalPages}
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
            <h2>{isEditing ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h2>
            <form onSubmit={isEditing ? handleEditChapter : handleSaveChapter}>
              <label>Tên chương:</label>
              <input
                id="chapterName"
                type="text"
                placeholder="Nhập tên chương"
                value={chapterName}
                onChange={e => setChapterName(e.target.value)}
                required
              />

              <label>Thứ tự của chương:</label>
              <input
                id="number"
                type="text"
                placeholder="Nhập thứ tự chương"
                value={number}
                onChange={e => setNumber(e.target.value)}
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

              <label htmlFor="chapterStatus">Trạng thái:</label>
              <select id="chapterStatus" value={chapterStatus} onChange={e => setChapterStatus(e.target.value)} required>
                <option value="" disabled selected>
                  Chọn trạng thái
                </option>
                <option value="DONE">Done</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

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
        message="Tất cả thông tin của chương này sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục xóa không?"
      />
      <Toaster />
    </div>
  );
}

export default ChapterManagerment;
