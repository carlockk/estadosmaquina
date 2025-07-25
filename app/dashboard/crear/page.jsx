'use client';

import { Suspense } from 'react';
import CrearMaquina from '../../components/CrearMaquina';
import { Box, Typography, Divider } from '@mui/material';

function CrearElementoView() {
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Crear Nuevo Elemento
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <CrearMaquina />
    </Box>
  );
}

export default function CrearElementoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearElementoView />
    </Suspense>
  );
}
