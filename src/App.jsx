import { useRef, useState } from 'react'
import { Box, Button, Chip, Stack, TextField } from "@mui/material";
import './App.css'
import { useAuth } from './hooks/AuthContext';

const BASE_URL = 'http://localhost:8888';

export default function App() {

  const { userSession, isLoading, login, checkSession, logout } = useAuth();

  const BLANK_CREDENTIALS = {
    username: '', password: ''
  };

  // 1. Setup state to store form values
  const [credentials, setCredentials] = useState(BLANK_CREDENTIALS);

  // 2. Update state when user types
  const handleTextInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const inputElement = useRef(null);

  const postSession = async (event) => {
    event.preventDefault(); // Prevents the page from refreshing

    // check both username and password are present
    if (credentials.username.length === 0 || credentials.password.length === 0) {
      // setError('Submit a username and password');
      console.info('Submit a username and password');
      return;
    }

    try {
      const body = JSON.stringify({ user: credentials.username, password: credentials.password });
      const postResponse = await fetch(`${BASE_URL}/session`, {
        method: "POST",
        body: body,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      console.debug(`POST session response: ${postResponse.status}`);

      if (postResponse.ok) {
        const data = await postResponse.json();
        console.debug(`POST session user: ${JSON.stringify(data)}`);
        login({ user: data.user }); // via AuthProvider
      } else {
        console.info('Login failed!');
      }
    } catch (error) {
      // setError('Authentication error');
      console.error('Caught error in postSession: ', error);
    }

    setCredentials(BLANK_CREDENTIALS);
    if (inputElement.current) {
      inputElement.current.focus();
    }
  };

  return (
    <>
      <Stack>
        <p>Current user = {userSession?.user}</p>
        <Box sx={{ tp: 2, pb: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={postSession} // Triggers on Button click OR Enter key
          >

            <TextField
              name="username" // Matches state key
              inputRef={inputElement}
              value={credentials.username}
              onChange={handleTextInputChange}
              label="Username"
              variant="outlined"
              size="small" // Ensures a compact height
              sx={{ width: '200px' }}
              slotProps={{
                htmlInput: {
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: 'false',
                },
              }}
            />

            <TextField
              name="password" // Matches state key
              label="Password"
              type="password"
              variant="outlined"
              size="small" // Matches the username field
              value={credentials.password}
              onChange={handleTextInputChange}
              sx={{ width: '200px' }}
            />

            <Button
              variant="outlined" // Changes the style to a simple outline
              sx={{
                height: '40px',   // Matches the 'small' TextField height exactly
                px: 3,            // Adds horizontal padding inside the button
                borderWidth: '1px',
                '&:hover': {
                  borderWidth: '1px', // Prevents the border from thickening on hover
                }
              }}
              type="submit" // Crucial for Enter key support
            >Login</Button>
          </Stack>
        </Box>
        <p>
          <Button
            variant="outlined"
            sx={{
              height: '40px',
              px: 3,
              borderWidth: '1px',
              '&:hover': {
                borderWidth: '1px',
              }
            }}
            onClick={checkSession}>Check Session</Button>
        </p>
        <p>
          <Button
            variant="outlined"
            sx={{
              height: '40px',
              px: 3,
              borderWidth: '1px',
              '&:hover': {
                borderWidth: '1px',
              }
            }}
            onClick={logout}>Log Out</Button>
        </p>
      </Stack>
    </>
  )
}
