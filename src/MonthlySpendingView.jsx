// import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Card, Paper, Typography } from "@mui/material";
import { useEffect, useState } from 'react';
// import { getMonthlyTotals, UnauthorizedError } from './data/api.js';
import { useAuth } from './hooks/AuthContext.js';
import { useMessaging } from './hooks/MessagingContext.js';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button } from '@mui/material';

export default function MonthlySpendingView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // accounts data state
  // const [totals, setTotals] = useState([]);

  // const fetchMonthlyTotals = async () => {
  //   try {
  //     // handleLoading(true);
  //     const data = await getMonthlyTotals();
  //     setTotals(data.results);
  //   } catch (error) {
  //     if (error instanceof UnauthorizedError) {
  //       // user needs to login
  //       logout();
  //     } else {
  //       // other error
  //       throw error;
  //     }
  //   } finally {
  //     // handleLoading(false);
  //   }
  // };

  useEffect(() => {
    // fetchMonthlyTotals();
  }, []);

  // Helper to turn yearmonth data (YYYYYMM) into a Date object
  // const parseYYYYMM = (str) => {
  //   const year = parseInt(str.substring(0, 4), 10);
  //   const month = parseInt(str.substring(4, 6), 10) - 1; // JS months are 0-indexed
  //   return new Date(year, month);
  // };

  // currency formatter
  // const ukCurrencyFormatter = (value) =>
  //   new Intl.NumberFormat('en-GB', {
  //     style: 'currency',
  //     currency: 'GBP',
  //     // Optional: remove decimals if you only want whole pounds
  //     // minimumFractionDigits: 0, 
  //   }).format(value);


  // Initialize state with the current date using Day.js
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handleExport = () => {
    // Format the date for your API (e.g., "2026-02")
    const apiValue = selectedDate.format('YYYY-MM');
    alert(apiValue);
    console.log("Sending to API:", apiValue);

    // Example: fetch(`/api/data?date=${apiValue}`)
  };

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'auto', // Allows scrolling if the chart hits the minWidth
      minHeight: 500     // Ensure parent has height for the chart
    }}>
      <Card variant='outlined' sx={{ minWidth: 750, flexGrow: 1, m: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ ml: 2, mt: 1 }}>
          Monthly Balances (WIP)
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}>

            <DatePicker
              label="Select Period"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              views={['year', 'month']}
              format="MMMM YYYY"
              slotProps={{
                textField: {
                  size: 'small', // Reduces height and padding
                  sx: { width: '200px' } // Optional: Control the width
                },
              }}
            />

            <Button variant="contained" onClick={handleExport}>
              Log Selection
            </Button>

          </Box>
        </LocalizationProvider>

      </Card>
    </Box>
  )
};
