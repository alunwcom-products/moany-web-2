import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';
import Dashboard from './Dashboard';
import { createBrowserRouter, RouterProvider } from 'react-router';
import LoginView from './LoginView';

export default function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard/>,
      //ErrorBoundary: RootErrorBoundary,
      children: [
        { index: true, element: <LoginView/> },
        // {
        //   element: <ProtectedRoute/>,
        //   children: [
        //     { index: true, element: <HomeView/> },
        // { path: "summary", element: <SummaryView /> },
        //     { path: "accounts", element: <AccountsView />, loader: async () => await getAccountSummary() },
        //     { path: "transactions", element: <TransactionsView /> },
        //     { path: "upload", element: <StatementUploadView /> },
        //   ],
        // },
      ],
    }
  ]);

  return (
    <AuthProvider>
      <CssBaseline/>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  );
}
