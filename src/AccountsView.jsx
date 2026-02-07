import { redirect, useLoaderData } from 'react-router';
import { useEffect, useState } from 'react';
import {
  DataGrid,
} from '@mui/x-data-grid';
import AccountsToolbar from './AccountsToolbar';
import { getAccountSummary, setAccount, UnauthorizedError } from './data/api';
import { useMessaging } from './hooks/MessagingContext';
import { useAuth } from './hooks/AuthContext';

export default function AccountsView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();
  // accounts data state
  const [accounts, setAccounts] = useState([]);
  // datagrid loading state
  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);
  // update state in a function to that child toolbar component can update the state
  const handleLoading = (isFetching) => {
    setIsLoadingDataGrid(isFetching)
  }
  // datagrid currency formatting
  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  const columns = [
    { field: 'uuid', headerName: 'UUID', width: 300, cellClassName: 'ro' },
    { field: 'name', headerName: 'Account Name', width: 250, editable: true },
    { field: 'sortcode', headerName: 'Sort Code', width: 120, editable: true },
    { field: 'account_num', headerName: 'Account Number', width: 150, editable: true },
    { field: 'type', headerName: 'Type', width: 100, editable: true, type: 'singleSelect', valueOptions: ['DEBIT', 'CREDIT'] },
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

  const fetchAccounts = async () => {
    try {
      handleLoading(true);
      const data = await getAccountSummary();
      setAccounts(data.results);
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
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const rowUpdate = async (updatedRow, originalRow) => {
    try {
      handleLoading(true);
      await setAccount(updatedRow);
      return updatedRow;
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
    }
  };

  const errorHandler = (error) => {
    console.error('Row update error: ', error);
    setMessage('Row update error', 'error');
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
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        columns={columns}
        rows={accounts}
        initialState={initialState}
        filterModel={filterModel}
        onFilterModelChange={onFilterChange}
        loading={isLoadingDataGrid}
        slots={{ toolbar: AccountsToolbar }}
        slotProps={{
          toolbar: {
            handleLoading
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
