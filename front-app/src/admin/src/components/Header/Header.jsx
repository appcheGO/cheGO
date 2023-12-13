// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Iconify from '../../components/iconify';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import TableBarIcon from '@mui/icons-material/TableBar';
import LogoutIcon from '@mui/icons-material/Logout';
import app from '../../../../Firebase/firebase';
import { getAuth } from 'firebase/auth';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const renderContent = (
    <>
      <IconButton
        sx={{ mr: 1, color: '#40545D' }}
        onClick={toggleDrawer}
      >
        <Iconify icon="eva:menu-2-fill" />
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      ></Stack>
    </>
  );

  const handleNavigateTable = () => {
    navigate('/admin/mesas');
  };
  const handleNavigateDElivery = () => {
    navigate('/admin/dashboard');
  };

  const singnOut = () => {
    const auth = getAuth(app);
    auth.signOut().then(
      () => {
        localStorage.clear();
        navigate('/admin');
        console.log('signed out');
      },
      (error) => {
        console.log(error, 'error');
      }
    );
  };

  return (
    <>
      <AppBar
        className="box-shadow"
        sx={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
        <Toolbar sx={{ height: 1, px: { lg: 5 } }}>
          {renderContent}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{
            width: 250,
            height: '100%',
            backgroundColor: '#47555F',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'start',
              pl: 2,
              height: '4rem',
            }}
          >
            <img
              style={{
                width: '95%',
                height: '90%',
                objectFit: 'contain',
                borderRadius: '7px',
              }}
              src="https://img.freepik.com/vetores-premium/modelo-de-logo-de-taco-logotipo-de-emblema-de-comida-de-taco_664675-608.jpg"
              alt="LOGOMARCA"
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContentert: 'space-evenly',
              mt: 3,
              pl: 2,
              gap: 1,
              height: '20%',
            }}
          >
            <Button
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                backgroundColor: '#1E2C39',
                gap: 2,
                width: '95%',
                color: '#FFFFFF',
                textTransform: 'capitalize',
                '&:hover': {
                  backgroundColor: '#1E2C39',
                },
              }}
              onClick={handleNavigateDElivery}
            >
              <DeliveryDiningIcon />
              Entrega
            </Button>
            <Button
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                backgroundColor: '#1E2C39',
                gap: 2,
                width: '95%',
                color: '#FFFFFF',
                textTransform: 'capitalize',
                '&:hover': {
                  backgroundColor: '#1E2C39',
                },
              }}
              onClick={handleNavigateTable}
            >
              <TableBarIcon />
              Mesas
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContentert: 'space-evenly',
              pl: 2,
              gap: 1,
              height: 'auto',
              position: 'absolute',
              width: ' 100%',
              bottom: '2rem',
            }}
          >
            <NavLink
              className="click "
              to="https://api.whatsapp.com/send?phone=5585987920129&text=Ol%C3%A1%2C++gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+o+seu+sistema"
              style={{
                textDecoration: 'none',
                width: '100%',
              }}
            >
              <Button
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'start',
                  backgroundColor: '#1E2C39',
                  width: '95%',
                  color: '#FFFFFF',
                  gap: 2,
                  textTransform: 'capitalize',
                  '&:hover': {
                    backgroundColor: '#1E2C39',
                  },
                }}
              >
                <WhatsAppIcon />
                Suporte
              </Button>
            </NavLink>

            <Button
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                backgroundColor: '#1E2C39',
                width: '95%',
                color: '#FFFFFF',
                gap: 2,
                textTransform: 'capitalize',
                '&:hover': {
                  backgroundColor: '#1E2C39',
                },
              }}
              onClick={singnOut}
            >
              <LogoutIcon />
              Sair
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
