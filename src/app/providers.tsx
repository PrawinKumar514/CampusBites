
'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'sonner';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'bg-black border border-yellow-500 text-neutral-200',
              title: 'text-white',
              description: 'text-neutral-400',
              actionButton: 'bg-yellow-500 text-black',
              cancelButton: 'bg-neutral-800 text-white',
              closeButton: 'border-neutral-700 bg-black hover:bg-neutral-900',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
