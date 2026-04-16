// import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Card, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from 'react';
// import { getMonthlyTotals, UnauthorizedError } from './data/api.js';
import { useAuth } from './hooks/AuthContext.js';
import { useMessaging } from './hooks/MessagingContext.js';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button } from '@mui/material';
import { getCategoryTotals, UnauthorizedError } from "./data/api.js";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

// const rows = [
//   createData('Income', '£0.00', '£225.00', '£340.00', '£233.00'),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

export default function CategorySpendingView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // accounts data state
  // const [totals, setTotals] = useState([]);
  const [rows, setRows] = useState([]);

  // Initialize state with the current date using Day.js
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month'));
  const [endDate, setEndDate] = useState(dayjs());

  const getParams = () => {
    console.log(`getParams: ${startDate} / ${endDate}`);
    return new URLSearchParams({
      ...({ startMonth: startDate.format('YYYY-MM') }),
      ...({ endMonth: endDate.format('YYYY-MM') }),
    }).toString();
  };

  const handleUpdate = () => {
    // Format the date for your API (e.g., "2026-02")
    const startMonth = startDate.format('YYYY-MM');
    const endMonth = endDate.format('YYYY-MM');
    const message = `Range: ${startMonth} - ${endMonth}`;
    alert(message);
    console.log("Sending to API:", message);

    // Example: fetch(`/api/data?date=${apiValue}`)
  };

  const handleEndChange = () => {
    // Format the date for your API (e.g., "2026-02")
    const startMonth = startDate.format('YYYY-MM');
    const endMonth = endDate.format('YYYY-MM');
    const message = `Range: ${startMonth} - ${endMonth}`;
    alert(message);
    console.log("Sending to API:", message);

    // Example: fetch(`/api/data?date=${apiValue}`)
  };


  const fetchCategoryTotals = async () => {
    try {
      // handleLoading(true);
      const data = await getCategoryTotals(getParams());
      console.log(data);
      setRows(data.results);
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

  useEffect(() => {
    fetchCategoryTotals();
  }, [startDate, endDate]);

  // get year-months from the data for the column headers
  const dateColumns = useMemo(() => {
    if (rows.length === 0) return []; // no data

    // Get keys that match the YYYY-MM format
    return Object.keys(rows[0])
      .filter((key) => /^\d{4}-\d{2}$/.test(key))
      .sort(); // Ensure dates are in chronological order
  }, [rows]);

  return (
    <Box style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom >Category Spending</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}> */}

          <DatePicker
            label="Start Month"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            views={['year', 'month']}
            format="MMMM YYYY"
            slotProps={{
              textField: {
                size: 'small', // Reduces height and padding
                sx: { width: '200px' } // Optional: Control the width
              },
            }}
          />

          <DatePicker
            label="End Month"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            views={['year', 'month']}
            format="MMMM YYYY"
            slotProps={{
              textField: {
                size: 'small', // Reduces height and padding
                sx: { width: '200px' } // Optional: Control the width
              },
            }}
          />

          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>

          {/* </Box> */}
        </LocalizationProvider>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              {dateColumns.map((date) => (
                <TableCell key={date} align="right">
                  {date}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.full_name || index} hover>
                {/* Category cell with indentation based on depth */}
                <TableCell
                  component="th"
                  scope="row"
                  style={{ paddingLeft: `${row.depth * 20}px` }}
                >
                  {row.name}
                </TableCell>

                {/* Dynamic Monthly Cells */}
                {dateColumns.map((date) => (
                  <TableCell key={date} align="right">
                    {/* Fallback to '0.00' if value is null/missing */}
                    {row[date] !== null ? row[date] : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

