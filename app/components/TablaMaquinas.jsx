'use client';

import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Pagination, Modal, Box,
  IconButton, Button, MenuItem, Stack, Snackbar, Alert,
  Typography, useMediaQuery
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

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio', 'Por Desechar'];

export default function TablaMaquinas({ refrescar, categoriaSeleccionada }) {
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
  const [categorias, setCategorias] = useState([]);
  const notificadas = useRef(new Set());
  const porPagina = 10;

  const cargarMaquinas = async () => {
    const res = await fetch('/api/maquinas');
    const data = await res.json();
    setMaquinas(data);
  };

  const cargarCategorias = async () => {
    const res = await fetch('/api/categorias');
    const data = await res.json();
    setCategorias(data);
  };

  useEffect(() => {
    cargarMaquinas();
    cargarCategorias();
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [refrescar]);

  // 🚨 Notificación automática si estado es "Por Desechar" y han pasado 2 días
  useEffect(() => {
    const ahora = dayjs();
    maquinas.forEach((m) => {
      const estadoLower = (m.estado || '').toLowerCase();
      const fecha = m.fecha ? dayjs(m.fecha) : null;

      if (
        estadoLower.includes('por desechar') &&
        fecha &&
        ahora.diff(fecha, 'day') >= 2 &&
        !notificadas.current.has(m._id)
      ) {
        if (Notification.permission === 'granted') {
          new Notification('⚠️ Recordatorio de mantenimiento', {
            body: `La máquina "${m.nombre}" lleva más de 2 días marcada como "por desechar".`,
          });
          notificadas.current.add(m._id);
        }
      }
    });
  }, [maquinas]);

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
    setNuevaImagen(null);
    setModalEditar(true);
  };

  const extraerPublicId = (url) => {
    try {
      const partes = url.split('/upload/');
      if (partes.length < 2) return null;
      return partes[1].split('.')[0];
    } catch {
      return null;
    }
  };

  const handleGuardarEdicion = async () => {
    const { _id, nombre, ubicacion, estado, fecha, imagenUrl, categoria } = maquinaEditando;

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
        alert('❌ Error al reemplazar la imagen');
        return;
      }
    }

    const res = await fetch(`/api/maquinas/${_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre,
        ubicacion,
        estado,
        fecha: fecha.toISOString(),
        imagenUrl: urlFinal,
        categoria
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
    (m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     m.ubicacion.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!categoriaSeleccionada || (m.categoria || '').toLowerCase() === categoriaSeleccionada.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const paginadas = filtradas.slice(inicio, inicio + porPagina);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, mb: 5 }}>
      <TextField
        fullWidth
        label="Buscar máquina o ubicación"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ my: 3 }}
      />

      {filtradas.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No se registran elementos en esta categoría.
        </Typography>
      ) : !isMobile ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Máquina</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Categoría</TableCell>
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
                  <TableCell>{fila.categoria || 'Equipos'}</TableCell>
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
      ) : (
        <Stack spacing={2}>
          {paginadas.map((fila) => (
            <Box key={fila._id} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1, bgcolor: '#fafafa' }}>
              <Typography><strong>Máquina:</strong> {fila.nombre}</Typography>
              <Typography><strong>Ubicación:</strong> {fila.ubicacion}</Typography>
              <Typography><strong>Estado:</strong> {fila.estado}</Typography>
              <Typography><strong>Fecha:</strong> {new Date(fila.fecha).toLocaleDateString()}</Typography>
              <Typography><strong>Categoría:</strong> {fila.categoria || 'Equipos'}</Typography>
              {fila.imagenUrl && (
                <img
                  src={fila.imagenUrl}
                  alt="mini"
                  style={{ width: '100%', marginTop: 8, borderRadius: 6 }}
                  onClick={() => setModalImagen(fila.imagenUrl)}
                />
              )}
              <Box sx={{ mt: 1 }}>
                <Button size="small" onClick={() => handleEditar(fila)}>Editar</Button>
                <Button size="small" color="error" onClick={() => handleEliminar(fila._id)}>Eliminar</Button>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {filtradas.length > 0 && (
        <Pagination
          count={totalPaginas}
          page={pagina}
          onChange={(_, value) => setPagina(value)}
          sx={{ mt: 3, justifyContent: 'center', display: 'flex' }}
        />
      )}

      {/* Modal imagen */}
      <Modal open={!!modalImagen} onClose={() => setModalImagen('')}>
        <Box sx={styleModal}>
          <img src={modalImagen} alt="ampliada" style={{ width: '100%', borderRadius: 6 }} />
        </Box>
      </Modal>

      {/* Modal editar */}
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
            <TextField
              select
              label="Categoría"
              value={maquinaEditando?.categoria || ''}
              onChange={(e) =>
                setMaquinaEditando((prev) => ({
                  ...prev,
                  categoria: e.target.value,
                }))
              }
            >
              {categorias.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <input type="file" accept="image/*" onChange={(e) => setNuevaImagen(e.target.files[0])} />
            <Button variant="contained" onClick={handleGuardarEdicion}>
              Guardar Cambios
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar */}
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
    </Box>
  );
}
