import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import LoginRedirect from 'app/modules/login/login-redirect';
import Logout from 'app/modules/login/logout';
import LandingPage from './modules/ronniebook-landingpage/landingpage';
import EntitiesRoutes from 'app/entities/routes';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import PageNotFound from 'app/shared/error/page-not-found';
import { AUTHORITIES } from 'app/config/constants';
import Home from './modules/ronniebook-home/home';
import BookDetail from './modules/ronniebook-book-detail/book-detail';
import UserManagerment from './modules/ronniebook-user-managerment/user-managerment';
import MainBook from './modules/ronniebook-book/book';
import FavouriteBook from './modules/ronniebook-favourite/favourite';

const loading = <div>loading ...</div>;

const Admin = Loadable({
  loader: () => import(/* webpackChunkName: "administration" */ 'app/modules/administration'),
  loading: () => loading,
});

export interface RouteProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AppRoutes = (props: RouteProps) => {
  return (
    <div className="view-routes">
      <ErrorBoundaryRoutes>
        <Route
          index
          element={
            props.isAuthenticated ? (
              <>{props.isAdmin ? <Navigate to="/app/admin/user-managerment" /> : <Navigate to="/app/home" />}</>
            ) : (
              <LandingPage />
            )
          }
        />
        <Route path="logout" element={<Logout />} />
        <Route
          path="admin/*"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route path="sign-in" element={<LoginRedirect />} />
        <Route
          path="*"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <EntitiesRoutes />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
        <Route path="app/home" element={<Home />} />
        <Route path="/app/book" element={<MainBook />} />
        <Route path="app/book/:bookId" element={<BookDetail />} />
        <Route path="/app/favourite" element={<FavouriteBook />} />
        <Route
          path="/app/admin/user-managerment"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <UserManagerment />
            </PrivateRoute>
          }
        />
      </ErrorBoundaryRoutes>
    </div>
  );
};

export default AppRoutes;
