import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Private Poker Faucet',
  description: 'Self-service PPDC test funding for Private Poker.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
