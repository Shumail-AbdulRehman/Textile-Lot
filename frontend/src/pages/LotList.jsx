import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Edit, PlusSquare, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const emptyForm = {
  date: '',
  yard: '',
  meter: ''
};

const LotList = () => {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLots = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/lots');
      setLots(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLots();
  }, []);

  const openEdit = (lot) => {
    setSelectedLot(lot);
    setForm({
      date: lot.date,
      yard: lot.yard,
      meter: lot.meter
    });
    setError('');
    setSuccess('');
  };

  const closeEdit = () => {
    setSelectedLot(null);
    setForm(emptyForm);
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedLot) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await api.put(`/lots/${selectedLot._id}`, {
        date: form.date,
        yard: Number(form.yard),
        meter: Number(form.meter)
      });

      setSuccess(
        response.data.regeneratedSerials
          ? `Lot updated and ${response.data.regeneratedSerials} serial numbers regenerated.`
          : 'Lot updated successfully.'
      );
      closeEdit();
      await loadLots();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lot) => {
    const confirmed = window.confirm(
      `Delete ${lot.lotCode}? This also deletes all serial numbers and roll assignments for this lot.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(lot._id);
      setError('');
      setSuccess('');
      const response = await api.delete(`/lots/${lot._id}`);
      setSuccess(`${lot.lotCode} deleted with ${response.data.deletedSerials} serial numbers.`);
      await loadLots();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'Lot Code',
        selector: (row) => row.lotCode,
        sortable: true,
        minWidth: '170px',
        cell: (row) => <Typography fontWeight={800}>{row.lotCode}</Typography>
      },
      {
        name: 'Date',
        selector: (row) => row.date,
        sortable: true,
        width: '130px'
      },
      {
        name: 'Yard',
        selector: (row) => row.yard,
        sortable: true,
        width: '110px'
      },
      {
        name: 'Meter',
        selector: (row) => row.meter,
        sortable: true,
        width: '110px'
      },
      {
        name: 'Created',
        selector: (row) => new Date(row.createdAt).toLocaleString(),
        sortable: true,
        minWidth: '190px'
      },
      {
        name: 'Actions',
        minWidth: '210px',
        cell: (row) => (
          <Stack direction="row" gap={1}>
            <Button size="small" variant="outlined" startIcon={<Edit size={16} />} onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              disabled={deletingId === row._id}
              onClick={() => handleDelete(row)}
            >
              Delete
            </Button>
          </Stack>
        )
      }
    ],
    [deletingId]
  );

  return (
    <>
      <PageHeader
        title="Lots"
        subtitle="View, edit, and delete generated textile lots."
        actions={
          <Button component={Link} to="/create-lot" variant="contained" startIcon={<PlusSquare size={18} />}>
            Create Lot
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2, borderColor: '#dce5df' }}>
        <DataTable
          columns={columns}
          data={lots}
          progressPending={loading}
          pagination
          paginationPerPage={20}
          paginationRowsPerPageOptions={[20, 50, 100]}
          persistTableHead
          responsive
          striped
          highlightOnHover
        />
      </Paper>

      <Dialog open={Boolean(selectedLot)} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Lot</DialogTitle>
        <DialogContent>
          <Stack component="form" id="edit-lot-form" spacing={2.5} onSubmit={handleUpdate} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={updateField}
              InputLabelProps={{ shrink: true }}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Yard Quantity"
                  name="yard"
                  type="number"
                  value={form.yard}
                  onChange={updateField}
                  inputProps={{ min: 1, max: 10000, step: 1 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Meter Quantity"
                  name="meter"
                  type="number"
                  value={form.meter}
                  onChange={updateField}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
            </Grid>
            <Alert severity="info">
              Changing date or yard count regenerates serial numbers, and is blocked once rolls are assigned.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button type="submit" form="edit-lot-form" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LotList;
