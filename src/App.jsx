import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';
import Dashboard from './Dashboard';
import { createBrowserRouter, RouterProvider } from 'react-router';
import LoginView from './LoginView';
import AccountsView from './AccountsView';
import { ErrorProvider } from './ErrorProvider';
import SummaryView from './SummaryView';
import TransactionsView from './TransactionsView';
import StatementUploadView from './StatementUploadView';
import ProtectedRoute from './ProtectedRoute';
import { getAccountSummary } from './data/api';

export default function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
      //ErrorBoundary: RootErrorBoundary,
      children: [
        { path: "login", element: <LoginView /> },
        {
          element: <ProtectedRoute />,
          children: [
            { index: true, element: <SummaryView /> },
            { path: "accounts", element: <AccountsView />, loader: getAccountSummary },
            { path: "transactions", element: <TransactionsView /> },
            { path: "upload", element: <StatementUploadView /> },
          ],
        },
      ],
    }
  ]);

  return (
    <ErrorProvider>
      <AuthProvider>
        <CssBaseline />
        <RouterProvider router={router}></RouterProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}
