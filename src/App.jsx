import { useEffect, useRef, useState } from 'react'
import { Box, Button, Chip, Stack, TextField } from "@mui/material";
import './App.css'

const BASE_URL = 'http://localhost:8888';

export default function App() {

  const [session, setSession] = useState();

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
    // console.log('Login Submitted.');
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
        setSession({ user: data.user });
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

    // setCredentials((prevCredentials) => {
    //   prevCredentials.password = '';
    //   return prevCredentials;
    // });
  };

  const getSession = async () => {
    const getResponse = await fetch(`${BASE_URL}/session`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    console.debug(`GET session response: ${getResponse.status}`);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.debug(`GET session user: ${JSON.stringify(data)}`);
      setSession({ user: data.user });
    } else {
      setSession(null);
    }
  };

  const clearSession = async () => {
    const deleteResponse = await fetch(`${BASE_URL}/session`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    console.debug(`DELETE session response: ${deleteResponse.status}`);
    setSession(null);
  };

  useEffect(() => {
    console.info('useEffect()');
    getSession();
  }, []);

  return (
    <>
      <div>
        <p>Current user = {session?.user}</p>
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
        <p><button onClick={getSession}>CHECK SESSION</button></p>
        <p><button onClick={clearSession}>LOG OUT</button></p>

      </div>
    </>
  )
}
