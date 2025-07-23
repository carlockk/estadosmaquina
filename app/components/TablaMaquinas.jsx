'use client';

import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Pagination, Modal, Box,
  IconButton, Button, MenuItem, Stack, Snackbar, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio'];

export default function TablaMaquinas({ refrescar }) {
  const [maquinas, setMaquinas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalImagen, setModalImagen] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [maquinaEditando, setMaquinaEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const notificadas = useRef(new Set());
  const porPagina = 10;

  const cargarMaquinas = async () => {
    const res = await fetch('/api/maquinas');
    const data = await res.json();
    setMaquinas(data);
  };

  useEffect(() => {
    cargarMaquinas();
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [refrescar]); // 🔁 Se recarga cuando cambia "refrescar"

  const handleEliminar = async (id) => {
    const clave = prompt('Ingresa la clave para eliminar:');
    if (clave !== '7926') {
      alert('❌ Clave incorrecta');
      return;
    }

    const confirmacion = confirm('¿Seguro que deseas eliminar esta máquina?');
    if (!confirmacion) return;

    const res = await fetch(`/api/maquinas/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Eliminado correctamente');
      cargarMaquinas();
    } else {
      alert('❌ Error al eliminar');
    }
  };

  const handleEditar = (maquina) => {
    setMaquinaEditando({ ...maquina, fecha: dayjs(maquina.fecha) });
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    const { _id, nombre, ubicacion, estado, fecha } = maquinaEditando;

    const res = await fetch(`/api/maquinas/${_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre,
        ubicacion,
        estado,
        fecha: fecha.toISOString(),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setMensaje('✅ Actualizado correctamente');
      setMostrarMensaje(true);
      setModalEditar(false);
      cargarMaquinas();
    } else {
      alert('❌ Error al actualizar');
    }
  };

  const filtradas = maquinas.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const paginadas = filtradas.slice(inicio, inicio + porPagina);

  return (
    <>
      <TextField
        fullWidth
        label="Buscar máquina o ubicación"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ my: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Máquina</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginadas.map((fila) => {
              const diasPasados = Math.floor(
                (new Date() - new Date(fila.fecha)) / (1000 * 60 * 60 * 24)
              );

              const alerta =
                (fila.estado === 'En Mantenimiento' && diasPasados >= 5) ||
                (fila.estado === 'Fuera de Servicio' && diasPasados >= 3);

              if (
                alerta &&
                Notification.permission === 'granted' &&
                !notificadas.current.has(fila._id)
              ) {
                new Notification(`⚠️ ${fila.nombre}`, {
                  body: `Estado: ${fila.estado} desde hace ${diasPasados} días`,
                });
                notificadas.current.add(fila._id);
              }

              return (
                <TableRow
                  key={fila._id}
                  sx={alerta ? { backgroundColor: '#fff3cd' } : {}}
                >
                  <TableCell>{fila.nombre}</TableCell>
                  <TableCell>{fila.ubicacion}</TableCell>
                  <TableCell>{fila.estado}</TableCell>
                  <TableCell>{new Date(fila.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <img
                      src={fila.imagenUrl}
                      alt="mini"
                      style={{
                        width: 60,
                        height: 60,
                        cursor: 'pointer',
                        objectFit: 'cover',
                      }}
                      onClick={() => setModalImagen(fila.imagenUrl)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditar(fila)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleEliminar(fila._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={totalPaginas}
        page={pagina}
        onChange={(_, value) => setPagina(value)}
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />

      {/* Modal Imagen */}
      <Modal open={!!modalImagen} onClose={() => setModalImagen('')}>
        <Box sx={styleModal}>
          <img
            src={modalImagen}
            alt="ampliada"
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </Box>
      </Modal>

      {/* Modal Editar */}
      <Modal open={modalEditar} onClose={() => setModalEditar(false)}>
        <Box sx={styleModal}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={maquinaEditando?.nombre || ''}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({ ...prev, nombre: e.target.value }))
              }
            />
            <TextField
              label="Ubicación"
              value={maquinaEditando?.ubicacion || ''}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({ ...prev, ubicacion: e.target.value }))
              }
            />
            <TextField
              select
              label="Estado"
              value={maquinaEditando?.estado || ''}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({ ...prev, estado: e.target.value }))
              }
            >
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha"
              type="date"
              value={dayjs(maquinaEditando?.fecha).format('YYYY-MM-DD')}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({
                  ...prev,
                  fecha: dayjs(e.target.value),
                }))
              }
            />
            <Button variant="contained" onClick={handleGuardarEdicion}>
              Guardar Cambios
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar de mensaje */}
      <Snackbar
        open={mostrarMensaje}
        autoHideDuration={3000}
        onClose={() => setMostrarMensaje(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </>
  );
}
