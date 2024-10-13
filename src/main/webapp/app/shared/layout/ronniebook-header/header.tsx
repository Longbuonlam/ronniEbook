import './header.scss';
import React, { useState } from 'react';
import { Brand, SignButton, Items } from './header-components';

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
      <Items />
      <SignButton />
    </nav>
  );
};

export default RonnieHeader;
