import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, MenuItem, Box, Stack, Typography } from '@mui/material';
import { getAccountSummary, getCategories, getTransactions } from './data/api';

export default function TransactionView() {
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

  // Fetch accounts for the dropdown on component mount, and look-up on transaction data
  useEffect(() => {
    console.info(`useEffect() [accounts]`);
    const loadAccounts = async () => {
      try {
        // Replace with: const data = await yourApi.getAccounts();
        const accounts = await getAccountSummary();
        // const mockAccounts = [
        //   { uuid: 'acc-1', name: 'Checking (...1234)' },
        //   { uuid: 'acc-2', name: 'Savings (...5678)' }
        // ];
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

  const columns = [
    {
      field: 'uuid', cellClassName: 'ro' // TODO 
    },
    {
      field: 'trans_date', headerName: 'Transaction Date', width: 130, type: 'date', editable: true,
      valueFormatter: dateFormat
    },
    { field: 'entry_date', headerName: 'Entry Date', width: 200, valueFormatter: isoDateFormat },
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
      field: 'source_type', headerName: 'Src. Type', width: 50,
      valueGetter: (value) => {
        return value[0]; // first character
      }
    },
    { field: 'source_name', headerName: 'Src. Name', width: 270, },
    { field: 'source_row', headerName: 'Src. Row', width: 50, type: 'number' },
    { field: 'type', headerName: 'Type', width: 100, },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 320 },
    { field: 'comment', headerName: 'Comment', flex: 1, minWidth: 200 },
    {
      field: 'net_amount', headerName: 'Amount', width: 140,
      type: 'number', editable: true, valueFormatter: currencyFormat,
    },
    { field: 'statement_amount', headerName: 'Stmt. Amount', width: 140, type: 'number', valueFormatter: currencyFormat },
    { field: 'account_balance', headerName: 'Account Balance', width: 140, type: 'number', valueFormatter: currencyFormat },
    { field: 'statement_balance', headerName: 'Statement Balance', width: 140, type: 'number', valueFormatter: currencyFormat },
    {
      field: 'category', headerName: 'Category', flex: 1, minWidth: 290,
      valueFormatter: (value) => {
        const cat = categories.find((a) => a.uuid === value);
        return cat ? cat.name : '';
      },
    },
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
          onChange={(e) => setFilters(prev => ({ ...prev, account: e.target.value, page: 0 }))}
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
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
        />

        <TextField
          type="date"
          label="End Date"
          size="small"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
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
        sx={{
          '& .ro': { // read-only className
            backgroundColor: '#f9f9f9ff', // Light grey background
            //color: '#818181',           // Muted text color
            //cursor: 'not-allowed',      // Changes the mouse pointer
          }
        }}
      />
    </Box>
  );
}
