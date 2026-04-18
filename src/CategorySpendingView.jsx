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
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month'));
  const [endDate, setEndDate] = useState(dayjs().subtract(1, 'month'));

  // 1. Memoized Column Extraction
  const dateColumns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0])
      .filter((key) => /^\d{4}-\d{2}$/.test(key))
      .sort();
  }, [rows]);

  // 2. Pre-calculate Totals and Averages
  // This saves the CPU from doing math during the render phase
  const processedRows = useMemo(() => {
    return rows.map(row => {
      let rowTotal = new BigNumber(0);
      dateColumns.forEach(date => {
        rowTotal = rowTotal.plus(new BigNumber(row[date] || 0));
      });
      const rowAverage = rowTotal.dividedBy(dateColumns.length || 1);
      
      return {
        ...row,
        computedTotal: rowTotal.toNumber(),
        computedAverage: rowAverage.toNumber()
      };
    });
  }, [rows, dateColumns]);

  const fetchCategoryTotals = async () => {
    const params = new URLSearchParams({
      startMonth: startDate.format('YYYY-MM'),
      endMonth: endDate.format('YYYY-MM'),
    }).toString();

    try {
      const data = await getCategoryTotals(params);
      setRows(data.results || []);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logout();
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch data' });
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchCategoryTotals();
  }, [startDate, endDate]);

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

      <TableContainer component={Paper} sx={{ border: '0.5px solid rgba(224,224,224,1)' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                minWidth: 250,
                position: 'sticky', 
                left: 0, 
                zIndex: 3, 
                bgcolor: 'background.paper',
                borderRight: '1px solid rgba(224, 224, 224, 1)',
              }}>
                Category
              </TableCell>
              {dateColumns.map(date => (
                <TableCell key={date} align="right" sx={{ minWidth: 120 }}>{date}</TableCell>
              ))}
              <TableCell align="right" sx={{ minWidth: 150 }}>Total</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>Average</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedRows.map((row, index) => (
              <TableRow key={row.full_name || index} sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'inherit' }}>
                <TableCell
                  sx={{ 
                    position: 'sticky', 
                    left: 0, 
                    bgcolor: row.depth === 1 ? 'grey.200' : 'grey.50',
                    pl: `${row.depth * 20}px`,
                    fontWeight: row.depth === 1 ? 600 : 400,
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                  }}
                >
                  {row.name}
                </TableCell>

                {dateColumns.map(date => {
                  const val = new BigNumber(row[date] || 0);
                  return (
                    <TableCell key={date} align="right">
                      <Typography variant="body2" sx={{ color: val.isNegative() ? 'error.main' : 'text.primary' }}>
                        {currencyFormat(val.toNumber())}
                      </Typography>
                    </TableCell>
                  );
                })}

                <TableCell align="right" sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'grey.50', fontWeight: 'bold' }}>
                  {currencyFormat(row.computedTotal)}
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: row.depth === 1 ? 'grey.200' : 'grey.50', fontStyle: 'italic' }}>
                  {currencyFormat(row.computedAverage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}