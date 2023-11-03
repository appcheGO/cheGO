import { useState } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";

import Logo from "../../components/logo";
import { bgGradient } from "../../theme/css";
import Iconify from "../../components/iconify";
import { useRouter } from "../../routes/hooks";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { LoadingButton } from '@mui/lab/LoadingButton';

// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAeEFkpZJQ_gw7GowD5SZlWl5XnJQLnXAQ",
  authDomain: "chego-delivery-app.firebaseapp.com",
  databaseURL: "https://chego-delivery-app-default-rtdb.firebaseio.com",
  projectId: "chego-delivery-app",
  storageBucket: "chego-delivery-app.appspot.com",
  messagingSenderId: "471857496315",
  appId: "1:471857496315:web:c1809f1b3659ad753d305e",
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
          name="email"
          label="Email address"
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

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ my: 3 }}
      >
        <Link variant="subtitle2" underline="hover">
          Esqueceu sua senha?
        </Link>
      </Stack>

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleLogin}
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
      }}
    >
      <Logo
        sx={{
          position: "fixed",
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Login Admin
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 2, mb: 5, textAlign: "center" }}
          >
            Ainda não possui uma conta?
            <Link variant="subtitle2" sx={{ ml: 0.5 }}>
              Crie aqui
            </Link>
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.grey[500], 0.16),
              }}
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" />
            </Button>

            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.grey[500], 0.16),
              }}
            >
              <Iconify icon="eva:facebook-fill" color="#1877F2" />
            </Button>

            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.grey[500], 0.16),
              }}
            >
              <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              OR
            </Typography>
          </Divider>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
