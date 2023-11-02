import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import Home from './pages/Home.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';
import Order from './pages/Order.jsx';
import OrdersWithoutRegistration from './pages/OrdersWithoutRegistration.jsx';

import AdminLoginPage from '../../material-kit-react/src/pages/login.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/cadastro',
        element: <RegisterScreen />,
      },
      {
        path: '/pedido',
        element: <Order />,
      },
      {
        path: '/pedidosemcadastro',
        element: <OrdersWithoutRegistration />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
