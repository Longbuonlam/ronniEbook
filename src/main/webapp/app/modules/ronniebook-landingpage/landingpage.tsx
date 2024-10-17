import './landingpage.scss';

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getLoginUrl, REDIRECT_URL } from 'app/shared/util/url-utils';
import { useAppSelector } from 'app/config/store';

export const LandingPage = () => {
  const account = useAppSelector(state => state.authentication.account);
  const pageLocation = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectURL = localStorage.getItem(REDIRECT_URL);
    if (redirectURL) {
      localStorage.removeItem(REDIRECT_URL);
      location.href = `${location.origin}${redirectURL}`;
    }
  });

  return (
    <header className="header__container">
      <div className="header__image">
        <img src="/content/images/landingpage-book.png" alt="header" />
      </div>
      <div className="header__content">
        <h1>
          WELCOME!
          <br />
          <span>RONNIEBOOK</span> IS WAITING FOR YOU{' '}
        </h1>
        <p>
          Start your reading journey today and explore a world of imagination, knowledge, and inspiration. Our e-book platform offers a vast
          collection of genres, from gripping mysteries to timeless classics and modern bestsellers. Whether you're looking to learn
          something new or lose yourself in a captivating story, we have the perfect e-book for you. Discover endless possibilities and
          unforgettable experiences with every page!
        </p>
        <form action="/">
          <div className="input__row">
            <h4> Click here to try this website's demo</h4>
          </div>
          <button
            type="submit"
            onClick={() =>
              navigate(getLoginUrl(), {
                state: { from: pageLocation },
              })
            }
          >
            Demo
          </button>
        </form>
      </div>
    </header>
  );
};

export default LandingPage;
