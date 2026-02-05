import { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { MessagingContext } from './hooks/MessagingContext';

export const MessagingProvider = ({ children }) => {

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
    setSnackPack((prev) => [...prev, { message, severity: (severity ? severity : 'info'), key: uuidv4() }]);
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
      <MessagingContext.Provider value={{ setMessage }}>
        {children}
      </MessagingContext.Provider>

      <div>
        <Snackbar
          key={messageInfo?.key}
          open={open}
          autoHideDuration={5000}
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
