'use client';

import { useSearchParams } from 'next/navigation';
import TablaMaquinas from '../../components/TablaMaquinas';
import { Box, Typography } from '@mui/material';
import { Suspense } from 'react';

function EquiposPorCategoriaContent() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria') || 'Equipos';

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Elementos en categoría: {categoria}
      </Typography>
      <TablaMaquinas categoriaSeleccionada={categoria} />
    </Box>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando equipos...</div>}>
      <EquiposPorCategoriaContent />
    </Suspense>
  );
}
