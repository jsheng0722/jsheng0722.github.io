import React from 'react';
import './TabsOrder.css';

function TabsOrder(props) {
  return (
    <div className="tabs-order">
      <ul className="sort-container">
        {props.tabs.map(item => (
          <li
            onClick={() => props.switchTab(item.type)}
            key={item.id}
            className={item.type === props.active ? 'on' : ''}
          >
            sort by {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TabsOrder;
