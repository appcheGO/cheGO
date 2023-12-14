// routes.js
import { Outlet } from "react-router-dom";
import Order from "./../pages/Order.jsx";
import PrivateRoute from "./../admin/src/routes/PrivateRoutes/PrivateRoutes";
import App from "./../App";
import Home from "./../pages/Home";
import { Tables } from "./../admin/src/pages/Tables/Tables";
import HomeDashboard from "./../admin/src/pages/HomeDashboard/HomeDashboard";
import Login from "./../admin/src/pages/Login/Login";

const AppRoutes = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "pedido", element: <Order /> },
    ],
  },
  {
    path: "/admin",
    element: <Outlet />,
    children: [
      { path: "", element: <Login /> },
      {
        path: "dashboard",
        element: <PrivateRoute element={<HomeDashboard />} />,
      },
      {
        path: "mesas",
        element: <PrivateRoute element={<Tables />} />,
      },
    ],
  },
];

export default AppRoutes;
