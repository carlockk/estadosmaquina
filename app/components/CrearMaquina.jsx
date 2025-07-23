"use client";
import { useState } from "react";

export default function CrearMaquina({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una imagen");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        onUploadSuccess && onUploadSuccess(data.url);
      } else {
        alert("❌ Error al subir imagen");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error en la petición");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>📸 Subir Imagen</h2>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && <img src={preview} alt="preview" width="200" />}
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Subiendo..." : "Subir"}
      </button>
      {url && <p>✅ Imagen subida: <a href={url} target="_blank">{url}</a></p>}
    </div>
  );
}
