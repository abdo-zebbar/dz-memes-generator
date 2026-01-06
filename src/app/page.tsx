'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/components/ThemeProvider'

export default function Home() {
  const { t } = useTheme() as any

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t('home.title' as any)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t('home.subtitle' as any)}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                asChild
                size="lg"
                className="relative overflow-hidden px-8 py-4 rounded-[14px] shadow-2xl text-white font-bold text-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 animate-pulse hover:animate-none hover:scale-105 hover:shadow-[0_4px_32px_rgba(120,51,255,0.3)] focus:ring-4 focus:ring-indigo-300 transition-all"
              >
                <Link href="/editor" className="flex items-center gap-3" style={{fontFamily: 'Inter, sans-serif'}}>
                  <span className="tracking-wide">{t('home.startCreating' as any)}</span>
                  <ArrowRight className="h-5 w-5 rtl:ml-0 rtl:mr-2 ltr:ml-2 ltr:mr-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/community">
                  {t('home.exploreCommunity' as any)}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('home.whyChoose' as any)}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('home.description' as any)}
            </p>
          </motion.div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, featureIdx) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: featureIdx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col"
                >
                  <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      {t(feature.key as any)}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                      <p className="flex-auto">{t(feature.descKey as any)}</p>
                    </dd>
                  </div>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('home.readyToCreate' as any)}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {t('home.ctaDesc' as any)}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/editor">
                  {t('home.createNow' as any)}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth">
                  {t('home.signUpFree' as any)}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    key: 'home.advancedEditor',
    descKey: 'home.editorDesc',
    icon: Zap,
  },
  {
    key: 'home.vibrantCommunity',
    descKey: 'home.communityDesc',
    icon: Users,
  },
  {
    key: 'home.trendingContent',
    descKey: 'home.trendingDesc',
    icon: TrendingUp,
  },
  {
    key: 'home.highQuality',
    descKey: 'home.qualityDesc',
    icon: Star,
  },
]