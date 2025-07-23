import { CssBaseline } from '@mui/material';
import ClientWrapper from './ClientWrapper';

export const metadata = {
  title: 'Estado de Máquinas',
  description: 'Sistema de registro y control de máquinas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CssBaseline />
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
