'use client';
import { useState } from 'react';

export default function CrearMaquina() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('⚠️ Debes seleccionar una imagen.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      setUrl(data.url);
    } catch (err) {
      console.error('❌ Error al subir:', err);
      setError(err.message || 'Fallo inesperado');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📸 Subir Imagen de Máquina</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading} style={{ marginTop: '1rem' }}>
        {uploading ? 'Subiendo...' : 'Subir'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {url && (
        <div style={{ marginTop: '1rem' }}>
          <p>✅ Imagen subida con éxito:</p>
          <img src={url} alt="Preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}
