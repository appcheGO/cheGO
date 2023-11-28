/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  Outlet,
  Route,
  Routes,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom';
import Home from './pages/Home.jsx';
import Order from './pages/Order.jsx';
import LoginPage from '../src/admin/src/pages/login.jsx';
import { Tables } from './admin/src/pages/Tables/Tables.jsx';
import {
  auth,
  onAuthStateChanged,
} from './Firebase/firebase.js';
import AppView from './admin/src/sections/overview/view/app-view.jsx';

// eslint-disable-next-line react-refresh/only-export-components
const PrivateRoute = ({ element: Element, ...rest }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser) => {
        setUser(authUser);

        if (!authUser) {
          navigate('/admin/login');
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route
        element={user ? <Element /> : null}
        {...rest}
      />
    </Routes>
  );
};

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/pedido',
        element: <Order />,
      },
    ],
  },
  {
    path: '/admin',
    element: <Outlet />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'dashboard/*',
        element: <PrivateRoute element={<AppView />} />,
      },
      {
        path: 'mesas',
        element: <PrivateRoute element={<Tables />} />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
