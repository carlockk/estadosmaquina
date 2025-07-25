'use client';

import { Suspense } from 'react';
import GestionCategoriasContent from '../../components/CategoriasPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando categorías...</div>}>
      <GestionCategoriasContent />
    </Suspense>
  );
}
