'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/icons';

interface SignUpProps {
  onBack?: () => void;
}

export function SignUp({ onBack }: SignUpProps) {
  const { signUp } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      setIsLoading(false);
      return;
    }

    try {
    // Attempt sign up
      const success = await signUp(username.trim(), password);
    
    if (!success) {
      setError('Unable to create account. Please try again.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      // Sign up successful - state will update and App will re-render
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error?.message === 'USERNAME_TAKEN') {
        setError('Username already taken. Please choose a different one.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--color-sand)] via-white to-[var(--color-sage-light)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <button
              onClick={onBack}
              className="text-sm text-[var(--color-stone)] hover:text-[var(--color-sage)] hover:underline transition-colors"
            >
              ← Go back to home
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-[var(--color-charcoal)] mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] focus:outline-none transition-colors text-[var(--color-charcoal)]"
                placeholder="Choose a username"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-[var(--color-charcoal)] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] focus:outline-none transition-colors text-[var(--color-charcoal)]"
                placeholder="Create a password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-[var(--color-charcoal)] mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] focus:outline-none transition-colors text-[var(--color-charcoal)]"
                placeholder="Confirm your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[var(--color-agitated)]/10 border-2 border-[var(--color-agitated)] rounded-xl"
              >
                <p className="text-sm text-[var(--color-agitated)]">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-stone)]">
              Already have an account?{' '}
              <button
                onClick={onBack}
                className="text-[var(--color-sage)] font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

