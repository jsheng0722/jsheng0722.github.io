import React from 'react';

function Footer() {
  return (
    <footer className="flex flex-col border-t border-gray-300 pt-4 mt-4 w-full">
      <div className='flex flex-row justify-center items-center'>
        <div className='flex flex-col flex-1 items-center'>
          <h3 className='text-bold'>GitHub</h3>
          <a href="https://github.com/jsheng0722" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700">
              github.com/jsheng0722
          </a>
        </div>
        <div className='flex flex-col flex-1 items-center'>
          <h3 className='text-bold'>LinkedIn</h3>
          <a href="https://linkedin.com/in/jihui-sheng-1379361aa" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700">
              linkedin.com/in/jihui-sheng-1379361aa
          </a>
        </div>
        <div className='flex flex-col flex-1 items-center'>
          <h3 className='text-bold'>Email</h3>
          <a href="mailto:sheng.jih@northeastern.edu" className="text-sm text-blue-500 hover:text-blue-700">
              sheng.jih@northeastern.edu
          </a>
        </div>
      </div>
      <div>
        <p className="flex text-sm justify-center mt-5 text-gray-500">2024© Created by Jiuhui Sheng</p>
      </div>
    </footer>
  );
}

export default Footer;
