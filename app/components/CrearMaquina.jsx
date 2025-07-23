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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Close';

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio'];

export default function CrearMaquina({ onCreado }) {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    estado: '',
    fecha: dayjs(),
  });
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
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
      setImagen(archivo);
      setPreviewUrl(URL.createObjectURL(archivo));
    }
  };

  const eliminarImagen = () => {
    setImagen(null);
    setPreviewUrl(null);
    inputRef.current.value = null;
  };

  const handleSubmit = async () => {
    setMensaje('');
    if (!imagen) return setMensaje('⚠️ Debes subir una imagen');
    setCargando(true);

    try {
      const imgData = new FormData();
      imgData.append('file', imagen);

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: imgData,
      });

      const uploadData = await resUpload.json();

      if (!resUpload.ok || !uploadData.url) {
        throw new Error('Error al subir la imagen');
      }

      const url = uploadData.url;

      const resMaquina = await fetch('/api/maquinas', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          fecha: formData.fecha.toISOString(),
          imagenUrl: url,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const resData = await resMaquina.json();

      if (resMaquina.ok) {
        setMensaje('✅ Máquina creada correctamente');
        setFormData({ nombre: '', ubicacion: '', estado: '', fecha: dayjs() });
        eliminarImagen();
        if (onCreado) onCreado(); // 🔁 Notifica al padre
      } else {
        const errorMsg = resData?.error || '❌ Error al guardar la máquina';
        setMensaje(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error inesperado: ' + err.message);
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

      {mensaje && <Typography>{mensaje}</Typography>}
    </Stack>
  );
}
