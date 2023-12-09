// PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/admin/dashboard" replace />
  );
};

export default PrivateRoute;
