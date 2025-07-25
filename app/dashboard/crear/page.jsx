'use client';

import { Suspense } from 'react';
import CrearMaquina from '../../components/CrearMaquina';
import { Box, Typography, Divider } from '@mui/material';

export default function CrearElementoPage() {
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Crear Nuevo Elemento
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Suspense fallback={<div>Cargando...</div>}>
        <CrearMaquina />
      </Suspense>
    </Box>
  );
}
