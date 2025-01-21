import NavbarWithLogo from '@/components/Navbars/NavbarWithLogo';
import React from 'react';

const Layout = ({children}) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
        <NavbarWithLogo />
        {children}
    </div>
  );
}

export default Layout;
