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

export const Items = () => (
  <ul className="nav__links" id="nav-links">
    <li>
      <a href="#">Home</a>
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

export const DefaultItems = () => (
  <ul className="nav__links" id="nav-links">
    <li>
      <a href="#">Home</a>
    </li>
    <li>
      <a>Book</a>
    </li>
    <li>
      <a>PDF Book</a>
    </li>
    <li>
      <a>About Us</a>
    </li>
  </ul>
);

export const UserItems = () => (
  <ul className="nav__links" id="nav-links">
    <li>
      <a>Home</a>
    </li>
    <li>
      <a>Book</a>
    </li>
    <li>
      <a>PDF Book</a>
    </li>
    <li>
      <a>Favourite</a>
    </li>
    <li>
      <a>Progress</a>
    </li>
    <li>
      <a>History</a>
    </li>
    <li>
      <a>About Us</a>
    </li>
  </ul>
);

export const AdminItems = () => (
  <ul className="nav__links" id="nav-links">
    <li>
      <a>Home</a>
    </li>
    <li>
      <a>Book</a>
    </li>
    <li>
      <a>PDF Book</a>
    </li>
    <li>
      <a>User Managerment</a>
    </li>
  </ul>
);

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
