// src/components/ComplaintsSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reportComplaintThunk, resolveComplaintThunk } from '../redux/complaint/complaintSlice';
import { fetchDirectoryThunk } from '../redux/student/studentSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { formatDisplayDate } from '../utils/dateUtils';

const ComplaintsSection = ({ student, role }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const directory = useSelector((state) => state.student.directory) || [];

  const [category, setCategory] = useState('Maintenance');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [responseTexts, setResponseTexts] = useState({});

  useEffect(() => {
    if (role && directory.length === 0) {
      dispatch(fetchDirectoryThunk());
    }
  }, [role, directory.length, dispatch]);

  if (!student && !role) return <div>No student selected.</div>;

  // Compile complaints list
  let complaints = [];
  if (student) {
    complaints = student.complaints || [];
  } else if (role) {
    directory.forEach(s => {
      if (s.complaints) {
        s.complaints.forEach(c => {
          complaints.push({
            ...c,
            studentName: s.name,
            studentRoom: s.room,
            studentId: s.id
          });
        });
      }
    });
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const remaining = 3 - selectedFiles.length;

    if (files.length > imageFiles.length) {
      dispatch(addToast({ message: 'Only image files are allowed.', type: 'warning' }));
    }

    if (imageFiles.length > remaining) {
      dispatch(addToast({
        message: `You can attach up to 3 images. ${remaining} slot(s) remaining.`,
        type: 'warning'
      }));
    }

    const filesToAdd = imageFiles.slice(0, remaining).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...filesToAdd]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove, e) => {
    e.stopPropagation();
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].previewUrl);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subject.trim() || !details.trim()) {
      dispatch(addToast({ message: 'Please fill in all required fields.', type: 'warning' }));
      return;
    }

    const complaintData = {
      category,
      subject,
      details,
      attachments: selectedFiles.map(f => f.file.name)
    };

    dispatch(reportComplaintThunk({
      studentId: student?.id,
      complaintData
    })).then((action) => {
      if (action.payload?.success) {
        dispatch(addToast({ message: 'Complaint submitted successfully!', type: 'success' }));
        setSubject('');
        setDetails('');
        selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
      } else {
        dispatch(addToast({ message: action.payload || 'Failed to file complaint.', type: 'error' }));
      }
    });
  };

  const handleResolve = (studentId, complaintId) => {
    const text = responseTexts[complaintId] || '';
    dispatch(resolveComplaintThunk({ studentId, complaintId, responseText: text })).then((action) => {
      if (resolveComplaintThunk.fulfilled.match(action)) {
        dispatch(addToast({ message: 'Ticket resolved and response sent!', type: 'success' }));
        setResponseTexts(prev => ({
          ...prev,
          [complaintId]: ''
        }));
      } else {
        dispatch(addToast({ message: action.payload || 'Failed to resolve ticket.', type: 'error' }));
      }
    });
  };

  return (
    <div className={role ? "dashboard-full" : "tab-grid-2"}>
      {/* File Complaint Form */}
      {!role && (
        <div className="dashboard-panel">
          <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
            <h2 className="panel-title">{ICONS.plus} Register a New Complaint</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>File issues regarding room upkeep, mess, or amenities</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="complaint-category">Category</label>
              <select 
                id="complaint-category" 
                className="form-input" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Maintenance">Room Maintenance & Repair</option>
                <option value="Mess">Mess & Food Quality</option>
                <option value="Internet">Wi-Fi & Internet</option>
                <option value="Electricity">Water & Electricity</option>
                <option value="Housekeeping">Housekeeping & Cleaning</option>
                <option value="Security">Safety & Security</option>
                <option value="Others">Others</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="complaint-subject">Subject</label>
              <input 
                type="text" 
                id="complaint-subject" 
                className="form-input" 
                placeholder="e.g. Wi-Fi router not working" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="complaint-details">Complaint Description Details</label>
              <textarea 
                id="complaint-details" 
                className="form-textarea" 
                placeholder="Describe the issue in detail..." 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required 
                style={{ height: '100px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Attach Images <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '11px' }}>(Optional — max 3 photos)</span>
              </label>
              <div 
                id="complaint-image-dropzone" 
                className={`complaint-image-dropzone ${isDragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="complaint-image-input" 
                  accept="image/*" 
                  multiple 
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {selectedFiles.length === 0 ? (
                  <div className="dropzone-inner" id="dropzone-placeholder">
                    <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p style={{ margin: '8px 0 2px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>Click to upload or drag photos here</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP • Up to 3 images • 5MB each</p>
                  </div>
                ) : (
                  <div id="complaint-image-previews" className="complaint-image-previews" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                    {selectedFiles.map((fileObj, i) => (
                      <div key={i} className="complaint-img-thumb" style={{ position: 'relative' }}>
                        <img 
                          src={fileObj.previewUrl} 
                          alt={`Preview ${i + 1}`} 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--border-color)', display: 'block' }}
                        />
                        <button 
                          type="button" 
                          className="remove-img-btn" 
                          title="Remove" 
                          style={{ position: 'absolute', top: '-7px', right: '-7px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          onClick={(e) => handleRemoveFile(i, e)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {selectedFiles.length < 3 && (
                      <div 
                        className="add-more-thumb" 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                        title="Add more" 
                        style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px', gap: '4px' }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '10px', fontWeight: 700 }}>Submit Complaint</button>
          </form>
        </div>
      )}

      {/* Submitted Complaints List */}
      <div className="dashboard-panel" style={{ gridColumn: role ? 'span 2' : undefined }}>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <h2 className="panel-title">{ICONS.alert} {role ? 'All Student Complaints' : 'Submitted Complaints'}</h2>
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>{complaints.length} Total</span>
        </div>
        
        <div className="complaints-list" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
          {complaints.length === 0 ? (
            <div className="empty-state">
              {ICONS.check}
              <p>No complaints reported. Everything is running smoothly!</p>
            </div>
          ) : (
            [...complaints].reverse().map((c) => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span className="badge" style={{ background: '#f3f4f6', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 700, marginBottom: '4px', display: 'inline-block', textTransform: 'uppercase' }}>
                      {c.category}
                    </span>
                    <h4 style={{ margin: '2px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.subject}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {role ? `Reported by ${c.studentName} (${c.studentRoom}) • ` : ''}
                      {c.id} • Reported on {formatDisplayDate(c.dateReported)}
                    </span>
                  </div>
                  <span className={`badge ${c.status.toLowerCase() === 'pending' ? 'pending' : 'approved'}`} style={{ fontSize: '11px', padding: '4px 8px', flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
                  "{c.details}"
                </p>
                {c.attachments && c.attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    {c.attachments.map((filename, index) => (
                      <span key={index} style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        📎 {filename}
                      </span>
                    ))}
                  </div>
                )}
                {c.response && (
                  <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '12.5px', color: '#334155' }}>
                    <strong>Response:</strong> "{c.response}"
                  </div>
                )}
                {c.status.toLowerCase() === 'pending' && role && role !== 'warden' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Respond &amp; Resolve Ticket</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Write your response to the student..."
                        value={responseTexts[c.id] || ''}
                        onChange={(e) => setResponseTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                        style={{ height: '60px', padding: '8px', fontSize: '12.5px' }}
                      />
                    </div>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px', alignSelf: 'flex-end', cursor: 'pointer', fontWeight: 600, marginTop: '2px' }}
                      onClick={() => handleResolve(c.studentId, c.id)}
                    >
                      Send Response &amp; Resolve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsSection;
