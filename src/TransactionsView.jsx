import { useCallback, useState, useEffect, useMemo } from 'react';
import { ColumnsPanelTrigger, DataGrid, Toolbar, ToolbarButton } from '@mui/x-data-grid';
import { TextField, MenuItem, Box, Stack, Typography, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Chip, FormControlLabel, Checkbox } from '@mui/material';
import { getAccountSummary, getCategories, getTransactions, setTransaction } from './data/api';
import AddIcon from '@mui/icons-material/Add';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useAuth } from './hooks/AuthContext';
import { useMessaging } from './hooks/MessagingContext';
import lodash from 'lodash';
import { useSearchParams } from 'react-router';

const INITIAL_FORM_STATE = {
  account: '',
  category: '',
  trans_date: new Date().toISOString().split('T')[0], // Reset to today
  net_amount: '',
  description: '',
  comment: '',
  source_type: 'MANUAL',
};

const initialState = {
  columns: {
    columnVisibilityModel: {
      uuid: false,
      entry_date: false,
      statement_amount: false,
      statement_balance: false,
      type: false,
      source_type: false,
      source_name: false,
      source_row: false,
      created: false,
      modified: false,
    },
  },
};

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const currencyFormat = (value) => value == null ? '' : currencyFormatter.format(value);

const dateFormat = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', {
    dateStyle: 'short'
  })
};

const isoDateFormat = (value) => {
  const date = new Date(value);
  return date.toISOString();
};

export default function TransactionView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // state for data and loading
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // search params for url 'state'
  const [searchParams, setSearchParams] = useSearchParams();

  const paginationModel = {
    page: Math.max(0, parseInt(searchParams.get('page') || '1') - 1), // convert starting point from 1 to 0
    pageSize: parseInt(searchParams.get('pageSize') || '10'),
  };

  // handle API error
  const apiError = (message) => {
    setMessage(message ? message : 'API Error');
    logout();
  }

  const handlePaginationChange = (newModel) => {
    const newParams = new URLSearchParams(searchParams);

    newParams.set('page', (newModel.page + 1).toString()); // convert starting point from 0 to 1
    newParams.set('pageSize', newModel.pageSize.toString());

    setSearchParams(newParams);
  };

  // 1. Pull all values from the URL
  const filters = {
    account: searchParams.getAll('account'),
    category: searchParams.getAll('category'),
    childCats: searchParams.getAll('childCats'),
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  };

  const handleFilterUpdate = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    // Reset page to 1 whenever a filter is changed
    newParams.set('page', '1');

    if (Array.isArray(value)) {
      // Handle Multi-selects (Accounts/Categories)
      newParams.delete(key);
      value.forEach(item => newParams.append(key, item));
    } else if (value) {
      // Handle single values (Dates)
      newParams.set(key, value);
    } else {
      // Clean up the URL if the filter is cleared
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // dialog
  const [open, setOpen] = useState(false); // Controls the Popup

  // --- Form State ---
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleAddNewTransaction = () => {
    setFormData(INITIAL_FORM_STATE);
    setOpen(true);
  };

  // 2. Handle Form Submission
  const handleSubmit = async () => {
    try {
      await setTransaction(formData);
      setMessage('Transaction created', 'success');
      await loadData();
      setOpen(false);
    } catch (error) {
      console.error("Save failed", error);
      setMessage('Save failed', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch accounts for the dropdown on component mount, and look-up on transaction data
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // Replace with: const data = await yourApi.getAccounts();
        const accounts = await getAccountSummary();
        setAccounts(accounts.results);
      } catch (error) {
        apiError(error.message);
      }
    };
    loadAccounts();
  }, []);

  // Fetch categories for look-up on transaction data.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategories();
        setCategories(categories.results);
      } catch (error) {
        apiError(error.message);
      }
    };
    loadCategories();
  }, []);

  // cached function to reload data
  const loadData = useCallback(async () => {
    setLoading(true);
    const { page, pageSize } = paginationModel;

    if (Array.isArray(filters.category)) {
      const cats = filters.category.map((cat) => `category=${cat}`);
    }

    const params = new URLSearchParams({
      limit: pageSize.toString(),
      offset: (page * pageSize).toString(),
      ...(filters.account && { account: filters.account }),
      ...(filters.childCats && { childCats: filters.childCats }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    });

    if (Array.isArray(filters.category)) {
      filters.category.forEach(cat => params.append('category', cat));
    }

    try {
      const response = await getTransactions(params.toString());
      setRows(response.results || []);
      setRowCount(response.totalCount || 0);
    } catch (error) {
      apiError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // Depend on state that affects the query

  // Main Effect: Re-run whenever pagination or filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const rowUpdate = async (updatedRow, originalRow) => {

    if (lodash.isEqual(originalRow, updatedRow)) {
      setMessage('Row not changed', 'info');
      return originalRow;
    }

    try {
      const transaction = await setTransaction(updatedRow);
      setMessage('Row updated', 'success');

      // FIX: Update local state immediately so the grid doesn't feel "laggy"
      // and doesn't rely on a full page reload to show the change.
      setRows((prevRows) =>
        prevRows.map((row) => (row.uuid === transaction.uuid ? transaction : row))
      );

      return transaction;
    } catch (error) {
      apiError(error.message);
    }
  };

  const errorHandler = (error) => {
    console.error('Row update error: ', error);
    setMessage('Row update error', 'error');
  };

  const customToolbar = () => {
    return (
      <Toolbar>
        <Tooltip title="Add new transaction">
          <ToolbarButton
            aria-describedby="new-panel"
            onClick={() => handleAddNewTransaction()}
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

  const columns = useMemo(() => [
    {
      field: 'uuid', cellClassName: 'ro' // TODO 
    },
    {
      field: 'trans_date', headerName: 'Transaction Date', width: 130, type: 'date', editable: true,
      valueFormatter: dateFormat,
      valueSetter: (value, row) => {
        if (!value) return { ...row, trans_date: null };

        const d = new Date(value);
        // Manual formatting to YYYY-MM-DD using local time
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        return { ...row, trans_date: formattedDate };
      },
    },
    { field: 'entry_date', headerName: 'Entry Date', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
    {
      field: 'account', headerName: 'Account', width: 220, editable: true, type: 'singleSelect',
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
    { field: 'source_row', headerName: 'Src. Row', width: 50, type: 'number', editable: true },
    { field: 'type', headerName: 'Type', width: 100, editable: true },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 320, editable: true },
    { field: 'comment', headerName: 'Comment', flex: 1, minWidth: 200, editable: true },
    {
      field: 'net_amount', headerName: 'Amount', width: 120,
      type: 'number', editable: true, valueFormatter: currencyFormat,
    },
    { field: 'statement_amount', headerName: 'Stmt. Amount', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    { field: 'account_balance', headerName: 'Account Balance', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    { field: 'statement_balance', headerName: 'Statement Balance', width: 140, type: 'number', valueFormatter: currencyFormat, cellClassName: 'ro', },
    {
      field: 'category', headerName: 'Category', flex: 1, minWidth: 280, type: 'singleSelect', editable: true,
      valueOptions: categories.map((cat) => ({
        value: cat.uuid,
        label: cat.full_name,
      })),
      valueFormatter: (value) => {
        const cat = categories.find((cat) => cat.uuid === value);
        return cat ? cat.full_name : '';
      },
    },
    { field: 'created', headerName: 'Created', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
    { field: 'modified', headerName: 'Last Modified', width: 200, valueFormatter: isoDateFormat, cellClassName: 'ro' },
  ], [accounts, categories]); // update if accounts or categories change

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
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => handleFilterUpdate('account', e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">All Accounts</MenuItem>
          {accounts.map(acc => (
            <MenuItem key={acc.uuid} value={acc.uuid}>{acc.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Category"
          size="small"
          value={filters.category}
          slotProps={{
            inputLabel: { shrink: true },
            select: {
              multiple: true,
              renderValue: (selected) => selected.length > 0 ? `${selected.length} Selected` : 'None'
            }
          }}
          onChange={(e) => handleFilterUpdate('category', e.target.value)}
          sx={{ minWidth: 300 }}
        >
          {/* Use null category for filtering by Uncategorized */}
          <MenuItem value="null">Uncategorized</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.uuid} value={cat.uuid}>{cat.full_name}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Start Date"
          size="small"
          value={filters.startDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => handleFilterUpdate('startDate', e.target.value)}
        />

        <TextField
          type="date"
          label="End Date"
          size="small"
          value={filters.endDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => handleFilterUpdate('endDate', e.target.value)}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.childCats[0] === 'true'}
              onChange={(e) => handleFilterUpdate('childCats', e.target.checked)}
              size="small"
            />
          }
          label="Include Child Categories"
        />
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 2 }}>
        {filters.category.map((value) => {
          let category = categories.find((c) => c.uuid === value);
          if (value === 'null') {
            category = { uuid: 'null', full_name: 'Uncategorized' }
          }
          return (
            <Chip
              key={value}
              label={category?.full_name || value}
              size="small"
              onDelete={() => {
                // 3. Optional: Allow users to remove categories by clicking the 'X'
                const newValue = filters.category.filter((id) => id !== value);
                handleFilterUpdate('category', newValue);
              }}
            />
          );
        })}
      </Box>

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
          toolbar: {
            handleAddNewTransaction,
          }
        }}
        // disable both column sorting and filtering
        // this would need to be handled server-side to be useful
        disableColumnSorting
        disableColumnFilter
        //sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
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
                  {cat.full_name}
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
