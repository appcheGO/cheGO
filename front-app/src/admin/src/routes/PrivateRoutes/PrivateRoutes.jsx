import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Box, Typography } from "@mui/material";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? (
    element
  ) : (
    <>
      <Navigate
        to="/admin/dashboard"
        replace
        state={{ from: "/admin/dashboard" }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <iframe
          style={{ background: "transparent", border: "none" }}
          src="https://lottie.host/embed/be8c408a-8bb9-4a32-8f6c-18b187f93537/lkP3AyFrmS.json"
        ></iframe>

        <Typography variant="h2">Página não autorizada</Typography>
        <Typography variant="h6">
          Você precisa fazer login para acessar esta página.
        </Typography>
      </Box>
    </>
  );
};

export default PrivateRoute;
