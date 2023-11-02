import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './app.css';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import { CarrinhoProvider } from './context/useCarrinho';

export default function App() {
  return (
    <Container id="app" maxWidth="sm">
      <CarrinhoProvider>
        <Outlet />
      </CarrinhoProvider>
    </Container>
  );
}
