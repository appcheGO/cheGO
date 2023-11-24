/* eslint-disable react/jsx-no-undef */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import Home from './pages/Home.jsx';
import Order from './pages/Order.jsx';
import LoginPage from '../src/admin/src/pages/login.jsx';
import AppPage from './admin/src/pages/app.jsx';
import { Tables } from './admin/src/pages/Tables/Tables.jsx';

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
        path: 'dashboard',
        element: <AppPage />,
      },
      {
        path: 'mesas',
        element: <Tables />,
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
