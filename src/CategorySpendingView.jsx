import { Box, Card, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Link } from "@mui/material";
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './hooks/AuthContext.js';
import { useMessaging } from './hooks/MessagingContext.js';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button } from '@mui/material';
import { getCategoryTotals, UnauthorizedError } from "./data/api.js";
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const currencyFormat = (value) => value == null ? '' : currencyFormatter.format(value);

export default function CategorySpendingView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // state
  const [rows, setRows] = useState([]); // category totals data
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month')); // start date
  const [endDate, setEndDate] = useState(dayjs().subtract(1, 'month')); // end date

  // convert start and end date to API parameter string
  const getParams = () => {
    return new URLSearchParams({
      ...({ startMonth: startDate.format('YYYY-MM') }),
      ...({ endMonth: endDate.format('YYYY-MM') }),
    }).toString();
  };

  const fetchCategoryTotals = async () => {
    try {
      // handleLoading(true);
      console.log(getParams());
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
    console.log('date columns');
    if (rows.length === 0) return []; // no data

    // Get keys that match the YYYY-MM format
    const keys = Object.keys(rows[0])
      .filter((key) => /^\d{4}-\d{2}$/.test(key))
      .sort(); // Ensure dates are in chronological order

    console.log(keys);
    return keys;
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
        </LocalizationProvider>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, mb: 2, mt: 2 }} size="small" aria-label="">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  // width: 300,
                  minWidth: 250,
                  position: 'sticky',
                  left: 0,
                  zIndex: 3, // Higher than header and body sticky cells
                  backgroundColor: 'background.paper',
                }}
              >Category</TableCell>
              {dateColumns.map((date) => (
                <TableCell key={date} align="right" sx={{ width: 120, minWidth: 120 }}>
                  {date}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ minWidth: 150 }}>Total</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>Average</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              // console.log(row);

              // 1. Initialize BigNumber for calculations
              let rowTotal = new BigNumber(0);

              // 2. Sum up the months
              dateColumns.forEach(date => {
                const val = new BigNumber(row[date] || 0);
                rowTotal = rowTotal.plus(val);
              });

              // 3. Calculate average
              const rowAverage = rowTotal.dividedBy(dateColumns.length || 1);

              return (
                <TableRow key={row.full_name || index} sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'white' }}>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3, // Higher than header and body sticky cells
                      bgcolor: row.depth === 1 ? 'grey.200' : 'white',
                    }}
                    style={{
                      paddingLeft: `${row.depth * 20}px`,
                      fontWeight: row.depth === 1 ? 600 : 400
                    }}
                  >
                    {row.name}
                  </TableCell>

                  {/* Monthly Data Cells */}
                  {dateColumns.map((date) => (
                    <TableCell key={date} align="right">
                      {row[date] !== null ? (
                        // <Tooltip title={`Drill down: ${row.name} (${date})`} arrow>
                        //   <Link
                        //     component="button"
                        //     variant="body2"
                        //     sx={{
                        //       fontFamily: 'monospace',
                        //       // Use BigNumber for the conditional color check
                        //       color: new BigNumber(row[date]).isNegative() ? 'error.main' : 'primary.main'
                        //     }}
                        //   >
                        //     {new BigNumber(row[date]).toFixed(2)}
                        //   </Link>
                        // </Tooltip>
                        <Typography variant="body2" sx={{ color: new BigNumber(row[date] || 0).isNegative() ? 'red' : 'black' }}>{currencyFormat(new BigNumber(row[date] || 0).toNumber())}</Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'green' }}> </Typography>
                      )}
                    </TableCell>
                  ))}

                  {/* Total Column - Formatted to 2 decimal places */}
                  <TableCell align="right" sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'grey.50', fontWeight: 'bold', }}>
                    {currencyFormat(rowTotal.toNumber())}
                  </TableCell>

                  {/* Average Column - Formatted to 2 decimal places */}
                  <TableCell align="right" sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'grey.50', fontStyle: 'italic', }}>
                    {currencyFormat(rowAverage.toNumber())}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

