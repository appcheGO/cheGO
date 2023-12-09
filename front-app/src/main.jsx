// Seu ponto de entrada do aplicativo (exemplo)
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import routes from './routes/AppRoutes';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
