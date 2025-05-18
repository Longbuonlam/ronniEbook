import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../shared/model/ronniebookuser.model';
import toast, { Toaster } from 'react-hot-toast';

function UserManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Users, setUsers] = useState<User[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [userLogin, setUserLogin] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');

  const fetchUsers = (pageNumber = 0) => {
    fetch(`http://localhost:9000/api/users?page=${pageNumber}&size=6`)
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setPage(pageNumber);
        setTotalPages(1);
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  const fetchSelectedUser = userId => {
    fetch(`http://localhost:9000/api/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedBookId(data.id);
        setUserLogin(data.login);
        setUserRole(data.authorities.map(authority => authority.name).join(', '));
        setUserStatus(data.activated ? 'Active' : 'Inactive');
      })
      .catch(error => console.error('Error fetching user:', error));
  };

  useEffect(() => {
    fetchUsers(0);
  }, []);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      fetchUsers(pageNumber);
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

    const userData = {
      login: userLogin,
      authorities: userRole,
      activated: userStatus,
    };
    fetch(`http://localhost:9000/api/users/${selectedBookId}`, {
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
      })
      .catch(error => {
        console.error('Error editing user:', error);
        toast.error('Failed to edit user');
      });
  };

  return (
    <div className="container">
      <h2>Users</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Users.map((user, index) => (
            <tr key={index}>
              <td>{user.login}</td>
              <td>
                <span className="badge role">{user.authorities.map(authority => authority.name)}</span>
              </td>
              <td>
                <span className="badge status">{user.activated ? 'Active' : 'Inactive'}</span>
              </td>
              <td>
                <button className="action-btn">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="action-btn" style={{ marginLeft: '10px' }}>
                  <FontAwesomeIcon icon={faTrash} />
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

export default UserManagerment;
