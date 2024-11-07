import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user-managerment.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../shared/model/ronniebookuser.model';

function UserManagerment() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [Users, setUsers] = useState<User[]>([]);
  const [Page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    fetchUsers(0);
  }, []);

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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>Showing 1 of 1</span>
        <div>
          <button className="page-btn">Previous</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">Next</button>
        </div>
      </div>
    </div>
  );
}

export default UserManagerment;
