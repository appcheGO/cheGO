import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { Link, useNavigate } from 'react-router-dom';
import app from '../../../../Firebase/firebase';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup
  .object({
    email: yup
      .string()
      .required('Email é obrigatório')
      .email('Email inválido'),
    password: yup.string().required('Senha é obrigatória'),
  })
  .required();

export default function Login() {
  const auth = getAuth(app);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const { email, password } = data;
    // const auth = getAuth();

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      // eslint-disable-next-line no-unused-vars
      const user = userCredential.user;
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      setApiError(
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    }
  };

  return (
    <Container
      sx={{
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid
        container
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',

            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#f46c26',
              fontSize: '22px',
              fontWeight: 600,
            }}
          >
            Painel Admin
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#f46c26',
              fontSize: '32px',
              fontWeight: 600,
            }}
          >
            Login
          </Typography>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'grid',
              gap: '50px',
              p: '0 20px 0 20px',
            }}
          >
            <TextField
              type="email"
              label="Email"
              variant="standard"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              type="password"
              label="Senha"
              variant="standard"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Grid>
          <Grid
            container
            width="100%"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: '10px',
            }}
          >
            <Grid item xs={6}>
              <Typography
                sx={{
                  textAlign: 'center',
                }}
              >
                <Link
                  to="#"
                  style={{ textDecoration: 'none' }}
                >
                  Esqueceu a senha?
                </Link>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: '50px',
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: '200px',
                  height: '50px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                Entrar
              </Button>
            </Grid>
          </Grid>
        </form>

        {apiError && (
          <Typography
            color="error"
            sx={{ textAlign: 'center', mt: 2 }}
          >
            {apiError}
          </Typography>
        )}
      </Grid>
    </Container>
  );
}
