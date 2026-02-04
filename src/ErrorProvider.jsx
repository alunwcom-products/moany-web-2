import { useState, useEffect } from 'react';
import { ErrorContext } from './hooks/ErrorContext';
import { Alert, Button, Snackbar } from '@mui/material';

export const ErrorProvider = ({ children }) => {

  const [snackPack, setSnackPack] = useState([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  // severity can be error, warning, info, or success.
  const setMessage = (message, severity) => {
    setSnackPack((prev) => [...prev, { message, severity: (severity ? severity : 'info'), key: new Date().getTime() }]);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <>
      <ErrorContext.Provider value={{ setMessage }}>
        {children}
      </ErrorContext.Provider>

      <div>
        <Snackbar
          key={messageInfo?.key}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          slotProps={{ transition: { onExited: handleExited } }}
        >
          <Alert severity={messageInfo?.severity} variant="standard" sx={{ width: '100%' }}>
            {messageInfo?.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};
