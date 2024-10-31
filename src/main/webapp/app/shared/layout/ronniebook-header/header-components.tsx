import React from 'react';
import { getLoginUrl } from '../../util/url-utils';
import { useLocation, useNavigate } from 'react-router-dom';

export const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img src="content/images/logo-jhipster.png" alt="Logo" />
  </div>
);

export const Brand = () => (
  <div className="nav__header">
    <div className="nav__logo">
      <a href="#">
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

export const DefaultItems = () => (
  <ul className="nav__links" id="nav-links">
    <li>
      <a href="#">Home</a>
    </li>
    <li>
      <a>Book</a>
    </li>
    <li>
      <a>About Us</a>
    </li>
  </ul>
);

export const UserItems = () => {
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
        <a>Book</a>
      </li>
      <li>
        <a>Favourite</a>
      </li>
      <li>
        <a>History</a>
      </li>
      <li>
        <a>About Us</a>
      </li>
    </ul>
  );
};

export const AdminItems = () => {
  const location = useLocation();
  const isUserManagermentActive = location.pathname === '/admin/user-managerment';
  return (
    <ul className="nav__links" id="nav-links">
      <li>
        <a>Home</a>
      </li>
      <li>
        <a>Book Managerment</a>
      </li>
      <li>
        <a className={isUserManagermentActive ? 'active' : ''}>User Managerment</a>
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
