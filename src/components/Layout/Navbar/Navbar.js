import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

function Navbar({ navItems }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);

  const handleDropdownEnter = (index) => {
    // 清除任何待处理的关闭操作
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(index);
  };

  const handleDropdownLeave = () => {
    // 延迟关闭，给用户时间移动到下拉菜单
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 150); // 150ms 延迟
    setCloseTimeout(timeout);
  };

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // 关闭下拉菜单当点击外部时
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  return (
    <nav className="text-white p-4">
      <div className="flex justify-between space-x-1 md:space-x-2 flex-wrap">
        {navItems.map((item, index) => {
          // 如果是分组菜单
          if (item.children && item.children.length > 0) {
            return (
              <div
                key={index}
                className="dropdown-container relative"
                onMouseEnter={() => handleDropdownEnter(index)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className="text-xs md:text-sm px-1 md:px-2 py-2 rounded hover:bg-gray-700 flex items-center gap-1"
                  onClick={() => handleDropdownToggle(index)}
                >
                  {item.label}
                  <FaChevronDown className="text-xs" />
                </button>
                {openDropdown === index && (
                  <div 
                    className="absolute top-full left-0 pt-1 z-50"
                    onMouseEnter={() => handleDropdownEnter(index)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {/* 下拉菜单内容 */}
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg min-w-[160px] py-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className="block px-4 py-2 text-xs md:text-sm hover:bg-gray-700 dark:hover:bg-gray-600 text-white"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // 普通菜单项
          return (
            <Link
              key={index}
              to={item.path}
              className="text-xs md:text-sm px-1 md:px-2 py-2 rounded hover:bg-gray-700"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default Navbar;
