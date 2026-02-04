import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <CssBaseline/>
      <Dashboard/>
    </AuthProvider>
  );
}
