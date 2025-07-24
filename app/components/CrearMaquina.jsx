'use client';

import { useState, useRef } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Close';

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio'];

export default function CrearMaquina() {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    estado: '',
    fecha: dayjs(),
  });

  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', tipo: 'success' });

  const inputRef = useRef();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFecha = (nuevaFecha) => {
    setFormData((prev) => ({ ...prev, fecha: nuevaFecha }));
  };

  const handleImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      if (!archivo.type.startsWith('image/')) {
        mostrarNotificacion('❌ Solo se permiten imágenes', 'error');
        return;
      }
      setImagen(archivo);
      setPreviewUrl(URL.createObjectURL(archivo));
    }
  };

  const eliminarImagen = () => {
    setImagen(null);
    setPreviewUrl(null);
    inputRef.current.value = null;
  };

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const handleSubmit = async () => {
    if (!imagen) return mostrarNotificacion('⚠️ Debes subir una imagen', 'warning');
    if (!formData.nombre || !formData.ubicacion || !formData.estado) {
      return mostrarNotificacion('⚠️ Todos los campos son obligatorios', 'warning');
    }

    setCargando(true);

    try {
      // Subir imagen
      const imgData = new FormData();
      imgData.append('file', imagen);

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: imgData,
      });

      if (!resUpload.ok) {
        const errorText = await resUpload.text();
        console.error('❌ Error al subir imagen:', errorText);
        throw new Error('Error al subir la imagen. Revisa Cloudinary o el servidor.');
      }

      const uploadData = await resUpload.json();
      if (!uploadData?.url) {
        throw new Error('No se recibió la URL de la imagen');
      }

      // Guardar en DB
      const resMaquina = await fetch('/api/maquinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fecha: formData.fecha.toISOString(),
          imagenUrl: uploadData.url,
        }),
      });

      const resData = await resMaquina.json();

      if (resMaquina.ok) {
        mostrarNotificacion('✅ Máquina creada correctamente', 'success');
        setFormData({ nombre: '', ubicacion: '', estado: '', fecha: dayjs() });
        eliminarImagen();
      } else {
        throw new Error(resData?.error || '❌ Error al guardar la máquina');
      }
    } catch (err) {
      console.error(err);
      mostrarNotificacion(`❌ Error: ${err.message}`, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5">Crear Máquina</Typography>

      <TextField
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />
      <TextField
        label="Ubicación"
        name="ubicacion"
        value={formData.ubicacion}
        onChange={handleChange}
        required
      />
      <TextField
        select
        label="Estado"
        name="estado"
        value={formData.estado}
        onChange={handleChange}
        required
      >
        {estados.map((estado) => (
          <MenuItem key={estado} value={estado}>
            {estado}
          </MenuItem>
        ))}
      </TextField>

      <DatePicker
        label="Fecha"
        value={formData.fecha}
        onChange={handleFecha}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImagen}
        ref={inputRef}
        style={{ marginTop: '10px' }}
      />

      {previewUrl && (
        <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          />
          <IconButton
            onClick={eliminarImagen}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#fff',
              boxShadow: 1,
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={cargando}
      >
        {cargando ? <CircularProgress size={24} /> : 'Guardar'}
      </Button>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={() => setNotificacion((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotificacion((prev) => ({ ...prev, open: false }))}
          severity={notificacion.tipo}
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
