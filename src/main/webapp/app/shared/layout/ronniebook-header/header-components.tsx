import React from 'react';

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

export const SignButton = () => (
  <div className="nav__btns">
    <button className="btn sign__up">Sign Up</button>
    <button className="btn sign__in">Sign In</button>
  </div>
);
