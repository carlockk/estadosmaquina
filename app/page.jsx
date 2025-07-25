// app/page.jsx
'use client';

import { Suspense } from 'react';
import CrearMaquina from './components/CrearMaquina';
import LayoutDashboard from './components/LayoutDashboard';
import { Box, Typography, Divider } from '@mui/material';

function CrearElementoView() {
  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Crear Nuevo Elemento
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <CrearMaquina />
    </Box>
  );
}

export default function Home() {
  return (
    <LayoutDashboard>
      <Suspense fallback={<div>Cargando...</div>}>
        <CrearElementoView />
      </Suspense>
    </LayoutDashboard>
  );
}
