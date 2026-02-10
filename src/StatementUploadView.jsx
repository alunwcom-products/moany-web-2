
import { useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider } from '@mui/material';
import { useMessaging } from "./hooks/MessagingContext";
import { postStatement, UnauthorizedError } from "./data/api";

export default function StatementUploadView() {

  // ErrorProvider context
  const { setMessage } = useMessaging();

  const [file, setFile] = useState(null);
  const [type, setType] = useState("");

  function handleFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.type !== "application/pdf") {
      //setError("Please select a PDF file.");
      setMessage('Please select a PDF file', 'error');
      setFile(null);
      return;
    }
    setFile(f);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      return setMessage('No file selected', 'error');
    }
    if (!type) {
      return setMessage('Please select the statement type', 'error');
    }

    try {
      const response = await postStatement(file, type);
      setFile(null);
      setType("");
      e.target.reset();

      console.debug('RESPONSE: ', response);

      if (response?.success) {
        setMessage(response.message, 'success');
      } else {
        setMessage(response.message, 'error');
      }

    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // user needs to login
        logout();
      } else {
        // other error
        throw error;
      }
    }
  };

  return (
    <Box className="card">
      <Typography variant="h5" gutterBottom>Statement Upload</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>

        <FormControl>
          <Button variant="outlined" component="label">
            Select statement...
            <input hidden accept="application/pdf" type="file" onChange={handleFileChange} />
          </Button>
          {file && <FormHelperText>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</FormHelperText>}
        </FormControl>

        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="demo-select-small-label">Statement Type</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={type}
            label="Statement Type"
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="Mastercard">Mastercard</MenuItem>
            <MenuItem value="Chase Debit">Chase Debit</MenuItem>
            <MenuItem value="NatWest Debit">NatWest Debit</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Button type="submit" variant="contained">Upload</Button>
        </Box>
      </Box>
    </Box>
  );
}
