// línea 1
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  TextField, Button, MenuItem, Stack, Typography, CircularProgress,
  Box, IconButton, Snackbar, Alert, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

const estados = ['Activa', 'En Mantenimiento', 'Fuera de Servicio'];

export default function CrearMaquina() {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    estado: '',
    fecha: dayjs(),
  });

  const [categoria, setCategoria] = useState('');
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', tipo: 'success' });

  const inputRef = useRef();

  const obtenerCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      setCategoriasDisponibles([...new Set(data)]);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

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

  const handleCategoriaNueva = async (_, newValue) => {
    if (!newValue) return;

    if (!categoriasDisponibles.includes(newValue)) {
      const clave = prompt('🔒 Ingrese la clave para agregar nueva categoría:');
      if (clave === '7926') {
        try {
          const res = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newValue }),
          });

          if (!res.ok) throw new Error('❌ Error al guardar categoría');

          mostrarNotificacion('✅ Categoría nueva agregada', 'success');
          setCategoria(newValue);
          await obtenerCategorias();
        } catch (error) {
          console.error('❌ Error al guardar categoría:', error);
          mostrarNotificacion('❌ No se pudo guardar la categoría', 'error');
          setCategoria('');
        }
      } else {
        mostrarNotificacion('❌ Clave incorrecta. Categoría no agregada.', 'error');
        setCategoria('');
      }
    } else {
      setCategoria(newValue);
    }
  };

  const handleSubmit = async () => {
    if (!imagen) return mostrarNotificacion('⚠️ Debes subir una imagen', 'warning');
    if (!formData.nombre || !formData.ubicacion || !formData.estado || !categoria) {
      return mostrarNotificacion('⚠️ Todos los campos son obligatorios', 'warning');
    }

    setCargando(true);

    try {
      const imgData = new FormData();
      imgData.append('file', imagen);

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: imgData,
      });

      if (!resUpload.ok) throw new Error('❌ Error al subir la imagen');

      const uploadData = await resUpload.json();
      if (!uploadData?.url) throw new Error('No se recibió la URL de la imagen');

      const resMaquina = await fetch('/api/maquinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fecha: formData.fecha.toISOString(),
          imagenUrl: uploadData.url,
          categoria,
        }),
      });

      const resData = await resMaquina.json();

      if (resMaquina.ok) {
        mostrarNotificacion('✅ Máquina creada correctamente', 'success');
        setFormData({ nombre: '', ubicacion: '', estado: '', fecha: dayjs() });
        eliminarImagen();
        setCategoria('');
      } else {
        throw new Error(resData?.error || '❌ Error al guardar la máquina');
      }
    } catch (err) {
      console.error(err);
      mostrarNotificacion(err.message || '❌ Error desconocido', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 500, mx: 'auto', mt: 4, px: 2 }}>

      <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
      <TextField label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required />

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

      <Autocomplete
        freeSolo
        options={categoriasDisponibles}
        value={categoria}
        onChange={handleCategoriaNueva}
        renderInput={(params) => (
          <TextField {...params} label="Categoría" helperText="Puedes escribir una nueva (requiere clave)" />
        )}
      />

      <DatePicker label="Fecha" value={formData.fecha} onChange={handleFecha} />

      <input type="file" accept="image/*" onChange={handleImagen} ref={inputRef} style={{ marginTop: '10px' }} />

      {previewUrl && (
        <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <IconButton
            onClick={eliminarImagen}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', boxShadow: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={cargando}>
        {cargando ? <CircularProgress size={24} /> : 'Guardar'}
      </Button>

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
