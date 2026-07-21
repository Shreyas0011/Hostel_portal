// src/routes/RoleRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from './routeConstants';

export const getDashboardRedirect = (role) => {
  switch (role) {
    case 'Student': return ROUTES.STUDENT;
    case 'Parent': return ROUTES.PARENT;
    case 'Warden': return ROUTES.WARDEN;
    case 'Admin': return ROUTES.ADMIN;
    case 'SuperAdmin': return ROUTES.SUPERADMIN;
    case 'MessManager': return ROUTES.MESS_MANAGER;
    default: return ROUTES.LOGIN;
  }
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRedirect(user.role)} replace />;
  }

  return children;
};

export default RoleRoute;
