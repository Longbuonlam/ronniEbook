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
import History from './modules/ronniebook-history/history';
import BookManagerment from './modules/ronniebook-book-managerment/book-managerment';
import ChapterManagerment from './modules/ronniebook-chapter-management/chapter-management';
import FileManagerment from './modules/ronniebook-file-management/file-management';
import FileContent from './modules/ronniebook-reading/reading';
import UserProfile from './modules/ronniebook-user-profile/user-profile';

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
        <Route path="/app/history" element={<History />} />
        <Route path="/app/reading/:fileId" element={<FileContent />} />
        <Route path="/app/user-profile" element={<UserProfile />} />
        <Route
          path="/app/admin/user-managerment"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <UserManagerment />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/admin/book-managerment"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <BookManagerment />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/admin/book-managerment/:bookId"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <ChapterManagerment />
            </PrivateRoute>
          }
        />
        <Route
          path="/app/admin/chapter-managerment/:chapterId"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <FileManagerment />
            </PrivateRoute>
          }
        />
      </ErrorBoundaryRoutes>
    </div>
  );
};

export default AppRoutes;
