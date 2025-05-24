import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import './account.scss';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../config/store';
import { User } from 'lucide-react';

const AccountDropdown = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [isOpen, setIsOpen] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:9000/api/user-profile/image')
      .then(response => response.text())
      .then(imageUrl => {
        if (imageUrl) setUserImageUrl(imageUrl);
      })
      .catch(() => setUserImageUrl(null));
  }, [account]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    navigate('/logout');
  };

  const handleMenuItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="dropdown__button" onClick={toggleDropdown}>
        {/* <span className="dropdown__icon">⚙️</span> */}
        {userImageUrl ? (
          <img className="dropdown__avatar" src={userImageUrl} alt="User Avatar" />
        ) : (
          <User className="dropdown__avatar dropdown__icon" size={25} />
        )}
        <span className="dropdown__username">{account.login}</span>
      </button>
      {isOpen && (
        <ul className="dropdown__menu">
          <li onClick={() => handleMenuItemClick(() => navigate('/app/user-profile'))} className="dropdown__item">
            Profile
          </li>
          <li onClick={() => setIsOpen(false)} className="dropdown__item">
            Announcements
          </li>
          <li onClick={() => setIsOpen(false)} className="dropdown__item">
            Help
          </li>
          <li className="dropdown__item" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      )}
    </div>
  );
};

export default AccountDropdown;
