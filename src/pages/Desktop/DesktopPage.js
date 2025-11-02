import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import Desktop from '../../components/Desktop/Desktop';

function DesktopPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Desktop />
      <Footer />
    </div>
  );
}

export default DesktopPage;
