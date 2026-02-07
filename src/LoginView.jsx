import { useRef, useState, useEffect } from 'react'
import { 
  Box, 
  Button, 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  Link, 
  Typography, 
  Container, 
  Paper,
  Stack 
} from "@mui/material";
import { useAuth } from './hooks/AuthContext';
import { postSession, UnauthorizedError } from './data/api';
import { useLocation, useNavigate } from 'react-router';
import { useMessaging } from './hooks/MessagingContext';

export default function LoginView() {

  // AuthProvider context 
  const { userSession, updateUserSession } = useAuth();

  // ErrorProvider context
  const { setMessage } = useMessaging();

  // navigate to referrer
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the path from state, or default to the home page
  const from = location.state?.from || "/";

  // if user session already exists redirect
  useEffect(() => {
    if (userSession) {
      navigate(from, { replace: true });
    }
  }, [userSession, navigate, from]);

  const BLANK_CREDENTIALS = {
    username: '', password: '', rememberMe: false
  };

  // Setup state to store form values
  const [credentials, setCredentials] = useState(BLANK_CREDENTIALS);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when user types
  const handleTextInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const inputElement = useRef(null);

  const handleLogin = async (event) => {
    event.preventDefault();

    // check both username and password are present
    if (credentials.username.length === 0 || credentials.password.length === 0) {
      setMessage('Enter a username and password', 'info');
      return;
    }

    setIsLoading(true);
    try {
      const result = await postSession(credentials.username, credentials.password);
      if (result) {
        updateUserSession(result);
        navigate(from, { replace: true });
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setMessage('Authentication failed', 'error');
      } else {
        setMessage('Server error', 'error');
      }
    } finally {
      setIsLoading(false);
    }

    setCredentials(BLANK_CREDENTIALS);
    if (inputElement.current) {
      inputElement.current.focus();
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>

          {/* Login Form */}
          <Stack
            component="form"
            spacing={2}
            noValidate
            autoComplete="off"
            onSubmit={handleLogin}
          >
            <TextField
              fullWidth
              name="username"
              inputRef={inputElement}
              value={credentials.username}
              onChange={handleTextInputChange}
              label="Username or Email"
              variant="outlined"
              autoFocus
              disabled={isLoading}
              slotProps={{
                htmlInput: {
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: 'false',
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={credentials.password}
              onChange={handleTextInputChange}
              disabled={isLoading}
              autoComplete="current-password"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}