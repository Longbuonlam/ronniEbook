import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './file-management.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '../../shared/layout/confirmation/confirmation-modal';
import UploadFileModal from '../../shared/layout/upload-file/upload-file-modal';
import FileReorderModal from '../../shared/layout/file-reorder/file-reorder-modal';
import { RonnieFile } from '../../shared/model/file.model';
import toast, { Toaster } from 'react-hot-toast';

function FileManagerment() {
  const { chapterId } = useParams();
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Files, setFiles] = useState<RonnieFile[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [chapterName, setChapterName] = useState('');
  const [chapterStorageId, setChapterStorageId] = useState('');
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [docxFile, setDocxFile] = useState<File | null>(null);

  const fetchChapter = () => {
    fetch(`http://localhost:9000/api/chapters/${chapterId}`)
      .then(response => response.json())
      .then(data => {
        setChapterStorageId(data.storageId);
        setChapterName(data.chapterName);
        setBookId(data.bookId);
      })
      .catch(error => console.error('Error fetching chapter:', error));
  };

  const fetchBook = () => {
    fetch(`http://localhost:9000/api/books/${bookId}`)
      .then(response => response.json())
      .then(data => {
        setBookName(data.bookName);
      })
      .catch(error => console.error('Error fetching book:', error));
  };

  const fetchFiles = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/files?page=${pageNumber}&size=6&searchText=${search}&chapterStorageId=${chapterStorageId}`)
      .then(response => response.json())
      .then(data => {
        setFiles(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching files:', error));
  };

  useEffect(() => {
    fetchChapter();
  }, [chapterId]);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    fetchFiles(0, searchQuery);
  }, [chapterStorageId, searchQuery]);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchFiles(pageNumber);
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
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleDeleteClick = fileId => {
    setSelectedFileId(fileId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFileId) {
      handleDeleteFile(selectedFileId);
      setIsConfirmOpen(false);
    }
  };

  const handleSaveFile = (file: File) => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save file: XSRF token is missing');
      return;
    }

    // File validation
    const maxFileSize = 30 * 1024 * 1024; // 30 MB
    const allowedFileTypes = [
      'application/pdf', // PDF
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];

    if (file.size > maxFileSize) {
      toast.error('File size exceeds the 30 MB limit');
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF and DOCX documents are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('folderId', chapterStorageId);
    formData.append('file', file);

    fetch(`http://localhost:9000/api/file/upload-file`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        console.log('File saved:', data);
        toggleModal();
        fetchFiles(Page, searchText);
        toast.success('Tệp đã được tải lên thành công');
      })
      .catch(error => {
        console.error('Error saving file:', error);
        toast.error('Lưu tệp không thành công');
      });
  };

  const handleDeleteFile = fileId => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to delete file: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/file/delete-file/${fileId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
    })
      .then(response => {
        if (response.ok) {
          setFiles(Files.filter(file => file.storageId !== fileId));
          toast.success('Tệp đã được xóa thành công');
        } else {
          console.error('Error deleting file:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error deleting file:', error);
        toast.error('Xóa tệp không thành công');
      });
  };

  const handleSaveReorderedFiles = (reorderedFiles: RonnieFile[]) => {
    setFiles(reorderedFiles);
    setIsEditing(false);

    const newOrder = reorderedFiles.reduce(
      (acc, file) => {
        acc[file.id] = file.order;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to save reordered files: XSRF token is missing');
      return;
    }

    fetch(`http://localhost:9000/api/files/change-order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify({ chapterStorageId, newOrder }),
    })
      .then(response => {
        if (response.ok) {
          toast.success('Các tệp đã được sắp xếp lại thành công');
        } else {
          console.error('Error reordering files:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error reordering files:', error);
        toast.error('Sắp xếp lại các tệp không thành công');
      });
  };

  return (
    <div className="file-container">
      <div className="file-header-div">
        <div className="file-header-breadcrumbs">
          <span onClick={() => navigate('/app/admin/book-managerment')}>Quản lý sách</span>
          <span>&gt;</span>
          <span onClick={() => navigate(`/app/admin/book-managerment/${bookId}`)}>{bookName}</span>
          <span>&gt;</span>
          <span>{chapterName}</span>
        </div>
      </div>

      <div className="file-header-div">
        <h2>Quản lý File</h2>
        <div className="file-action-buttons">
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            + Tải lên tệp
          </button>
          <UploadFileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={handleSaveFile} file={docxFile} />
          <button className="btn" onClick={() => setIsEditing(true)}>
            Sắp xếp thứ tự
          </button>
        </div>

        <div className="file-search-bar-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="file-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên tệp..."
            className="file-search-input"
            value={searchText}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
      </div>

      <table className="file-table">
        <thead>
          <tr>
            <th>Thứ tự</th>
            <th>Tên file</th>
            <th>Lưu trữ file</th>
            <th>Đường dẫn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Files.map((file, index) => (
            <tr key={index}>
              <td>{file.order}</td>
              <td>{file.fileName}</td>
              <td>{file.fileStore}</td>
              <td>{file.fileUrl}</td>
              <td>
                <div className={`badge status ${file.fileStatus !== 'UPLOAD_FINISH' ? 'UPLOAD_ERROR' : ''}`}>
                  <span>{file.fileStatus === 'UPLOAD_FINISH' ? 'Đã tải lên' : 'Lỗi tải lên'}</span>
                </div>
              </td>
              <td>
                <button className="file-action-btn" style={{ marginLeft: '10px' }} onClick={() => handleDeleteClick(file.storageId)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="file-pagination">
        <span>
          Trang {Page + 1}/{totalPages}
        </span>
        <div>
          <button className="file-page-btn" onClick={() => handlePageChange(Page - 1)} disabled={Page === 0}>
            Trang trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} className={`file-page-btn ${Page === index ? 'active' : ''}`} onClick={() => handlePageChange(index)}>
              {index + 1}
            </button>
          ))}
          <button className="file-page-btn" onClick={() => handlePageChange(Page + 1)} disabled={Page === totalPages - 1}>
            Trang sau
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Tất cả thông tin của tệp này sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục xóa không?"
      />

      <FileReorderModal isOpen={isEditing} onClose={() => setIsEditing(false)} onSave={handleSaveReorderedFiles} initialFiles={Files} />

      <Toaster />
    </div>
  );
}

export default FileManagerment;
