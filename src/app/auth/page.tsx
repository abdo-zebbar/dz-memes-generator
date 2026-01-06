'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabaseClient'

type AuthStep = 'email' | 'success'

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Send OTP to the user's email (since email confirmation is disabled, this will automatically sign them in)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Create user if they don't exist
        }
      })

      if (error) {
        throw error
      }

      // Show success message and redirect
      setStep('success')
      setTimeout(() => {
        router.push('/editor')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome to dz memes</CardTitle>
                  <CardDescription>
                    Enter your email to sign in or create an account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? 'Sending magic link...' : 'Send Magic Link'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}


          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Redirecting you now...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}