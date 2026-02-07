
import { useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

export default function StatementUploadView() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(e) {
    setError("");
    const f = e.target.files?.[0] ?? null;
    if (f && f.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) return setError("No file selected.");
    if (!type) return setError("Please choose a statement type.");

    // Placeholder: actual upload/processing will be implemented later
    console.log("Uploading file:", file.name, "as type:", type);
    alert(`Selected ${file.name} (${Math.round(file.size/1024)} KB) for ${type}`);
    setFile(null);
    setType("");
    e.target.reset();
  }

  return (
    <Box className="card">
      <Typography variant="h5" gutterBottom>Upload Statement</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>

        <FormControl>
          <Typography variant="body2" sx={{ mb: 1 }}>Statement PDF</Typography>
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
            Choose PDF
            <input hidden accept="application/pdf" type="file" onChange={handleFileChange} />
          </Button>
          {file && <FormHelperText>Selected: {file.name} ({Math.round(file.size/1024)} KB)</FormHelperText>}
        </FormControl>

        <FormControl>
          <InputLabel id="stmt-type-label">Statement Type</InputLabel>
          <Select
            labelId="stmt-type-label"
            value={type}
            label="Statement Type"
            onChange={(e) => setType(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="Mastercard">Mastercard</MenuItem>
            <MenuItem value="Chase Debit">Chase Debit</MenuItem>
            <MenuItem value="NatWest Debit">NatWest Debit</MenuItem>
          </Select>
        </FormControl>

        {error && <Typography color="error">{error}</Typography>}

        <Box>
          <Button type="submit" variant="contained">Upload</Button>
        </Box>
      </Box>
    </Box>
  );
}
