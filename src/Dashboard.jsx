import { useEffect, useState } from 'react';
import { Alert, AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Snackbar, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Logout } from "@mui/icons-material";
import { Link, Outlet } from 'react-router';
import { useAuth } from './hooks/AuthContext';

export default function Dashboard() {

  const { userSession, isLoading, updateUserSession, checkSession, logout } = useAuth();

  // const handleCloseError = () => {
  //   console.debug('Error closed.');
  //   // setError(false);
  // }

  // const handleLogout = () => {

  //   // handleLoginChange({});
  //   // handleDrawerClose();
  //   // navigate("/");
  // }

  // menu/drawer state
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const drawerWidth = 240;

  const mainMenu = [
    { key: 'summary', label: 'Summary', link: '/summary' },
    { key: 'accounts', label: 'Accounts', link: '/accounts' },
    { key: 'transactions', label: 'Transactions', link: '/transactions' },
    { key: 'upload', label: 'Statement Upload', link: '/upload' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Moany
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerClose}>
            <MenuOpenIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {mainMenu.map((item) => {
            return (
              <ListItem key={item.key} disablePadding>
                <ListItemButton component={Link} to={item.link} onClick={handleDrawerClose}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    // Explicitly handle the hover state
                    '&:hover': {
                      color: 'inherit',
                      textDecoration: 'none',
                    }
                  }}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
        <Divider />
        <List>
          {['Logout'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemText primary={text} />
                <Logout />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Outlet />
    </Box>
  )
}
