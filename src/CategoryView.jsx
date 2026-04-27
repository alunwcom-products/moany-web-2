import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnsPanelTrigger, DataGrid, Toolbar, ToolbarButton } from '@mui/x-data-grid';
import { TextField, MenuItem, Box, Stack, Typography, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getCategories, setCategory, UnauthorizedError } from './data/api';
import AddIcon from '@mui/icons-material/Add';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useAuth } from './hooks/AuthContext';
import { useMessaging } from './hooks/MessagingContext';

const INITIAL_FORM_STATE = {
  name: '',
  parent_id: '',
};

const initialState = {
  columns: {
    columnVisibilityModel: {
      uuid: false,
    },
  },
  pagination: {
    paginationModel: {
      pageSize: 10
    }
  },
};

// NOTE: top-level (root) categories (i.e. those without parent_id) should not be 
// creatable or editable via the UI. These should only be created at system-level
export default function CategoryView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // State for data and loading
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // dialog
  const [open, setOpen] = useState(false); // Controls the Popup

  // --- Form State ---
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleAddCategory = () => {
    setFormData(INITIAL_FORM_STATE);
    setOpen(true);
  };

  // 2. Handle Form Submission
  const handleSubmit = async () => {
    try {
      console.log(JSON.stringify(formData));
      await setCategory(formData);
      setMessage('Category created', 'success');
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

  const loadData = useCallback(async (abortController) => {
    setLoading(true);
    const loadData = async () => {
      try {
        const response = await getCategories(abortController);
        setRows(response.results);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          // user needs to login
          logout();
        } else {
          // other error
          throw error;
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [logout, setMessage]);

  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController);
  }, []);

  const rowUpdate = async (updatedRow, originalRow) => {
    try {
      setLoading(true);
      const transaction = await setCategory(updatedRow);
      setMessage('Row updated', 'success');
      return transaction;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // user needs to login
        logout();
      } else {
        // other error
        setMessage('Save failed', 'error');
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const errorHandler = (error) => {
    console.error('Row update error: ', error);
    setMessage('Row update error', 'error');
  };

  const customToolbar = () => {
    return (
      <Toolbar>
        <Tooltip title="Add new category">
          <ToolbarButton
            aria-describedby="new-panel"
            onClick={() => handleAddCategory()}
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
    { field: 'uuid', headerName: 'UUID', width: 300, cellClassName: 'ro' },
    { field: 'full_name', headerName: 'Full Name', width: 300, cellClassName: 'ro' },
    { field: 'name', headerName: 'Category Name', width: 200, editable: true },
    {
      field: 'parent_id', headerName: 'Parent', width: 300, type: 'singleSelect', editable: true,
      valueOptions: rows.map((cat) => ({
        value: cat.uuid,
        label: cat.full_name,
      })),
      valueFormatter: (value) => {
        const cat = rows.find((cat) => cat.uuid === value);
        return cat ? cat.full_name : '';
      },
    },
  ], [rows]);

  return (
    <Box style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>

      <Typography variant="h6" gutterBottom >Categories</Typography>

      <DataGrid
        rows={rows}
        getRowId={(row) => row.uuid}
        density='compact'
        columns={columns}
        initialState={initialState}
        isCellEditable={(params) => params.row.parent_id && params.row.parent_id !== ''}
        getRowClassName={(params) => (params.row.parent_id && params.row.parent_id !== '') ? '' : 'ro'}
        loading={loading}
        editMode='row'
        slotProps={{
          basePagination: {
            showFirstButton: true,
            showLastButton: true,
          },
          toolbar: {
            handleAddCategory,
          }
        }}
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
            color: '#666666',           // Muted text color
            //cursor: 'not-allowed',      // Changes the mouse pointer
          }
        }}
      />

      {/* --- ADD TRANSACTION MODAL --- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Parent"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {rows.map((cat) => (
                <MenuItem key={cat.uuid} value={cat.uuid}>
                  {cat.full_name}
                </MenuItem>
              ))}
            </TextField>
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
