import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField
} from '@mui/material';
import { Download, FileSpreadsheet, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import api, { downloadFile, getErrorMessage } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusChip from '../components/StatusChip.jsx';

const SerialList = () => {
  const [serials, setSerials] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFilters] = useState({ serialNumber: '', lotCode: '', date: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const loadSerials = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/serials', {
        params: {
          page,
          limit,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
          serialNumber: filters.serialNumber || undefined,
          lotCode: filters.lotCode || undefined,
          date: filters.date || undefined
        }
      });

      setSerials(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSerials(1, pagination.limit);
  }, [sort.sortBy, sort.sortOrder]);

  const columns = useMemo(
    () => [
      {
        name: 'Serial Number',
        selector: (row) => row.serialNumber,
        sortable: true,
        sortField: 'serialNumber',
        minWidth: '210px',
        cell: (row) => (
          <Link to={`/serials/${row._id}`} style={{ color: '#1f6f61', fontWeight: 800 }}>
            {row.serialNumber}
          </Link>
        )
      },
      {
        name: 'Lot Code',
        selector: (row) => row.lotCode,
        sortable: true,
        sortField: 'lotCode',
        minWidth: '160px'
      },
      {
        name: 'Date',
        selector: (row) => row.date,
        sortable: true,
        sortField: 'date',
        width: '130px'
      },
      {
        name: 'Yard',
        selector: (row) => row.yard,
        sortable: true,
        sortField: 'yard',
        width: '110px'
      },
      {
        name: 'Meter',
        selector: (row) => row.meter,
        sortable: true,
        sortField: 'meter',
        width: '110px'
      },
      {
        name: 'Roll Number',
        selector: (row) => row.rollNumber || '-',
        sortable: true,
        sortField: 'rollNumber',
        minWidth: '150px'
      },
      {
        name: 'Status',
        selector: (row) => row.status,
        sortable: true,
        sortField: 'status',
        width: '135px',
        cell: (row) => <StatusChip status={row.status} />
      }
    ],
    []
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadSerials(1, pagination.limit);
  };

  const handleReset = () => {
    setFilters({ serialNumber: '', lotCode: '', date: '' });
    setTimeout(() => loadSerials(1, pagination.limit), 0);
  };

  const handleSort = (column, direction) => {
    setSort({
      sortBy: column.sortField || 'createdAt',
      sortOrder: direction
    });
  };

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
        title="Serial List"
        subtitle="Search, sort, paginate, and export generated serial numbers."
        actions={
          <>
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

      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderColor: '#dce5df' }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Serial Number"
                name="serialNumber"
                value={filters.serialNumber}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Lot Code" name="lotCode" value={filters.lotCode} onChange={handleFilterChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" gap={1}>
                <Button type="submit" variant="contained" startIcon={<Search size={18} />} fullWidth>
                  Search
                </Button>
                <Button variant="outlined" startIcon={<X size={18} />} onClick={handleReset}>
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <DataTable
        columns={columns}
        data={serials}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={pagination.total}
        paginationDefaultPage={pagination.page}
        paginationPerPage={pagination.limit}
        paginationRowsPerPageOptions={[20, 50, 100, 250, 500]}
        onChangePage={(page) => loadSerials(page, pagination.limit)}
        onChangeRowsPerPage={(limit, page) => loadSerials(page, limit)}
        sortServer
        onSort={handleSort}
        persistTableHead
        responsive
        striped
        highlightOnHover
      />
    </>
  );
};

export default SerialList;
