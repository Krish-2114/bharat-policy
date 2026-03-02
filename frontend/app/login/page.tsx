import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Bharat Policy Twin',
  description: 'Sign in to the policy twin enterprise portal',
};

export default function LoginPage() {
  return <LoginForm />;
}
