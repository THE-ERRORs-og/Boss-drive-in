import NavbarWithBackButton from '@/components/Navbars/NavbarWithBackButton';
import React from 'react';

const Layout = ({children}) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
        <NavbarWithBackButton />
        {children}
    </div>
  );
}

export default Layout;
