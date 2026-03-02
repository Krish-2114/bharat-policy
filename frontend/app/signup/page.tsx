import SignupForm from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Bharat Policy Twin',
  description: 'Create a new policy twin enterprise account',
};

export default function SignupPage() {
  return <SignupForm />;
}
