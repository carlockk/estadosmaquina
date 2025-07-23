'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Divider } from '@mui/material';
import CrearMaquina from './CrearMaquina';
import TablaMaquinas from './TablaMaquinas'; // tu tabla completa

export default function EquiposPage() {
  const [tab, setTab] = useState(0);
  const [refrescarLista, setRefrescarLista] = useState(false);

  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleMaquinaCreada = () => {
    setRefrescarLista((prev) => !prev); // 🔁 Trigger actualización
    setTab(1); // ✅ Cambia a la pestaña del listado
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="Crear equipo" />
        <Tab label="Listado de equipos" />
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {tab === 0 && <CrearMaquina onCreado={handleMaquinaCreada} />}
      {tab === 1 && <TablaMaquinas refrescar={refrescarLista} />}
    </Box>
  );
}
