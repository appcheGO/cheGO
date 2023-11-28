import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { bgGradient } from '../../theme/css';
import Iconify from '../../components/iconify';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { useNavigate } from 'react-router-dom';
import app from '../../../../Firebase/firebase';

const auth = getAuth(app);

export default function Login() {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro de autenticação:', error);
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField
          sx={{
            '& div:first-of-type': {
              height: 'auto !important',
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
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  edge="end"
                >
                  <Iconify
                    icon={
                      showPassword
                        ? 'eva:eye-fill'
                        : 'eva:eye-off-fill'
                    }
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
    <Container sx={{ height: '100vh' }}>
      <Box
        sx={{
          ...bgGradient({
            color: alpha(
              theme.palette.background.default,
              0.9
            ),
            imgUrl: '/assets/background/overlay_4.jpg',
          }),
          height: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: 1, width: '90%' }}
        >
          <Card
            className="box-shadow"
            sx={{
              p: 5,
              width: 1,
              maxWidth: 420,
              backgroundColor: '#fae9de',
            }}
          >
            <Typography
              variant="h4"
              sx={{ textAlign: 'center', mb: 2 }}
            >
              Login
            </Typography>

            {renderForm}
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
