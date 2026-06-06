import { Alert, Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { ClipboardCheck, ClipboardList, Download, FileSpreadsheet, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadFile, getErrorMessage } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';

const defaultSummary = {
  totalLots: 0,
  totalSerials: 0,
  assignedRolls: 0,
  unassignedRolls: 0
};

const Dashboard = () => {
  const [summary, setSummary] = useState(defaultSummary);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const loadSummary = async () => {
    try {
      setError('');
      const response = await api.get('/dashboard/summary');
      setSummary(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleDownload = async (type) => {
    try {
      setDownloading(type);
      await downloadFile(`/export/${type}`, `serials-export.${type === 'excel' ? 'xlsx' : 'csv'}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDownloading('');
    }
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Current lot and roll assignment totals."
        actions={
          <>
            <Button component={Link} to="/create-lot" variant="contained" startIcon={<Layers size={18} />}>
              Generate Lot
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileSpreadsheet size={18} />}
              disabled={downloading === 'excel'}
              onClick={() => handleDownload('excel')}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              disabled={downloading === 'csv'}
              onClick={() => handleDownload('csv')}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Total Lots" value={summary.totalLots} icon={Layers} tone="#1f6f61" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Total Serials" value={summary.totalSerials} icon={ClipboardList} tone="#2f5f98" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Assigned Rolls" value={summary.assignedRolls} icon={ClipboardCheck} tone="#1f7a4d" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Unassigned Rolls" value={summary.unassignedRolls} icon={ClipboardList} tone="#a15c17" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderColor: '#dce5df' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">Factory traceability flow</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Create one lot from date, yard, and meter values, then assign roll numbers from the
              serial details screen as production progresses.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <Button component={Link} to="/lots" variant="outlined" startIcon={<Layers size={18} />}>
              Manage Lots
            </Button>
            <Button component={Link} to="/serials" variant="contained" startIcon={<ClipboardList size={18} />}>
              Open Serial List
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};

export default Dashboard;
