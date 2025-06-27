import React from 'react';

const FilterBar = ({ filter, setFilter, orders }) => {
  const getFilterCount = (filterType) => {
    if (filterType === 'all') return orders.length;
    if (filterType === 'completed') {
      return orders.filter(o => ['completed', 'delivered'].includes(o.status)).length;
    }
    return orders.filter(o => o.status === filterType).length;
  };

  return (
    <div className="filter-bar">
      <button 
        className={filter === 'all' ? 'active' : ''}
        onClick={() => setFilter('all')}
      >
        Todas ({getFilterCount('all')})
      </button>
      <button 
        className={filter === 'completed' ? 'active' : ''}
        onClick={() => setFilter('completed')}
      >
        Completadas ({getFilterCount('completed')})
      </button>
      <button 
        className={filter === 'pending' ? 'active' : ''}
        onClick={() => setFilter('pending')}
      >
        Pendientes ({getFilterCount('pending')})
      </button>
      <button 
        className={filter === 'processing' ? 'active' : ''}
        onClick={() => setFilter('processing')}
      >
        Procesando ({getFilterCount('processing')})
      </button>
      <button 
        className={filter === 'cancelled' ? 'active' : ''}
        onClick={() => setFilter('cancelled')}
      >
        Canceladas ({getFilterCount('cancelled')})
      </button>
    </div>
  );
};

export default FilterBar;