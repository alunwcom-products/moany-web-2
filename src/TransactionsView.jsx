import { useState, useEffect } from 'react';
import { ColumnsPanelTrigger, DataGrid, Toolbar, ToolbarButton } from '@mui/x-data-grid';
import { TextField, MenuItem, Box, Stack, Typography, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getAccountSummary, getCategories, getTransactions, setTransaction, UnauthorizedError } from './data/api';
import AddIcon from '@mui/icons-material/Add';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useAuth } from './hooks/AuthContext';
import { useMessaging } from './hooks/MessagingContext';

export default function TransactionView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // State for data and loading
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for pagination (MUI default format)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // State for our custom filters
  const [filters, setFilters] = useState({
    account: '',
    startDate: '',
    endDate: '',
  });

  const handleFilterUpdate = (obj) => {
    // reset page when updating the filters
    setPaginationModel(value => ({ ...value, page: 0 }));
    setFilters((value) => ({ ...value, ...obj }));
  }

  // dialog
  const [open, setOpen] = useState(false); // Controls the Popup

  const INITIAL_FORM_STATE = {
    account: '',
    category: '',
    trans_date: new Date().toISOString().split('T')[0], // Reset to today
    net_amount: '',
    description: '',
    comment: '',
    source_type: 'MANUAL',
  };

  // --- Form State ---
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleAddNew = () => {
    setFormData(INITIAL_FORM_STATE);
    setOpen(true);
  };

  // 2. Handle Form Submission
  const handleSubmit = async () => {
    try {
      console.log("Saving Transaction:", formData);
      // await api.post('/transactions', formData);
      const transaction = await setTransaction(formData);
      console.log("New transaction:", transaction);

      setOpen(false);
      // Optional: Refresh the grid data here
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch accounts for the dropdown on component mount, and look-up on transaction data
  useEffect(() => {
    console.info(`useEffect() [accounts]`);
    const loadAccounts = async () => {
      try {
        // Replace with: const data = await yourApi.getAccounts();
        const accounts = await getAccountSummary();
        setAccounts(accounts.results);
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };
    loadAccounts();
  }, []);

  // Fetch categories for look-up on transaction data.
  useEffect(() => {
    console.info(`useEffect() [categories]`);
    const loadCategories = async () => {
      try {
        const categories = await getCategories();
        setCategories(categories.results);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // Main Effect: Re-run whenever pagination or filters change
  useEffect(() => {
    console.info(`useEffect()`);

    let active = true;
    setLoading(true);

    const loadData = async () => {
      console.info('loadData()');

      const { page, pageSize } = paginationModel;

      // Map state to your API parameters (limit/offset)
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
        ...(filters.account && { account: filters.account }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      try {

        const response = await getTransactions(params.toString());

        // const BASE_URL = import.meta.env.VITE_API_ENDPOINT;
        // const response = await fetch(`${BASE_URL}/transactions?${params}`);
        // const json = await response.json();
        console.log("Fetching API with:", params.toString());

        if (active) {
          setRows(response.results);
          setRowCount(response.totalCount);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [paginationModel, filters]);

  const customToolbar = () => {
    return (
      <Toolbar>
        <Tooltip title="Add new transaction">
          <ToolbarButton
            aria-describedby="new-panel"
            onClick={() => handleAddNew()}
          >
            <AddIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>

        <Tooltip title="Columns">
          <ColumnsPanelTrigger render={<ToolbarButton />}>
            <ViewColumnIcon fontSize="small" />
          </ColumnsPanelTrigger>
        </Tooltip>
      </Toolbar>
    );
  };


  // TODO common code - factor out
  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  const currencyFormat = (value) => {
    if (!value) return value;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  const dateFormat = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-GB', {
      dateStyle: 'short'
    })
  };

  const dateTimeFormat = (value) => {
    const date = new Date(value);
    return date.toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'long'
    })
  };

  const isoDateFormat = (value) => {
    const date = new Date(value);
    return date.toISOString();
  };

  const rowUpdate = async (updatedRow, originalRow) => {

    console.log(updatedRow);

    try {
      // handleLoading(true);
      const transaction = await setTransaction(updatedRow);
      return transaction;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // user needs to login
        logout();
      } else {
        // other error
        throw error;
      }
    } finally {
      // handleLoading(false);
    }
  };

  const errorHandler = (error) => {
    console.error('Row update error: ', error);
    setMessage('Row update error', 'error');
  };

  const columns = [
    {
      field: 'uuid', cellClassName: 'ro' // TODO 
    },
    {
      field: 'trans_date', headerName: 'Transaction Date', width: 130, type: 'date', editable: true,
      valueFormatter: dateFormat,
      valueSetter: (value, row) => {
        const dateValue = value;

        // console.log(`${JSON.stringify(params)} -> ${value}`);

        // Convert the JS Date back to a simple string
        const formattedDate = dateValue ? new Date(dateValue).toISOString().split('T')[0] : null;
        return { ...row, ['trans_date']: formattedDate };
      },
    },
    { field: 'entry_date', headerName: 'Entry Date', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
    {
      field: 'account', headerName: 'Account', width: 230, editable: true, type: 'singleSelect',
      valueOptions: accounts.map((acc) => ({
        value: acc.uuid,
        label: acc.name,
      })),
      valueFormatter: (value) => {
        const acc = accounts.find((a) => a.uuid === value);
        return acc ? acc.name : '';
      },
    },
    {
      field: 'source_type', headerName: 'Src. Type', width: 50, cellClassName: 'ro',
      valueGetter: (value) => {
        return value[0]; // first character
      }
    },
    { field: 'source_name', headerName: 'Src. Name', width: 270, cellClassName: 'ro', },
    { field: 'source_row', headerName: 'Src. Row', width: 50, type: 'number', cellClassName: 'ro', },
    { field: 'type', headerName: 'Type', width: 100, editable: true },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 320, editable: true },
    { field: 'comment', headerName: 'Comment', flex: 1, minWidth: 200, editable: true },
    {
      field: 'net_amount', headerName: 'Amount', width: 140,
      type: 'number', editable: true, valueFormatter: currencyFormat,
    },
    { field: 'statement_amount', headerName: 'Stmt. Amount', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    { field: 'account_balance', headerName: 'Account Balance', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    { field: 'statement_balance', headerName: 'Statement Balance', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    {
      field: 'category', headerName: 'Category', flex: 1, minWidth: 290, type: 'singleSelect', editable: true,
      valueOptions: categories.map((cat) => ({
        value: cat.uuid,
        label: cat.name,
      })),
      valueFormatter: (value) => {
        const cat = categories.find((cat) => cat.uuid === value);
        return cat ? cat.name : '';
      },
    },
    { field: 'created', headerName: 'Created', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
    { field: 'modified', headerName: 'Last Modified', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
  ];

  const initialState = {
    columns: {
      columnVisibilityModel: {
        uuid: false,
        entry_date: false,
        statement_amount: false,
        statement_balance: false,
        type: false,
        comment: false,
        source_type: false,
        source_name: false,
        source_row: false,
        created: false,
        modified: false,
      },
    },
  };

  return (
    <Box style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom >Transactions</Typography>
      {/* External Filter UI */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="Account"
          size="small"
          value={filters.account}
          onChange={(e) => handleFilterUpdate({ account: e.target.value })}
          sx={{ width: 220 }}
        >
          <MenuItem value="">All Accounts</MenuItem>
          {accounts.map(acc => (
            <MenuItem key={acc.uuid} value={acc.uuid}>{acc.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Start Date"
          size="small"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => handleFilterUpdate({ startDate: e.target.value })}
        />

        <TextField
          type="date"
          label="End Date"
          size="small"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => handleFilterUpdate({ endDate: e.target.value })}
        />
      </Stack>

      <DataGrid
        rows={rows}
        rowCount={rowCount}
        getRowId={(row) => row.uuid}
        density='compact'
        columns={columns}
        initialState={initialState}
        loading={loading}
        editMode='row'
        paginationMode="server"
        slotProps={{
          basePagination: {
            showFirstButton: true,
            showLastButton: true,
          },
        }}
        // disable both column sorting and filtering
        // this would need to be handled server-side to be useful
        disableColumnSorting
        disableColumnFilter
        //sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        //sortModel={sortModel}
        //onSortModelChange={(newModel) => setSortModel(newModel)}
        showToolbar
        slots={{ toolbar: customToolbar }}
        disableRowSelectionOnClick
        processRowUpdate={(updatedRow, originalRow) => rowUpdate(updatedRow, originalRow)}
        onProcessRowUpdateError={errorHandler}
        sx={{
          '& .ro': { // read-only className
            backgroundColor: '#f9f9f9ff', // Light grey background
            //color: '#818181',           // Muted text color
            //cursor: 'not-allowed',      // Changes the mouse pointer
          }
        }}
      />


      {/* --- ADD TRANSACTION MODAL --- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>

            <TextField
              select
              label="Select Account"
              name="account"
              value={formData.account}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {accounts.map((acc) => (
                <MenuItem key={acc.uuid} value={acc.uuid}>
                  {acc.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.uuid} value={cat.uuid}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Transaction Date"
              name="trans_date"
              value={formData.trans_date}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Amount"
              name="net_amount"
              type="number"
              value={formData.net_amount}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              fullWidth
              size="small"
            />

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save Transaction</Button>
        </DialogActions>
      </Dialog>




    </Box>
  );
}
