import { Paper, Stack, Typography } from '@mui/material';

const StatCard = ({ label, value, icon: Icon, tone = '#1f6f61' }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderColor: '#dce5df',
        minHeight: 128
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Stack spacing={1}>
          <Typography color="text.secondary" fontWeight={700}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '2rem', lineHeight: 1, fontWeight: 800 }}>{value}</Typography>
        </Stack>
        {Icon ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: `${tone}1a`,
              color: tone
            }}
          >
            <Icon size={22} />
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default StatCard;
