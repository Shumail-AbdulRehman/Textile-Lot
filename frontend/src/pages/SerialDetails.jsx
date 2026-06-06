import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusChip from '../components/StatusChip.jsx';

const DetailField = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2, borderColor: '#dce5df', height: '100%' }}>
    <Typography variant="caption" color="text.secondary" fontWeight={800}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.75, fontWeight: 760, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
  </Paper>
);

const SerialDetails = () => {
  const { id } = useParams();
  const [serial, setSerial] = useState(null);
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSerial = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/serials/${id}`);
      setSerial(response.data);
      setRollNumber(response.data.rollNumber || '');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSerial();
  }, [id]);

  const handleAssign = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/serials/${id}/assign-roll`, { rollNumber });
      setSerial(response.data.serial);
      setSuccess('Roll number assigned successfully.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Serial Details"
        subtitle="Traceability record and roll assignment."
        actions={
          <Button component={Link} to="/serials" variant="outlined" startIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#dce5df' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
              <Typography variant="h2">{loading ? 'Loading...' : serial?.serialNumber || 'Serial not found'}</Typography>
              {serial ? <StatusChip status={serial.status} /> : null}
            </Stack>

            {serial ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <DetailField label="Serial Number" value={serial.serialNumber} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DetailField label="Lot Code" value={serial.lotCode} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Date" value={serial.date} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Yard" value={serial.yard} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Meter" value={serial.meter} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Roll Number" value={serial.rollNumber} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Status" value={serial.status} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DetailField label="Created Date" value={new Date(serial.createdAt).toLocaleString()} />
                </Grid>
              </Grid>
            ) : null}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#dce5df' }}>
            <Typography variant="h2">Assign Roll</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
              Store the production roll reference for this serial.
            </Typography>
            <Stack component="form" spacing={2} onSubmit={handleAssign}>
              <TextField
                label="Roll Number"
                value={rollNumber}
                onChange={(event) => setRollNumber(event.target.value)}
                placeholder="ROLL-12"
                required
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={18} />}
                disabled={saving || !serial}
              >
                {saving ? 'Saving...' : 'Assign Roll'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default SerialDetails;
