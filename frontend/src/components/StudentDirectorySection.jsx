// src/components/StudentDirectorySection.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDirectoryFilters } from '../redux/student/studentSlice';
import { ICONS } from '../constants/icons';

import { getDateString } from '../utils/dateUtils';

const StudentDirectorySection = ({ onViewHealth, onViewAttendance, onViewStudent }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory) || [];
  
  const search = useSelector((state) => state.student.directorySearch);
  const blockFilter = useSelector((state) => state.student.directoryBlockFilter);
  const page = useSelector((state) => state.student.directoryPage);
  const pageSize = useSelector((state) => state.student.directoryPageSize);

  // Filter logic
  const filtered = db.filter(student => {
    const term = search.toLowerCase();
    const matchesSearch = student.id.toLowerCase().includes(term) || 
                          student.name.toLowerCase().includes(term) || 
                          student.room.toLowerCase().includes(term);
                          
    const matchesBlock = blockFilter === 'all' || student.block === blockFilter;
    
    return matchesSearch && matchesBlock;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentPage = page > totalPages ? totalPages : page;
  
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    dispatch(setDirectoryFilters({ search: e.target.value, page: 1 }));
  };

  const handleBlockChange = (e) => {
    dispatch(setDirectoryFilters({ blockFilter: e.target.value, page: 1 }));
  };



  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setDirectoryFilters({ page: currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setDirectoryFilters({ page: currentPage + 1 }));
    }
  };

  return (
    <div className="dashboard-panel dashboard-full">
      <div className="panel-header">
        <h2 className="panel-title">{ICONS.users} Hostel Residents Directory</h2>
      </div>

      <div className="filter-row">
        <div className="search-input-wrapper">
          {ICONS.search}
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name, ID, room..." 
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-actions">
          <select 
            className="filter-select"
            value={blockFilter}
            onChange={handleBlockChange}
          >
            <option value="all">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
            <option value="D">Block D</option>
          </select>
          

        </div>
      </div>

      <div className="directory-table-wrapper">
        <table className="directory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Room</th>
              <th>Block</th>
              <th>Contact Info</th>
              <th style={{ textAlign: 'right' }}>Profile Log</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  No students match the criteria
                </td>
              </tr>
            ) : (
              paginated.map(s => {

                return (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '800', flexShrink: 0, overflow: 'hidden' }}>
                          {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.room}</td>
                    <td><span className="student-block-badge">Block {s.block}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.email}<br />{s.phone}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button"
                        className="table-btn btn-view-health" 
                        style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca', marginRight: '4px' }}
                        onClick={() => onViewHealth && onViewHealth(s.id)}
                      >
                        Med
                      </button>
                      <button 
                        type="button"
                        className="table-btn btn-view-student" 
                        onClick={() => onViewStudent && onViewStudent(s.id)}
                      >
                        Log
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} students
        </div>
        
        <div className="pagination-buttons">
          <button 
            type="button"
            className="table-btn" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button 
            type="button"
            className="table-btn" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDirectorySection;
