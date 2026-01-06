'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, MessageCircle, Share, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/components/ThemeProvider'
import { supabase } from '@/lib/supabaseClient'

interface Meme {
  id: string
  title: string
  image_url: string
  user_id: string
  upvotes: number
  downvotes: number
  created_at: string
  profiles?: {
    username: string | null
    full_name: string | null
  }
}


interface SharedMeme {
  id: string
  title: string
  imageData: string // Base64 encoded canvas
  user_id: string
  likes: number
  comments: number
  shares: number
  created_at: string
  profiles: {
    username: string | null
    full_name: string | null
  }
  layers?: any[]
}

export default function CommunityPage() {
  const { t } = useTheme()
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'trending' | 'latest'>('trending')
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set())
  const [selectedMeme, setSelectedMeme] = useState<SharedMeme | Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memes, setMemes] = useState<Meme[]>([])

  // Open meme detail modal
  const openMemeModal = (meme: SharedMeme | Meme) => {
    setSelectedMeme(meme)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setSelectedMeme(null)
    setIsModalOpen(false)
  }

  useEffect(() => {
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching memes:', error)
        return
      }

      setMemes(data || [])
    } catch (error) {
      console.error('Error fetching memes:', error)
    } finally {
      setLoading(false)
    }
  }

  const [voteCounts, setVoteCounts] = useState<Record<string, { upvotes: number; downvotes: number }>>({})

  const handleVote = (memeId: string, voteType: 'up' | 'down') => {
    if (votedPosts.has(memeId)) return

    setVoteCounts(prev => ({
      ...prev,
      [memeId]: {
        upvotes: voteType === 'up' ? (prev[memeId]?.upvotes || memes.find(m => m.id === memeId)?.upvotes || 0) + 1 : (prev[memeId]?.upvotes || memes.find(m => m.id === memeId)?.upvotes || 0),
        downvotes: voteType === 'down' ? (prev[memeId]?.downvotes || memes.find(m => m.id === memeId)?.downvotes || 0) + 1 : (prev[memeId]?.downvotes || memes.find(m => m.id === memeId)?.downvotes || 0)
      }
    }))

    setVotedPosts(prev => new Set([...prev, memeId]))
  }

  const sortedMemes = useMemo(() => {
    return [...memes].sort((a, b) => {
      const aVotes = voteCounts[a.id] || { upvotes: a.upvotes, downvotes: a.downvotes }
      const bVotes = voteCounts[b.id] || { upvotes: b.upvotes, downvotes: b.downvotes }

      if (sortBy === 'trending') {
        return (bVotes.upvotes - bVotes.downvotes) - (aVotes.upvotes - aVotes.downvotes)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [memes, sortBy, voteCounts])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t('community.title' as any)}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('community.subtitle' as any)}
            </p>
          </div>

          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'trending' | 'latest')} className="mb-8">
            <TabsList>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('community.trending' as any)}
              </TabsTrigger>
              <TabsTrigger value="latest" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('community.latest' as any)}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading memes...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => openMemeModal(meme)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={meme.image_url}
                        alt={meme.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {meme.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('community.by' as any)} {meme.profiles?.username || meme.profiles?.full_name || 'Anonymous'}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVote(meme.id, 'up')
                            }}
                            disabled={votedPosts.has(meme.id)}
                            className="flex items-center gap-1"
                          >
                            <ChevronUp className="h-4 w-4" />
                            <span className="text-sm">{voteCounts[meme.id]?.upvotes ?? meme.upvotes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVote(meme.id, 'down')
                            }}
                            disabled={votedPosts.has(meme.id)}
                            className="flex items-center gap-1"
                          >
                            <ChevronDown className="h-4 w-4" />
                            <span className="text-sm">{voteCounts[meme.id]?.downvotes ?? meme.downvotes}</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openMemeModal(meme)
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        {new Date(meme.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && sortedMemes.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('community.title' as any)}
              </h3>
              <p className="text-muted-foreground text-lg font-medium">
                No posts yet - Start the conversation
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Be the first to share your meme with the community!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Meme Detail Modal */}
      {isModalOpen && selectedMeme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {selectedMeme.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    by {selectedMeme.profiles?.username || selectedMeme.profiles?.full_name || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Meme Image */}
              <div className="mb-6">
                <img
                  src={selectedMeme.image_url}
                  alt={selectedMeme.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">{selectedMeme.upvotes || 0} upvotes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">0 comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">0 shares</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Comments & Engagement
                </h3>

                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Comments feature coming soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}