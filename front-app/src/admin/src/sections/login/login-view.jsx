import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import { bgGradient } from "../../theme/css";
import Iconify from "../../components/iconify";
import { useRouter } from "../../routes/hooks";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { LoadingButton } from '@mui/lab/LoadingButton';

// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
  authDomain: "testeapp-666bc.firebaseapp.com",
  projectId: "testeapp-666bc",
  storageBucket: "testeapp-666bc.appspot.com",
  messagingSenderId: "273940847816",
  appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Erro de autenticação:", error);
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField
          sx={{
            "& div:first-of-type": {
              height: "auto !important",
            },
          }}
          name="email"
          label="Email "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: "/assets/background/overlay_4.jpg",
        }),
        height: 1,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: 1, width: "90%" }}
      >
        <Card
          className="box-shadow"
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
            backgroundColor: "#fae9de",
          }}
        >
          <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
            Login
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
