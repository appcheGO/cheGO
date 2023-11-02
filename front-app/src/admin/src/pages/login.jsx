/* eslint-disable react/prop-types */
// import { Helmet } from 'react-helmet-async';

import { Container } from '@mui/material';

import { LoginView } from '../sections/login';

export default function LoginPage() {
  return (
    <>
      {/* <Helmet>
        <title> Login | Minimal UI </title>
      </Helmet> */}

      <Container sx={{ height: '100vh' }}>
        <LoginView />
      </Container>
    </>
  );
}
