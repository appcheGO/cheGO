/* eslint-disable react/jsx-no-undef */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RegisterScreen from "./pages/RegisterScreen.jsx";
import Order from "./pages/Order.jsx";
import OrdersWithoutRegistration from "./pages/OrdersWithoutRegistration.jsx";
import LoginPage from "../src/admin/src/pages/login.jsx";
import AppPage from "./admin/src/pages/app.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/cadastro",
        element: <RegisterScreen />,
      },
      {
        path: "/pedido",
        element: <Order />,
      },
      {
        path: "/pedidosemcadastro",
        element: <OrdersWithoutRegistration />,
      },
      {
        path: "/admin",
        element: <Outlet />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "dashboard",
            element: <AppPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
