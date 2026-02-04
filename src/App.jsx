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
            { path: "accounts", element: <AccountsView /> },
            { path: "transactions", element: <TransactionsView /> },
            { path: "upload", element: <StatementUploadView /> },
            // { path: "accounts", element: <AccountsView />, loader: async () => await getAccountSummary() },
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
