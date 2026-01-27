'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/icons';

interface LoginProps {
  onBack?: () => void;
}

export function Login({ onBack }: LoginProps) {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      // Attempt login only (no account creation)
      const success = await login(username.trim(), password);
      
      if (!success) {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      } else {
        setIsLoading(false);
        // Login successful - state will update and App will re-render
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-stone)]">
              Don't have an account?{' '}
              <button
                onClick={onBack}
                className="text-[var(--color-sage)] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

