'use client';

import CrearMaquina from '../../components/CrearMaquina';
import { Box, Typography, Divider } from '@mui/material';

export default function CrearElementoPage() {
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
