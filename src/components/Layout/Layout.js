import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Sidebar from './Sidebar/Sidebar'; // Assuming you have a Sidebar component
import Main from './Main/Main';

function Layout() {
  return (
    <div className="grid grid-cols-5 grid-rows-[auto,1fr,auto] min-h-screen">
      <header className="col-span-5"> {/* Header across all columns */}
        <Header />
      </header>

      <aside className=" hidden col-span-1 bg-gray-200 p-5"> {/* Left Sidebar */}
        <Sidebar className="left-sidebar" />
      </aside>

      <main className="col-span-3 bg-white p-5"> {/* Main Content Area */}
        <Main />
      </main>

      <aside className="hidden col-span-1 bg-gray-200 p-5"> {/* Right Sidebar */}
        <Sidebar className="right-sidebar" />
      </aside>

      <footer className="col-span-5 bg-gray-100"> {/* Footer across all columns */}
        <Footer />
      </footer>
    </div>

  );
}

export default Layout;
