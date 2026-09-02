// src/routes/RoleRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from './routeConstants';

export const getDashboardRedirect = (role) => {
  if (!role) return ROUTES.LOGIN;
  const r = role.toLowerCase();
  switch (r) {
    case 'student': return ROUTES.STUDENT;
    case 'parent': return ROUTES.PARENT;
    case 'warden': return ROUTES.WARDEN;
    case 'admin': return ROUTES.ADMIN;
    case 'superadmin': return ROUTES.SUPERADMIN;
    case 'messmanager': return ROUTES.MESS_MANAGER;
    default: return ROUTES.LOGIN;
  }
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = (user.role || '').toLowerCase();
  const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);

  if (!isAllowed) {
    return <Navigate to={getDashboardRedirect(user.role)} replace />;
  }

  return children;
};

export default RoleRoute;
