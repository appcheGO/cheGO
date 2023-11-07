import { Route } from 'react-router-dom';
import LoginPage from '../src/admin/src/pages/login';

function AdminRoutes() {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />
    </>
  );
}

export default AdminRoutes;
