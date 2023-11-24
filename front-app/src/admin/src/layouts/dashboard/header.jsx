// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Iconify from '../../components/iconify';
import AccountPopover from './common/account-popover';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Typography } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const renderContent = (
    <>
      <IconButton sx={{ mr: 1 }} onClick={toggleDrawer}>
        <Iconify icon="eva:menu-2-fill" />
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <AccountPopover />
      </Stack>
    </>
  );

  const handleNavigateTable = () => {
    navigate('/admin/mesas');
    console.log('cliquei aqui');
  };

  return (
    <>
      <AppBar
        className="box-shadow"
        sx={{ width: '100%', backgroundColor: '#fff' }}
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
            backgroundColor: '#F9E9DF',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid black',
              height: '4rem',
            }}
          >
            <Typography variant="h6">LOGO</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              borderBottom: '1px solid black',
              height: '20%',
            }}
          >
            <Button>
              <Typography
                variant="h6"
                sx={{ color: 'black' }}
              >
                Entrega
              </Typography>
            </Button>
            <Button onClick={handleNavigateTable}>
              <Typography
                variant="h6"
                sx={{ color: 'black' }}
              >
                Mesas
              </Typography>
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              borderBottom: '1px solid black',
              height: '8rem',
            }}
          >
            <Typography variant="h6">
              Contato com o suporte
            </Typography>
            <NavLink
              className="click "
              to="https://api.whatsapp.com/send?phone=5585987920129&text=Ol%C3%A1%2C++gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+o+seu+sistema"
              style={{ textDecoration: 'none' }}
            >
              <Box
                className="box-shadow"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'green',
                  borderRadius: '5rem',
                  width: '10rem',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '100%',
                    width: '100%',
                    color: 'white',
                  }}
                >
                  whatsapp
                  <WhatsAppIcon />
                </Typography>
              </Box>
            </NavLink>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
