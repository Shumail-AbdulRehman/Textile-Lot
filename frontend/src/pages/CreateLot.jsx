import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { ClipboardList, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const today = new Date().toISOString().slice(0, 10);

const CreateLot = () => {
  const [form, setForm] = useState({
    date: today,
    yard: '',
    meter: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/lots/generate', {
        date: form.date,
        yard: Number(form.yard),
        meter: Number(form.meter)
      });
      setResult(response.data);
      setForm((current) => ({ ...current, yard: '', meter: '' }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Lot"
        subtitle="Generate a lot and all serial numbers in one bulk database write."
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#dce5df' }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {result ? (
                  <Alert
                    severity="success"
                    action={
                      <Button component={Link} to="/serials" size="small" startIcon={<ClipboardList size={16} />}>
                        View
                      </Button>
                    }
                  >
                    {result.lot.lotCode} created with {result.generatedSerials} serial numbers.
                  </Alert>
                ) : null}

                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={updateField}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  label="Yard Quantity"
                  name="yard"
                  type="number"
                  value={form.yard}
                  onChange={updateField}
                  inputProps={{ min: 1, max: 10000, step: 1 }}
                  helperText="This controls how many serial numbers are generated. Maximum 10,000."
                  required
                />

                <TextField
                  label="Meter Quantity"
                  name="meter"
                  type="number"
                  value={form.meter}
                  onChange={updateField}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Wand2 size={18} />}
                  disabled={loading}
                  sx={{ alignSelf: { sm: 'flex-start' }, px: 3 }}
                >
                  {loading ? 'Generating...' : 'Generate Serials'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#dce5df', height: '100%' }}>
            <Typography variant="h2">Serial format</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25 }}>
              For 03-06-2026 and Yard 1000, the system stores one lot code and generates padded
              serial numbers from 0001 through 1000.
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: '#17211f',
                color: '#f3f8f5',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 14,
                overflowX: 'auto'
              }}
            >
              LOT-03062026-0001
              <br />
              LOT-03062026-0002
              <br />
              LOT-03062026-0003
              <br />
              ...
              <br />
              LOT-03062026-1000
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateLot;
