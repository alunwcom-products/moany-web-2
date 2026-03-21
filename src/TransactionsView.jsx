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

  const columns = [
    {
      field: 'trans_date', headerName: 'Transaction Date', width: 130, type: 'date',
      valueGetter: (value) => {
        return new Date(value)
      }
    },
    {
      field: 'account', headerName: 'Account', width: 230,
      valueGetter: (value) => {
        const acc = accounts.filter((account) => account.uuid === value);
        // console.log(`Got account: ${JSON.stringify(acc)}`);
        if (acc.length === 1) {
          return acc[0].name;
        } else {
          return 'ERROR'
        }
      }
    },
    {
      field: 'source_type', headerName: 'Src', width: 50,
      valueGetter: (value) => {
        return value[0]
      }
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 300 },
    {
      field: 'net_amount', headerName: 'Amount', width: 140,
      type: 'number', editable: true, valueFormatter: (value) => {
        if (!value) return value;
        return currencyFormatter.format(value);
      },
    },
    { field: 'account_balance', headerName: 'Account Balance', width: 140 },
    {
      field: 'category', headerName: 'Category', width: 290,
      valueGetter: (value) => {
        const cat = categories.filter((category) => category.uuid === value);
        // console.log(`Got account: ${JSON.stringify(acc)}`);
        if (cat.length === 1) {
          return cat[0].name;
        } else if (cat.length === 0) {
          return ''
        } else {
          return 'ERROR'
        }
      }
    },
  ];

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
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
      />
    </Box>
  );
}
