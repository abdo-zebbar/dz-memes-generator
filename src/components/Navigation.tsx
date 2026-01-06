'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Edit,
  Users,
  Mail,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Mail as MailIcon,
  Lock
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Languages } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navigation = [
  { key: 'nav.home', href: '/', icon: Home },
  { key: 'nav.create', href: '/editor', icon: Edit },
  { key: 'nav.community', href: '/community', icon: Users },
  { key: 'nav.contact', href: '/contact', icon: Mail },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme, language, setLanguage, t } = useTheme()
  const isRTL = language === 'ar'

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })

      if (error) {
        alert(error.message)
      } else {
        setAuthModalOpen(false)
        setAuthEmail('')
        setAuthPassword('')
      }
    } catch (error) {
      alert('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSignInClick = () => {
    setAuthModalOpen(true)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between" style={{gap: '32px'}}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex flex-shrink-0 items-center px-2">
              <Link href="/" className="text-2xl font-bold text-primary">
                ڨصرة - Guesra
              </Link>
            </div>
              <div className={`hidden sm:flex ${isRTL ? 'sm:space-x-reverse sm:space-x-8' : 'sm:space-x-8'}`} style={{marginInlineStart: '32px'}}>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {t(item.key as any)}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className={`hidden sm:flex sm:items-center ${isRTL ? 'sm:space-x-reverse sm:space-x-6' : 'sm:space-x-6'}`} style={{marginInlineStart: '16px'}}>
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Languages className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Auth Buttons */}
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {user ? (
                <>
                  <span className="text-sm text-slate-600">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignInClick}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.signIn' as any)}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      console.log('Sign Up button clicked - navigating to auth page')
                      window.location.href = '/auth'
                    }}
                  >
                    {t('nav.getStarted' as any)}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className={`flex items-center sm:hidden ${isRTL ? 'flex-row-reverse' : ''}`} style={{gap: '8px'}}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden"
          >
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                      isActive
                        ? 'border-primary bg-accent text-primary'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-5 w-5" />
                      {t(item.key as any)}
                    </div>
                  </Link>
                )
              })}
              <div className="border-t border-border pt-4">
                <div className="space-y-2 px-3">
                  {user ? (
                    <>
                      <div className="text-sm text-muted-foreground px-3 py-2">
                        {user.email}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={handleSignInClick}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {t('nav.signIn' as any)}
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white shadow-xl font-semibold hover:scale-105 hover:shadow-2xl transition transform rounded-xl"
                        onClick={() => {
                          console.log('Sign Up button clicked - navigating to auth page')
                          window.location.href = '/auth'
                        }}
                      >
                        {t('nav.getStarted' as any)}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Sign In to ڨصرة - Guesra</CardTitle>
                  <CardDescription>
                    Enter your email and password to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="auth-email"
                          type="email"
                          placeholder="you@example.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="auth-password" className="block text-sm font-medium text-foreground mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="auth-password"
                          type="password"
                          placeholder="Your password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAuthModalOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading || !authEmail || !authPassword}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </div>
                  </form>
                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      className="text-sm"
                      onClick={() => setAuthModalOpen(false)}
                    >
                      Don't have an account? Sign up on the auth page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}