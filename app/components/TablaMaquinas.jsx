'use client';

import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Pagination, Modal, Box,
  IconButton, Button, MenuItem, Stack, Snackbar, Alert, useMediaQuery
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
  p: 4,
  borderRadius: 3,
};

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio'];

export default function TablaMaquinas({ refrescar }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [maquinas, setMaquinas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalImagen, setModalImagen] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [maquinaEditando, setMaquinaEditando] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
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
  }, [refrescar]);

  const handleEliminar = async (id) => {
    const clave = prompt('🔒 Ingresa la clave para eliminar:');
    if (clave !== '7926') return alert('❌ Clave incorrecta');

    if (!confirm('¿Seguro que deseas eliminar esta máquina?')) return;

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
    setNuevaImagen(null);
    setModalEditar(true);
  };

  const extraerPublicId = (url) => {
    try {
      const partes = url.split('/upload/');
      return partes[1]?.split('.')[0];
    } catch {
      return null;
    }
  };

  const handleGuardarEdicion = async () => {
    const { _id, nombre, ubicacion, estado, fecha, imagenUrl } = maquinaEditando;
    let urlFinal = imagenUrl;

    if (nuevaImagen) {
      const formData = new FormData();
      formData.append('file', nuevaImagen);
      const publicId = extraerPublicId(imagenUrl);
      if (publicId) formData.append('public_id', publicId);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadRes.ok && uploadData?.url) {
        urlFinal = uploadData.url;
      } else {
        return alert('❌ Error al subir imagen');
      }
    }

    const res = await fetch(`/api/maquinas/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre, ubicacion, estado,
        fecha: fecha.toISOString(),
        imagenUrl: urlFinal,
      }),
    });

    if (res.ok) {
      setMensaje('✅ Máquina actualizada');
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
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
      <TextField
        fullWidth
        label="Buscar máquina o ubicación"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ my: 3 }}
      />

      {isMobile ? (
        <Stack spacing={2}>
          {paginadas.map((fila) => (
            <Box key={fila._id} sx={{
              p: 2, border: '1px solid #ddd', borderRadius: 3, boxShadow: 1, bgcolor: '#fff'
            }}>
              <Typography><strong>Máquina:</strong> {fila.nombre}</Typography>
              <Typography><strong>Ubicación:</strong> {fila.ubicacion}</Typography>
              <Typography><strong>Estado:</strong> {fila.estado}</Typography>
              <Typography><strong>Fecha:</strong> {new Date(fila.fecha).toLocaleDateString()}</Typography>
              {fila.imagenUrl && (
                <img
                  src={fila.imagenUrl}
                  alt="mini"
                  style={{ width: '100%', marginTop: 10, borderRadius: 6 }}
                  onClick={() => setModalImagen(fila.imagenUrl)}
                />
              )}
              <Stack direction="row" spacing={1} mt={2}>
                <Button variant="outlined" size="small" onClick={() => handleEditar(fila)}>Editar</Button>
                <Button variant="outlined" size="small" color="error" onClick={() => handleEliminar(fila._id)}>Eliminar</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
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
              {paginadas.map((fila) => (
                <TableRow key={fila._id}>
                  <TableCell>{fila.nombre}</TableCell>
                  <TableCell>{fila.ubicacion}</TableCell>
                  <TableCell>{fila.estado}</TableCell>
                  <TableCell>{new Date(fila.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <img
                      src={fila.imagenUrl}
                      alt="mini"
                      style={{ width: 60, height: 60, cursor: 'pointer', borderRadius: 6 }}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Pagination
        count={totalPaginas}
        page={pagina}
        onChange={(_, value) => setPagina(value)}
        sx={{ mt: 3, justifyContent: 'center', display: 'flex' }}
      />

      <Modal open={!!modalImagen} onClose={() => setModalImagen('')}>
        <Box sx={styleModal}>
          <img src={modalImagen} alt="ampliada" style={{ width: '100%', borderRadius: 6 }} />
        </Box>
      </Modal>

      <Modal open={modalEditar} onClose={() => setModalEditar(false)}>
        <Box sx={styleModal}>
          <Stack spacing={2}>
            <TextField label="Nombre" value={maquinaEditando?.nombre || ''}
              onChange={(e) => setMaquinaEditando(prev => ({ ...prev, nombre: e.target.value }))} />
            <TextField label="Ubicación" value={maquinaEditando?.ubicacion || ''}
              onChange={(e) => setMaquinaEditando(prev => ({ ...prev, ubicacion: e.target.value }))} />
            <TextField select label="Estado" value={maquinaEditando?.estado || ''}
              onChange={(e) => setMaquinaEditando(prev => ({ ...prev, estado: e.target.value }))}>
              {estados.map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
            </TextField>
            <TextField
              type="date"
              label="Fecha"
              value={dayjs(maquinaEditando?.fecha).format('YYYY-MM-DD')}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({
                  ...prev,
                  fecha: dayjs(e.target.value),
                }))
              }
            />
            <input type="file" accept="image/*" onChange={(e) => setNuevaImagen(e.target.files[0])} />
            <Button variant="contained" onClick={handleGuardarEdicion}>Guardar Cambios</Button>
          </Stack>
        </Box>
      </Modal>

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
