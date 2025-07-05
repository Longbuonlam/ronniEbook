import React from 'react';
import { getLoginUrl } from '../../util/url-utils';
import { useLocation, useNavigate } from 'react-router-dom';

export const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img src="content/images/logo-jhipster.png" alt="Logo" />
  </div>
);

export const Brand = () => {
  const navigate = useNavigate();
  return (
    <div className="nav__header">
      <div className="nav__logo">
        <a onClick={() => navigate('/')}>
          Ronni<span>Ebook</span>
        </a>
      </div>
      <div className="nav__menu__btn" id="menu-btn">
        <span>
          <i className="ri-menu-line"></i>
        </span>
      </div>
    </div>
  );
};

export const Items = () => {
  const location = useLocation();
  const isHomeActive = location.pathname === '/app/home';
  return (
    <ul className="nav__links" id="nav-links">
      <li>
        <a href="/app/home" className={isHomeActive ? 'active' : ''}>
          Home
        </a>
      </li>
      <li>
        <a href="#">Book</a>
      </li>
      <li>
        <a href="#">Favourite</a>
      </li>
      <li>
        <a href="#">History</a>
      </li>
      <li>
        <a href="#">About Us</a>
      </li>
    </ul>
  );
};

export const DefaultItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomeActive = location.pathname === '/app/home';
  const isAboutUsActive = location.pathname === '/app/about-us';
  return (
    <ul className="nav__links" id="nav-links">
      <li>
        {/* <a onClick={() => navigate('/app/home')} className={isHomeActive ? 'active' : ''}>
          Home
        </a> */}
      </li>
      <li>
        {/* <a onClick={() => navigate('/app/about-us')} className={isAboutUsActive ? 'active' : ''}>
          About Us
        </a> */}
      </li>
    </ul>
  );
};

export const UserItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomeActive = location.pathname === '/app/home';
  const isBookActive = location.pathname === '/app/book';
  const isFavouriteActive = location.pathname === '/app/favourite';
  const isHistoryActive = location.pathname === '/app/history';
  const isAboutUsActive = location.pathname === '/app/about-us';
  return (
    <ul className="nav__links" id="nav-links">
      <li>
        <a onClick={() => navigate('/app/home')} className={isHomeActive ? 'active' : ''}>
          Trang chủ
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/book')} className={isBookActive ? 'active' : ''}>
          Sách đang đọc
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/favourite')} className={isFavouriteActive ? 'active' : ''}>
          Sách yêu thích
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/history')} className={isHistoryActive ? 'active' : ''}>
          Lịch sử đọc
        </a>
      </li>
    </ul>
  );
};

export const AdminItems = () => {
  const location = useLocation();
  const isUserManagermentActive = location.pathname === '/app/admin/user-managerment';
  const isHomeActive = location.pathname === '/app/home';
  const isBookActive = location.pathname === '/app/book';
  const isFavouriteActive = location.pathname === '/app/favourite';
  const isHistoryActive = location.pathname === '/app/history';
  const isBookManagermentActive = location.pathname === '/app/admin/book-managerment';
  const navigate = useNavigate();
  return (
    <ul className="nav__links" id="nav-links">
      <li>
        <a onClick={() => navigate('/app/home')} className={isHomeActive ? 'active' : ''}>
          Trang chủ
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/book')} className={isBookActive ? 'active' : ''}>
          Sách đang đọc
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/favourite')} className={isFavouriteActive ? 'active' : ''}>
          Sách yêu thích
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/history')} className={isHistoryActive ? 'active' : ''}>
          Lịch sử đọc
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/admin/book-managerment')} className={isBookManagermentActive ? 'active' : ''}>
          Quản lý sách
        </a>
      </li>
      <li>
        <a onClick={() => navigate('/app/admin/user-managerment')} className={isUserManagermentActive ? 'active' : ''}>
          Quản lý người dùng
        </a>
      </li>
    </ul>
  );
};

export const SignButton = () => {
  const pageLocation = useLocation();
  const navigate = useNavigate();
  return (
    <div className="nav__btns">
      <button className="btn sign__up">Sign Up</button>
      <button
        className="btn sign__in"
        onClick={() =>
          navigate(getLoginUrl(), {
            state: { from: pageLocation },
          })
        }
      >
        Sign In
      </button>
    </div>
  );
};
