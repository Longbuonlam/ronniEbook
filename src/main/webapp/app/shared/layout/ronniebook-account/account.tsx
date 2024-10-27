import React, { useLayoutEffect, useState } from 'react';
import './account.scss';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from 'app/config/store';

const AccountDropdown = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <div className="dropdown">
      <button className="dropdown__button" onClick={toggleDropdown}>
        {/* <span className="dropdown__icon">⚙️</span> */}
        <img className="dropdown__avatar" src="/path-to-avatar.jpg" alt="User Avatar" />
        <span className="dropdown__username">{account.login}</span>
      </button>
      {isOpen && (
        <ul className="dropdown__menu">
          <li className="dropdown__item">Profile</li>
          <li className="dropdown__item">Announcements</li>
          <li className="dropdown__item">Help</li>
          <li className="dropdown__item" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      )}
    </div>
  );
};

export default AccountDropdown;
