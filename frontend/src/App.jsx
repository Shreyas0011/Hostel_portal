// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from './routes/routeConstants';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute, { getDashboardRedirect } from './routes/RoleRoute';
import { removeToast } from './redux/notification/notificationSlice';

// Import Pages
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import WardenDashboard from './pages/warden/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import MessManagerDashboard from './pages/messManager/Dashboard';

function App() {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.notification.toasts);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Auto-dismiss toasts after 4 seconds.
  // Collect all timers so they can all be cleared if toasts changes before 4 s.
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => dispatch(removeToast(toast.id)), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <>
      <Routes>
        {/* Root Redirect */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={getDashboardRedirect(user.role)} replace />
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          }
        />

        {/* Login Route */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated && user ? (
              <Navigate to={getDashboardRedirect(user.role)} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Role-Based Protected Routes */}
        <Route
          path={ROUTES.STUDENT}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PARENT}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['Parent']}>
                <ParentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.WARDEN}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['Warden']}>
                <WardenDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SUPERADMIN}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['SuperAdmin']}>
                <SuperAdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MESS_MANAGER}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['MessManager']}>
                <MessManagerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Catch All Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Container */}
      <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type} active`}
            style={{ cursor: 'pointer', marginBottom: '10px' }}
            onClick={() => dispatch(removeToast(toast.id))}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
