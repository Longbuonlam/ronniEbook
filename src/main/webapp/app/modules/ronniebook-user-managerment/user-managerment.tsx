import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../shared/model/ronniebookuser.model';
import toast, { Toaster } from 'react-hot-toast';
import { useAppSelector } from '../../config/store';

function UserManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Users, setUsers] = useState<User[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userLogin, setUserLogin] = useState('');
  const [userRole, setUserRole] = useState('');
  const [originalUserRole, setOriginalUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = useAppSelector(state => state.authentication.account);

  const fetchUsers = (pageNumber = 0, search = '') => {
    fetch(`http://localhost:9000/api/users?page=${pageNumber}&size=6&searchText=${search}`)
      .then(response => response.json())
      .then(data => {
        setUsers(data.content);
        setPage(pageNumber);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalElements);
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  const fetchSelectedUser = userId => {
    fetch(`http://localhost:9000/api/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedUserId(data.id);
        setUserLogin(data.login);
        const roleString = data.authorities.map(authority => authority.name).join(', ');
        setUserRole(roleString);
        setOriginalUserRole(roleString);
        setUserStatus(data.activated ? 'Active' : 'Inactive');
        toggleModal(true);
      })
      .catch(error => console.error('Error fetching user:', error));
  };

  const toggleModal = (editing = false) => {
    setIsModalOpen(!isModalOpen);
    setIsEditing(editing);
    if (!isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      setUserLogin('');
      setUserRole('');
      setOriginalUserRole('');
      setUserStatus('');
      document.body.classList.remove('modal-open');
    }
  };

  useEffect(() => {
    fetchUsers(0, searchQuery);
  }, [searchQuery]);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchUsers(pageNumber);
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

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleEditUser = event => {
    event.preventDefault();
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to edit user: XSRF token is missing');
      return;
    }

    const userData: any = {
      id: selectedUserId,
      login: userLogin,
      activated: userStatus === 'Active' || userStatus === '' ? true : false,
    };

    // Only include authorities if the role has been changed
    if (userRole !== originalUserRole) {
      userData.authorities = userRole ? [{ name: userRole }] : null;
    }

    fetch(`http://localhost:9000/api/users/${selectedUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('User edited:', data);
        fetchUsers(Page);
        toast.success('User edited successfully');
        toggleModal(false);
      })
      .catch(error => {
        console.error('Error editing user:', error);
        toast.error('Failed to edit user');
      });
  };

  return (
    <div className="container">
      <div className="header-div">
        <h2>Quản lý người dùng</h2>
        <div className="search-bar-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="search-input"
            value={searchText}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Quyền hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Users.map((user, index) => (
            <tr key={index}>
              <td>{user.login}</td>
              <td>
                <span className="badge role">
                  {user.authorities.map(authority =>
                    authority.name === 'ROLE_ADMIN' ? 'Quản trị viên' : authority.name === 'ROLE_USER' ? 'Người dùng' : authority.name,
                  )}
                </span>
              </td>
              <td>
                <span className={`badge ${user.activated ? 'status-active' : 'status-inactive'}`}>
                  {user.activated ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => {
                    if (currentUser && currentUser.login === user.login) {
                      toast.error('Admins cannot edit their own account');
                    } else {
                      fetchSelectedUser(user.id);
                    }
                  }}
                  style={currentUser && currentUser.login === user.login ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={currentUser && currentUser.login === user.login ? 'Admins cannot edit their own account' : 'Edit user'}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="user-manage-pagination">
        <span>
          Trang {Page + 1}/{totalPages} - Tổng số người dùng: {totalUsers}
        </span>
        <div>
          <button className="user-manage-page-btn" onClick={() => handlePageChange(Page - 1)} disabled={Page === 0}>
            Trang trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`user-manage-page-btn ${Page === index ? 'active' : ''}`}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </button>
          ))}
          <button className="user-manage-page-btn" onClick={() => handlePageChange(Page + 1)} disabled={Page === totalPages - 1}>
            Trang sau
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Chỉnh sửa người dùng' : 'User Details'}</h2>
            <form onSubmit={handleEditUser}>
              <label>Người dùng:</label>
              <input
                id="userLogin"
                type="text"
                placeholder="Enter user login"
                value={userLogin}
                onChange={e => setUserLogin(e.target.value)}
                required
                disabled
              />

              <label>Quyền hạn:</label>
              <select id="userRole" value={userRole} onChange={e => setUserRole(e.target.value)} required>
                <option value="ROLE_ADMIN">Quản trị viên</option>
                <option value="ROLE_USER">Người dùng</option>
              </select>

              <label>Trạng thái:</label>
              <select id="userStatus" value={userStatus} onChange={e => setUserStatus(e.target.value)} required>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => toggleModal(true)}>
                  <FontAwesomeIcon icon={faTimes} />
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

export default UserManagerment;
