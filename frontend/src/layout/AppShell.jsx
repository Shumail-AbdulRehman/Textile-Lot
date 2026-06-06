import { Box, Button, Container, Drawer, Stack, Typography, useMediaQuery } from '@mui/material';
import { ClipboardList, Factory, Gauge, Layers, PlusSquare } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Lots', href: '/lots', icon: Layers },
  { label: 'Create Lot', href: '/create-lot', icon: PlusSquare },
  { label: 'Serial List', href: '/serials', icon: ClipboardList }
];

const drawerWidth = 248;

const AppShell = () => {
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:900px)');

  const nav = (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, px: 1 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 42,
            height: 42,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <Factory size={22} />
        </Box>
        <Box>
          <Typography variant="h3">Textile Trace</Typography>
          <Typography variant="caption" color="text.secondary">
            Lot serial control
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              component={NavLink}
              to={item.href}
              startIcon={<Icon size={18} />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : '#eef3ef'
                }
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: { md: 'flex' }, bgcolor: 'background.default' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: '1px solid #dce5df',
              bgcolor: '#fbfcfa'
            }
          }}
        >
          {nav}
        </Drawer>
      ) : (
        <Box sx={{ borderBottom: '1px solid #dce5df', bgcolor: '#fbfcfa' }}>{nav}</Box>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppShell;
