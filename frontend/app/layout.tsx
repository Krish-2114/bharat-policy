import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ErrorBoundaryWrapper from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import FloatingChatbot from '@/components/ui/FloatingChatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bharat Policy Twin',
  description: 'Enterprise AI SaaS for Policy Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <ThemeProvider>
          <ErrorBoundaryWrapper>
            <AuthProvider>
              <DashboardLayout>{children}</DashboardLayout>
              <FloatingChatbot />
            </AuthProvider>
          </ErrorBoundaryWrapper>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
