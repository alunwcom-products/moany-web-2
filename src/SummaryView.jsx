import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from 'react';
import { getMonthlyTotals, UnauthorizedError } from './data/api.js';
import { useAuth } from './hooks/AuthContext.js';
import { useMessaging } from './hooks/MessagingContext.js';

export default function SummaryView() {

  // context providers
  const { logout } = useAuth();
  const { setMessage } = useMessaging();

  // accounts data state
  const [totals, setTotals] = useState([]);

  const fetchMonthlyTotals = async () => {
    try {
      // handleLoading(true);
      const data = await getMonthlyTotals();
      setTotals(data.results);
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
    fetchMonthlyTotals();
  }, []);

  // Helper to turn yearmonth data (YYYYYMM) into a Date object
  const parseYYYYMM = (str) => {
    const year = parseInt(str.substring(0, 4), 10);
    const month = parseInt(str.substring(4, 6), 10) - 1; // JS months are 0-indexed
    return new Date(year, month);
  };

  // currency formatter
  const ukCurrencyFormatter = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      // Optional: remove decimals if you only want whole pounds
      // minimumFractionDigits: 0, 
    }).format(value);

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'auto', // Allows scrolling if the chart hits the minWidth
      minHeight: 500     // Ensure parent has height for the chart
    }}>
      <Typography variant="h6" gutterBottom >Monthly Balances</Typography>
      <Box sx={{ minWidth: 800, flexGrow: 1 }}>
        <LineChart
          xAxis={[{
            data: totals.map(d => parseYYYYMM(String(d.yearmonth))),
            scaleType: 'time', // Crucial for correct spacing
            valueFormatter: (date) =>
              date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          }]}
          yAxis={[{
            valueFormatter: (value) => ukCurrencyFormatter(value),
            width: 100,
            tickLabelStyle: {
              textAnchor: 'end', // Aligns the end of the text to the axis
              dominantBaseline: 'central',
              fontSize: 12,
            }
          }]}
          series={[
            {
              data: totals.map(d => Number(d.balance)),
              curve: 'linear',
              showMark: false,
              label: 'Balance',
              valueFormatter: (value) => ukCurrencyFormatter(value),
            },
            {
              data: totals.map(d => Number(d.incoming)),
              curve: 'linear',
              showMark: false,
              label: 'Income',
              valueFormatter: (value) => ukCurrencyFormatter(value),
            },
            {
              data: totals.map(d => Number(d.outgoing)),
              curve: 'linear',
              showMark: false,
              label: 'Outgoings',
              valueFormatter: (value) => ukCurrencyFormatter(value),
            },
            {
              data: totals.map(d => Number(d.net)),
              curve: 'linear',
              showMark: false,
              label: 'Monthly Change',
              valueFormatter: (value) => ukCurrencyFormatter(value),
            },
          ]}
          height={500}
          // Ensure the chart margin leaves enough room for the wide axis
          margin={{ left: 50, right: 50, top: 20, bottom: 50 }}
          slotProps={{
            tooltip: {
              sx: {
                // Targets the container of the tooltip items
                '& .MuiChartsTooltip-table': {
                  //width: '300px', // Optional: give it a fixed width to see the alignment clearly
                },
                // Targets the cell containing the numeric value
                '& .MuiChartsTooltip-valueCell': {
                  textAlign: 'right',
                  fontWeight: 'bold',
                  paddingLeft: '20px', // Adds a gap between the label and the price
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  )
};
