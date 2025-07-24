'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Divider, Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CrearMaquina from './CrearMaquina';
import TablaMaquinas from './TablaMaquinas';

export default function EquiposPage() {
  const [tab, setTab] = useState(0);
  const [refrescarLista, setRefrescarLista] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleMaquinaCreada = () => {
    setRefrescarLista((prev) => !prev);
    setTab(1);
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          backgroundColor: '#fff',
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          centered={!isMobile}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Crear equipo" />
          <Tab label="Listado de equipos" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {tab === 0 && <CrearMaquina onCreado={handleMaquinaCreada} />}
        {tab === 1 && <TablaMaquinas refrescar={refrescarLista} />}
      </Paper>
    </Box>
  );
}
