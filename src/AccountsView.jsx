import { useLoaderData } from 'react-router';
import { useEffect, useState } from 'react';
import {
  DataGrid,
} from '@mui/x-data-grid';
import AccountsToolbar from './AccountsToolbar';
import { setAccount } from './data/api';
import { useMessaging } from './hooks/MessagingContext';

export default function AccountsView() {
  // account data
  const accounts = useLoaderData();
  // ErrorProvider context
  const { setMessage } = useMessaging();

  // REVIEW ---------------------------

  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);
  // const [accountUpdated, setAccountUpdated] = useState(false);

  // update state in a function to that child toolbar component can update the state
  const handleLoading = (isFetching) => {
    setIsLoadingDataGrid(isFetching)
  }

  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  const columns = [
    { field: 'uuid', headerName: 'UUID', width: 300, cellClassName: 'ro' },
    { field: 'name', headerName: 'Account Name', width: 250, editable: true },
    { field: 'sortcode', headerName: 'Sort Code', width: 120, editable: true },
    { field: 'account_num', headerName: 'Account Number', width: 150, editable: true },
    {
      field: 'type', headerName: 'Type', width: 100, editable: true,
      type: 'singleSelect', valueOptions: ['DEBIT', 'CREDIT']
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueFormatter: (value) => {
        return value === true ? 'Yes' : 'No';
      },
      valueOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      field: 'earliest', headerName: 'Earliest Transaction', width: 150, type: 'date', cellClassName: 'ro',
      valueGetter: (value) => {
        return new Date(value)
      }
    },
    {
      field: 'latest', headerName: 'Latest Transaction', width: 150, type: 'date', cellClassName: 'ro',
      valueGetter: (value) => {
        return new Date(value)
      }
    },
    {
      field: 'starting_balance', headerName: 'Starting Balance', width: 140,
      type: 'number', editable: true, valueFormatter: (value) => {
        if (!value) return value;
        return currencyFormatter.format(value);
      },
    },
    {
      field: 'latest_balance', headerName: 'Latest Balance', width: 140, cellClassName: 'ro',
      type: 'number', editable: true, valueFormatter: (value) => {
        if (!value) return value;
        return currencyFormatter.format(value);
      },
    },
  ];

  const initialState = {
    columns: {
      columnVisibilityModel: {
        uuid: false,
        earliest: false,
        starting_balance: false,
      },
    },
    pagination: {
      paginationModel: {
        pageSize: 25
      }
    },
  };

  useEffect(() => {
    if (!accounts) {
      setMessage('No accounts found', 'warning');
    }
    // console.debug(accounts.results);
  }, [accounts, setMessage]);

  const rowUpdate = async (updatedRow, originalRow) => {
    console.log(`UPDATE: ${JSON.stringify(updatedRow, null, 2)}`);
    handleLoading(true);
    setAccount(updatedRow);

    handleLoading(false);
    return updatedRow;
  };

  const errorHandler = (error) => {
    console.error('Error handler called! ' + error);
  };

  // store filter
  const FILTER_STORAGE_KEY = 'account-filter';
  const [filterModel, setFilterModel] = useState(() => {
    const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
    return savedFilter ? JSON.parse(savedFilter) : {
      items: [{ field: 'active', operator: 'is', value: true }], // by default, show only active accounts
    };
  });

  const onFilterChange = (newModel) => {
    setFilterModel(newModel);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newModel));
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={accounts.results}
        initialState={initialState}
        filterModel={filterModel}
        onFilterModelChange={onFilterChange}
        loading={isLoadingDataGrid}
        slots={{ toolbar: AccountsToolbar }}
        slotProps={{
          toolbar: {
            handleFetch: handleLoading
          }
        }}
        showToolbar
        editMode='row'
        getRowId={(row) => row.uuid}
        density='compact'
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
    </div>
  );
}
