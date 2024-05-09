import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header/Header';

function NotFoundPage() {
  return (
    <div>
    <Header/>
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">404 Page Not Found</h1>
        <p className="mb-8">Sorry, the page you are looking for does not exist.</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
      
    </div>
  );
}

export default NotFoundPage;
