'use client';

import { useEffect, useState } from 'react';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, IconButton, Typography,
  List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const drawerWidth = 240;

export default function LayoutDashboard({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriaActual = searchParams.get('categoria');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('/api/categorias');
        const data = await res.json();
        setCategorias([...new Set(data)]);
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
      }
    };

    fetchCategorias();
  }, [pathname]);

  const drawer = (
    <div>
      <Toolbar />
      <Typography variant="subtitle1" sx={{ px: 2, mt: 2, fontWeight: 'bold', color: '#666' }}>
        Menú
      </Typography>
      <List>
        {/* 🔵 Botón fijo: Crear Elemento */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/dashboard/crear')}>
            <ListItemText primary="Crear Elemento" />
          </ListItemButton>
        </ListItem>

        {/* 🔁 Categorías dinámicas */}
        {categorias.map((cat) => (
          <ListItem key={cat} disablePadding>
            <ListItemButton
              selected={categoriaActual === cat}
              onClick={() => router.push(`/dashboard/equipos?categoria=${encodeURIComponent(cat)}`)}
            >
              <ListItemText primary={cat} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* ⚙️ Sección de gestión */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/dashboard/categorias')}>
            <ListItemText primary="Categorías" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard - Estado de Máquinas ⚙️
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menú lateral"
      >
        {/* Menú móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Menú escritorio */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
