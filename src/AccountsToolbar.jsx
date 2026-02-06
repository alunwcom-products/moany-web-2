import { useRef, useState } from 'react';
import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  useGridApiContext,
} from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import { setAccount, UnauthorizedError } from './data/api';
import { useAuth } from './hooks/AuthContext';
import { useMessaging } from './hooks/MessagingContext';

export default function AccountsToolbar({ handleLoading }) {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  const apiRef = useGridApiContext();
  const [newPanelOpen, setNewPanelOpen] = useState(false);
  const newPanelTriggerRef = useRef(null);

  const handleClose = () => {
    setNewPanelOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const newRow = {
      uuid: uuidv4(),
      name: formData.get('name'),
      account_num: formData.get('account_num'),
      sortcode: formData.get('sortcode'),
      type: "DEBIT",
      active: true,
      earliest: new Date(0),
      latest: new Date(0),
      starting_balance: 0,
      latest_balance: 0,
    };

    apiRef.current.updateRows([
      newRow
    ]);

    try {
      handleLoading(true);
      await setAccount(newRow);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // user needs to login
        logout();
      } else {
        // other error
        throw error;
      }
    } finally {
      handleLoading(false);
      handleClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Toolbar>
      <Tooltip title="Add new account">
        <ToolbarButton
          ref={newPanelTriggerRef}
          aria-describedby="new-panel"
          onClick={() => setNewPanelOpen((prev) => !prev)}
        >
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      <Popper
        open={newPanelOpen}
        anchorEl={newPanelTriggerRef.current}
        placement="bottom-end"
        id="new-panel"
        onKeyDown={handleKeyDown}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 300,
              p: 2,
            }}
            elevation={8}
          >
            <Typography fontWeight="bold">Add new account</Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  name="name"
                  size="small"
                  autoFocus
                  fullWidth
                  required
                />
                <TextField
                  label="Account Number"
                  //type="number"
                  name="account_num"
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Sort Code"
                  //type="number"
                  name="sortcode"
                  size="small"
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" fullWidth>
                  Add Account
                </Button>
              </Stack>
            </form>
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>
    </Toolbar>
  );
}