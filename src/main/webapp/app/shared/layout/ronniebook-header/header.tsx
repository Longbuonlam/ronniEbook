import './header.scss';
import React, { useState } from 'react';
import { Brand, SignButton, DefaultItems, UserItems, AdminItems } from './header-components';
import { AccountMenu } from '../menus';
import AccountDropdown from '../ronniebook-account/account';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

const RonnieHeader = (props: IHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  return (
    <nav>
      <Brand />
      {props.isAuthenticated ? <>{props.isAdmin ? <AdminItems /> : <UserItems />}</> : <DefaultItems />}
      {props.isAuthenticated ? <AccountDropdown /> : <SignButton />}
    </nav>
  );
};

export default RonnieHeader;
