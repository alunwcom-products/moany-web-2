import { useState } from 'react';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Snackbar, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Logout } from "@mui/icons-material";
import { Link, Outlet } from 'react-router';
import { useAuth } from './hooks/AuthContext';
import { useError } from './hooks/ErrorContext';
import ProfileIcon from './ProfileIcon';

export default function Dashboard() {

  // AuthProvider context 
  const { userSession, isLoading, updateUserSession, checkSession, logout } = useAuth();

  const { setMessage } = useError();

  // menu/drawer state
  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // profile menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileRefresh = () => {
    checkSession();
    setAnchorEl(null);
  };
  const handleProfileLogout = () => {
    logout();
    setMessage('Logged out', 'info');
    setAnchorEl(null);
  };
  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const drawerWidth = 240;

  const mainMenu = [
    { key: 'summary', label: 'Summary', link: '/' },
    { key: 'accounts', label: 'Accounts', link: '/accounts' },
    { key: 'transactions', label: 'Transactions', link: '/transactions' },
    { key: 'upload', label: 'Statement Upload', link: '/upload' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
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

          <Typography variant="h6" component="div" align="left" sx={{ flexGrow: 1 }}>
            Moany
          </Typography>

          {userSession?.user && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                color="inherit"
              >
                <ProfileIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleProfileClose}
              >
                <MenuItem sx={{
                  pointerEvents: 'none', // Disables click and hover states
                  fontWeight: 'bold',    // Optional: make it look like a header
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}>Logged in as {userSession.user}</MenuItem>
                <MenuItem sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
                  onClick={handleProfileRefresh}>Refresh session</MenuItem>
                <Divider />
                <MenuItem sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
                  onClick={handleProfileLogout}>Log out <Logout fontSize='small' sx={{ ml: 1 }} /></MenuItem>
              </Menu>
            </div>
          )}

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
        open={open}
        onClose={handleDrawerClose}
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
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
