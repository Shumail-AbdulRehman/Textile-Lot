import { Chip } from '@mui/material';

const StatusChip = ({ status }) => {
  const assigned = status === 'Assigned';

  return (
    <Chip
      size="small"
      label={status}
      color={assigned ? 'success' : 'warning'}
      variant={assigned ? 'filled' : 'outlined'}
      sx={{ fontWeight: 700 }}
    />
  );
};

export default StatusChip;
