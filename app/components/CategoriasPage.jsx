'use client';

import {
  Box, TextField, Button, Typography, Stack, Snackbar, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GestionCategoriasContent() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [clave, setClave] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [nueva, setNueva] = useState('');
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ open: false, texto: '', tipo: 'success' });

  useEffect(() => {
    const claveGuardada = localStorage.getItem('clave_categoria');
    if (claveGuardada === '7926') {
      setAutorizado(true);
      cargarCategorias();
    }
  }, []);

  const verificarClave = () => {
    if (clave === '7926') {
      localStorage.setItem('clave_categoria', '7926');
      setAutorizado(true);
      cargarCategorias();
    } else {
      setMensaje({ open: true, texto: '❌ No estás autorizado', tipo: 'error' });
      router.push('/dashboard/equipos');
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('❌ Error al cargar:', error);
    }
  };

  const crearCategoria = async () => {
    if (!nueva.trim()) return;
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nueva.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setNueva('');
      setMensaje({ open: true, texto: '✅ Categoría creada', tipo: 'success' });
      cargarCategorias();
    } else {
      setMensaje({ open: true, texto: data.error || '❌ Error al crear', tipo: 'error' });
    }
  };

  const eliminarCategoria = async (nombre) => {
    const confirmar = confirm(`¿Eliminar "${nombre}"?`);
    if (!confirmar) return;
    const res = await fetch(`/api/categorias/${encodeURIComponent(nombre)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setMensaje({ open: true, texto: '✅ Eliminado', tipo: 'success' });
      cargarCategorias();
    } else {
      setMensaje({ open: true, texto: '❌ Error al eliminar', tipo: 'error' });
    }
  };

  const editarCategoria = async () => {
    const res = await fetch(`/api/categorias/${encodeURIComponent(editando.old)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevo: editando.new }),
    });
    if (res.ok) {
      setMensaje({ open: true, texto: '✅ Editado', tipo: 'success' });
      setEditando(null);
      cargarCategorias();
    } else {
      setMensaje({ open: true, texto: '❌ Error al editar', tipo: 'error' });
    }
  };

  if (!autorizado) {
    return (
      <Box sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h6">🔐 Ingresa la clave para continuar</Typography>
        <TextField
          fullWidth
          label="Clave"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button variant="contained" onClick={verificarClave}>Acceder</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>Gestión de Categorías</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Nueva categoría"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <Button variant="contained" onClick={crearCategoria}>Crear</Button>
      </Stack>

      <Stack spacing={2}>
        {categorias.map((cat) => (
          <Box
            key={cat}
            sx={{
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#f9f9f9'
            }}
          >
            {editando?.old === cat ? (
              <>
                <TextField
                  value={editando.new}
                  onChange={(e) =>
                    setEditando((prev) => ({ ...prev, new: e.target.value }))
                  }
                  size="small"
                />
                <Button variant="contained" onClick={editarCategoria}>Guardar</Button>
              </>
            ) : (
              <>
                <Typography>{cat}</Typography>
                <Box>
                  <IconButton onClick={() => setEditando({ old: cat, new: cat })}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => eliminarCategoria(cat)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        ))}
      </Stack>

      <Snackbar
        open={mensaje.open}
        autoHideDuration={3000}
        onClose={() => setMensaje((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={mensaje.tipo}>{mensaje.texto}</Alert>
      </Snackbar>
    </Box>
  );
}
