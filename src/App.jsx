import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';
import Dashboard from './Dashboard';
import { createBrowserRouter, RouterProvider, redirect, useRouteError, isRouteErrorResponse } from 'react-router';
import LoginView from './LoginView';
import AccountsView from './AccountsView';
import { ErrorProvider } from './ErrorProvider';
import SummaryView from './SummaryView';
import TransactionsView from './TransactionsView';
import StatementUploadView from './StatementUploadView';
import ProtectedRoute from './ProtectedRoute';
import { getAccountSummary } from './data/api';

// Loader wrapper to redirect to login on 401 (unauthenticated)
const accountSummaryLoader = async (args) => {
  try {
    return await getAccountSummary();
  } catch (err) {
    // If the API returned a Response with status (thrown above), handle 401
    if (err instanceof Response && err.status === 401) {
      return redirect('/login');
    }
    throw err;
  }
};

// TODO check what this needs to do - and UI
const rootErrorBoundary = () => {
  let error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
};

const router = createBrowserRouter([
  { path: "login", element: <LoginView /> },
  {
    path: "/",
    element: <Dashboard />,
    ErrorBoundary: rootErrorBoundary,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <SummaryView /> },
          { path: "accounts", element: <AccountsView />, loader: accountSummaryLoader },
          { path: "transactions", element: <TransactionsView /> },
          { path: "upload", element: <StatementUploadView /> },
        ],
      },
    ],
  }
]);

export default function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <CssBaseline />
        <RouterProvider router={router}></RouterProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}
