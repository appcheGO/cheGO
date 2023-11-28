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
import { Tables } from './admin/src/pages/Tables/Tables.jsx';
import HomeDashboard from './admin/src/pages/HomeDashboard/HomeDashboard.jsx';
import Login from './admin/src/pages/Login/Login.jsx';

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
        element: <Login />,
      },
      {
        path: 'dashboard',
        element: <HomeDashboard />,
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
