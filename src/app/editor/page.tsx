'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Download, Share2, Palette, Type, Plus, Trash2, Copy, Delete } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/Toast'

interface TextLayer {
  id: string
  content: string
  x: number
  y: number
  fontSize: number
  fill: string
  stroke: string
  strokeWidth: number
}

export default function EditorPage() {
  const { showToast } = useToast()

  // Core state
  const [imageSrc, setImageSrc] = useState<string>('')
  const [layers, setLayers] = useState<TextLayer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isInlineEditing, setIsInlineEditing] = useState(false)
  const [inlineEditValue, setInlineEditValue] = useState('')
  const [inlineEditPosition, setInlineEditPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [clonedLayerId, setClonedLayerId] = useState<string | null>(null)

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const drawCanvasRef = useRef<() => void>()
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)

  // Dynamic canvas dimensions based on image aspect ratio
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })

  // Stable canvas rendering with image caching
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height)

    // Draw checkered background (like Photoshop workspace) if no image
    if (!imageSrc) {
      const squareSize = 20
      for (let y = 0; y < canvasDimensions.height; y += squareSize) {
        for (let x = 0; x < canvasDimensions.width; x += squareSize) {
          const isDark = (x / squareSize + y / squareSize) % 2 === 0
          ctx.fillStyle = isDark ? '#f1f5f9' : '#e2e8f0' // Light slate checkered pattern
          ctx.fillRect(x, y, squareSize, squareSize)
        }
      }

      // Draw placeholder text
      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Upload an image to start creating', canvasDimensions.width / 2, canvasDimensions.height / 2 - 20)
      ctx.font = '16px Arial'
      ctx.fillText('Your meme will appear here', canvasDimensions.width / 2, canvasDimensions.height / 2 + 20)
    } else {
      // Draw background image
      if (imageElement) {
        const img = imageElement

        // Image should fill the entire canvas while maintaining aspect ratio
        const canvasAspectRatio = canvasDimensions.width / canvasDimensions.height
        const imageAspectRatio = img.naturalWidth / img.naturalHeight

        let drawWidth = canvasDimensions.width
        let drawHeight = canvasDimensions.height
        let x = 0
        let y = 0

        if (imageAspectRatio > canvasAspectRatio) {
          // Image is wider than canvas aspect ratio - fit by height
          drawWidth = canvasDimensions.height * imageAspectRatio
          x = (canvasDimensions.width - drawWidth) / 2
        } else {
          // Image is taller than canvas aspect ratio - fit by width
          drawHeight = canvasDimensions.width / imageAspectRatio
          y = (canvasDimensions.height - drawHeight) / 2
        }

        ctx.drawImage(img, x, y, drawWidth, drawHeight)
      }
    }

    // Draw all text layers
    layers.forEach((layer) => {
      ctx.font = `bold ${layer.fontSize}px Impact, Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Word wrap logic
      const words = layer.content.split(' ')
      const lines: string[] = []
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > canvasDimensions.width - 40 && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      lines.push(currentLine)

      // Draw each line with stroke and fill
      const lineHeight = layer.fontSize * 1.2
      const totalHeight = lines.length * lineHeight
      let y = layer.y - totalHeight / 2 + layer.fontSize / 2

      for (const line of lines) {
        // Draw stroke first (behind fill)
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.stroke
          ctx.lineWidth = layer.strokeWidth
          ctx.strokeText(line, layer.x, y)
        }

        // Draw fill
        ctx.fillStyle = layer.fill
        ctx.fillText(line, layer.x, y)
        y += lineHeight
      }

      // Draw enhanced selection bounding box for active layer
      if (layer.id === activeLayerId) {
        const bounds = {
          left: layer.x - 100,
          top: layer.y - 30,
          right: layer.x + 100,
          bottom: layer.y + 30,
          width: 200,
          height: 60
        }

        // Draw semi-transparent background highlight
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
        ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height)

        // Draw main border
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4])
        ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height)
        ctx.setLineDash([])

        // Draw corner handles
        const handleSize = 6
        ctx.fillStyle = '#10b981'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1

        // Corner positions
        const corners = [
          { x: bounds.left, y: bounds.top }, // top-left
          { x: bounds.right, y: bounds.top }, // top-right
          { x: bounds.left, y: bounds.bottom }, // bottom-left
          { x: bounds.right, y: bounds.bottom } // bottom-right
        ]

        corners.forEach(corner => {
          ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize)
          ctx.strokeRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize)
        })
      }
    })
  }, [imageSrc, imageElement, layers, activeLayerId, canvasDimensions])

  // Update the ref whenever drawCanvas changes
  useEffect(() => {
    drawCanvasRef.current = drawCanvas
  }, [drawCanvas])

  // Keyboard event handlers for Alt key and copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false)
        setClonedLayerId(null)
      }

      // Copy/paste functionality
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && activeLayerId) {
          // Copy the active layer
          const activeLayer = layers.find(layer => layer.id === activeLayerId)
          if (activeLayer) {
            localStorage.setItem('clipboard_layer', JSON.stringify(activeLayer))
          }
        } else if (e.key === 'v') {
          // Paste the layer from clipboard
          const clipboardData = localStorage.getItem('clipboard_layer')
          if (clipboardData) {
            try {
              const layerData = JSON.parse(clipboardData)
              const newLayer = {
                ...layerData,
                id: `layer-${Date.now()}`,
                x: layerData.x + 20,
                y: layerData.y + 20
              }
              setLayers(prev => [...prev, newLayer])
              setActiveLayerId(newLayer.id)
            } catch (error) {
              console.error('Failed to paste layer:', error)
            }
          }
        }
      }

    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [activeLayerId, layers])

  // Canvas initialization and stable rendering
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = canvasDimensions.width
    canvas.height = canvasDimensions.height

    // Load image when imageSrc changes
    if (imageSrc) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setImageElement(img)

        // Calculate new canvas dimensions based on image aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight
        let newWidth = 800
        let newHeight = 600

        // Fit image within max dimensions while maintaining aspect ratio
        const maxWidth = 1200
        const maxHeight = 800

        if (aspectRatio > 1) {
          // Landscape image
          newWidth = Math.min(maxWidth, img.naturalWidth)
          newHeight = newWidth / aspectRatio
          if (newHeight > maxHeight) {
            newHeight = maxHeight
            newWidth = newHeight * aspectRatio
          }
        } else {
          // Portrait image
          newHeight = Math.min(maxHeight, img.naturalHeight)
          newWidth = newHeight * aspectRatio
          if (newWidth > maxWidth) {
            newWidth = maxWidth
            newHeight = newWidth / aspectRatio
          }
        }

        // Ensure minimum dimensions
        newWidth = Math.max(400, Math.round(newWidth))
        newHeight = Math.max(300, Math.round(newHeight))

        setCanvasDimensions({ width: newWidth, height: newHeight })

        // Use the ref to call the latest drawCanvas function after image loads
        setTimeout(() => drawCanvasRef.current?.(), 10)
      }
      img.src = imageSrc
    } else {
      setImageElement(null)
      setCanvasDimensions({ width: 800, height: 600 }) // Reset to default
      // Use the ref to call the latest drawCanvas function
      drawCanvasRef.current?.()
    }
  }, [imageSrc, canvasDimensions])

  // Effect for layer and image changes
  useEffect(() => {
    drawCanvasRef.current?.()
  }, [layers, activeLayerId, imageElement])

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size too large. Please select an image under 10MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setImageSrc(result)
        // Add initial text layer if none exist
        if (layers.length === 0) {
          addNewTextLayer()
        }
        showToast('Image uploaded successfully!', 'success')
      }
    }
    reader.onerror = () => {
      showToast('Failed to read image file', 'error')
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast('File size too large. Please select an image under 10MB', 'error')
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            setImageSrc(result)
            if (layers.length === 0) {
              addNewTextLayer()
            }
            showToast('Image uploaded successfully!', 'success')
          }
        }
        reader.onerror = () => {
          showToast('Failed to read image file', 'error')
        }
        reader.readAsDataURL(file)
      } else {
        showToast('Please drop a valid image file', 'error')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Add new text layer
  const addNewTextLayer = () => {
    const newLayer: TextLayer = {
      id: `layer-${Date.now()}`,
      content: 'New Text',
      x: canvasDimensions.width / 2,
      y: canvasDimensions.height / 2 + (layers.length * 60),
      fontSize: 48,
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 3
    }

    setLayers(prev => [...prev, newLayer])
    setActiveLayerId(newLayer.id)
  }

  // Duplicate active layer
  const duplicateLayer = () => {
    if (!activeLayerId) return

    const activeLayer = layers.find(layer => layer.id === activeLayerId)
    if (!activeLayer) return

    const newLayer: TextLayer = {
      ...activeLayer,
      id: `layer-${Date.now()}`,
      x: activeLayer.x + 20,
      y: activeLayer.y + 20
    }

    setLayers(prev => [...prev, newLayer])
    setActiveLayerId(newLayer.id)
  }

  // Delete active layer
  const deleteLayer = () => {
    if (!activeLayerId) return

    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this layer?')) {
      setLayers(prev => prev.filter(layer => layer.id !== activeLayerId))
      setActiveLayerId(null)
    }
  }

  // Delete specific layer
  const deleteSpecificLayer = (layerId: string) => {
    if (window.confirm('Are you sure you want to delete this layer?')) {
      setLayers(prev => prev.filter(layer => layer.id !== layerId))
      if (activeLayerId === layerId) {
        setActiveLayerId(null)
      }
    }
  }

  // Duplicate specific layer
  const duplicateSpecificLayer = (layerId: string) => {
    const layerToDuplicate = layers.find(layer => layer.id === layerId)
    if (!layerToDuplicate) return

    const newLayer: TextLayer = {
      ...layerToDuplicate,
      id: `layer-${Date.now()}`,
      x: layerToDuplicate.x + 20,
      y: layerToDuplicate.y + 20
    }

    setLayers(prev => [...prev, newLayer])
    setActiveLayerId(newLayer.id)
  }

  // Update active layer
  const updateActiveLayer = (updates: Partial<TextLayer>) => {
    if (!activeLayerId) return

    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === activeLayerId
          ? { ...layer, ...updates }
          : layer
      )
    )
  }

  // Mouse event handlers for layer interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Hit testing: check which layer was clicked
    let clickedLayer: TextLayer | null = null

    for (const layer of layers) {
      const left = layer.x - 100
      const right = layer.x + 100
      const top = layer.y - 30
      const bottom = layer.y + 30

      if (clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
        clickedLayer = layer
        break
      }
    }

    if (clickedLayer) {
      if (isAltPressed && !clonedLayerId) {
        // Clone the layer for Alt+drag
        const clonedLayer = {
          ...clickedLayer,
          id: `layer-${Date.now()}`,
          x: clickedLayer.x + 20,
          y: clickedLayer.y + 20
        }
        setLayers(prev => [...prev, clonedLayer])
        setActiveLayerId(clonedLayer.id)
        setClonedLayerId(clonedLayer.id)
        setIsDragging(true)
        setDragOffset({
          x: clickX - clonedLayer.x,
          y: clickY - clonedLayer.y
        })
      } else {
        setActiveLayerId(clickedLayer.id)
        setIsDragging(true)
        setDragOffset({
          x: clickX - clickedLayer.x,
          y: clickY - clickedLayer.y
        })
      }
    } else {
      setActiveLayerId(null)
    }
  }

  // Double-click handler for inline editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeLayerId) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Find the active text layer
    const activeLayer = layers.find(layer => layer.id === activeLayerId)
    if (!activeLayer) return

    // Check if double-click is on the active layer
    const left = activeLayer.x - 100
    const right = activeLayer.x + 100
    const top = activeLayer.y - 30
    const bottom = activeLayer.y + 30

    if (clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
      // Start inline editing
      setInlineEditValue(activeLayer.content)
      setInlineEditPosition({
        x: rect.left + activeLayer.x - 100,
        y: rect.top + activeLayer.y - 30,
        width: 200,
        height: 60
      })
      setIsInlineEditing(true)

      // Focus the textarea after it's rendered
      setTimeout(() => {
        inlineTextareaRef.current?.focus()
        inlineTextareaRef.current?.select()
      }, 10)
    }
  }

  // Save inline edit and exit editing mode
  const saveInlineEdit = () => {
    if (activeLayerId && inlineEditValue.trim()) {
      updateActiveLayer({ content: inlineEditValue.trim() })
    }
    setIsInlineEditing(false)
    setInlineEditValue('')
  }

  // Cancel inline edit
  const cancelInlineEdit = () => {
    setIsInlineEditing(false)
    setInlineEditValue('')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !dragOffset || !activeLayerId) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Use requestAnimationFrame for smooth 60FPS performance
    requestAnimationFrame(() => {
      updateActiveLayer({
        x: x - dragOffset.x,
        y: y - dragOffset.y
      })
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragOffset(null)
    setClonedLayerId(null)
  }

  // Download functionality
  const handleDownload = () => {
    if (!canvasRef.current || (!imageSrc && layers.length === 0)) {
      showToast('Nothing to download! Please add an image or text first.', 'error')
      return
    }

    try {
      // Force a redraw to ensure canvas is up to date
      drawCanvasRef.current?.()

      // Small delay to ensure rendering is complete
      setTimeout(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          showToast('Canvas context not available. Please refresh and try again.', 'error')
          return
        }

        // Ensure canvas has proper dimensions
        if (canvas.width === 0 || canvas.height === 0) {
          canvas.width = canvasDimensions.width
          canvas.height = canvasDimensions.height
          drawCanvasRef.current?.() // Redraw with proper dimensions
        }

        // Check if canvas has content
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        const hasContent = imageData?.data.some(pixel => pixel !== 0)

        if (!hasContent) {
          showToast('Canvas appears to be empty. Please add content and try again.', 'error')
          return
        }

        const dataURL = canvas.toDataURL('image/png', 1.0)

        // Check if canvas is tainted (CORS issue)
        if (dataURL === 'data:,') {
          showToast('Unable to download: Image may be from an external source without proper CORS permissions. Try uploading the image directly.', 'error')
          return
        }

        const link = document.createElement('a')
        link.download = `meme-${Date.now()}.png`
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast('Meme downloaded successfully!', 'success')
        console.log('Download successful!', { dataURL: dataURL.substring(0, 50) + '...' })
      }, 100)
    } catch (error) {
      console.error('Download failed:', error)
      showToast('Download failed. Please try again.', 'error')
    }
  }

  // Share functionality with Supabase integration
  const handleShare = async () => {
    if (!canvasRef.current || !imageSrc) return

    setIsSharing(true)
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast('يجب تسجيل الدخول أولاً', 'error')
        return
      }

      // Get user profile to retrieve username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        showToast('Failed to get user profile', 'error')
        setIsSharing(false)
        return
      }

      // Capture final canvas as Base64
      const canvas = canvasRef.current
      const memeImageData = canvas.toDataURL('image/png', 1.0)

      // Convert canvas to blob for upload
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to create meme image', 'error')
          setIsSharing(false)
          return
        }

        // Generate unique filename
        const fileName = `meme-${Date.now()}-${Math.random().toString(36).substring(7)}.png`

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('memes')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          showToast('Failed to upload meme', 'error')
          setIsSharing(false)
          return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('memes')
          .getPublicUrl(fileName)

        // Insert into memes table with all required columns
        const insertData = {
          title: layers.length > 0 ? layers[0].content : 'Untitled Meme',
          image_url: publicUrl,
          user_id: user.id,
          username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
          upvotes: 0,
          downvotes: 0
        }

        const { error: insertError } = await supabase
          .from('memes')
          .insert(insertData)

        if (insertError) {
          console.error('Database insert error:', insertError)
          console.error('Insert data:', insertData)
          showToast('Failed to save meme to database', 'error')
        } else {
          showToast('Successfully shared to dz memes community!', 'success')
          // Reset canvas after successful share
          setImageSrc('')
          setLayers([])
          setActiveLayerId(null)
          // Redirect to community page to see the shared meme
          window.location.href = '/community'
        }

        setIsSharing(false)
      })
    } catch (error) {
      console.error('Share error:', error)
      showToast('Failed to share meme. Please try again.', 'error')
      setIsSharing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors flex flex-col">
      {/* Header Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Create Meme</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {layers.length} layer{layers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Layout */}
      <div className="flex-1 flex p-4 gap-4">
        {/* Main Canvas Area - Takes most space */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Container - Central Focus */}
          <div className="flex-1 flex justify-center items-center p-4 bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl">
            <div
              className="relative bg-white dark:bg-slate-700 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-600/60 overflow-hidden backdrop-blur-sm"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <canvas
                ref={canvasRef}
                className={`block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Inline Text Editing */}
        {isInlineEditing && (
          <textarea
            ref={inlineTextareaRef}
            value={inlineEditValue}
            onChange={(e) => setInlineEditValue(e.target.value)}
            onBlur={saveInlineEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveInlineEdit()
              } else if (e.key === 'Escape') {
                cancelInlineEdit()
              }
            }}
            style={{
              position: 'absolute',
              left: inlineEditPosition.x,
              top: inlineEditPosition.y,
              width: inlineEditPosition.width,
              height: inlineEditPosition.height,
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '8px',
              resize: 'none',
              outline: 'none',
              zIndex: 1000,
              direction: /[\u0600-\u06FF]/.test(inlineEditValue) ? 'rtl' : 'ltr'
            }}
            placeholder="Edit text..."
          />
        )}

        {/* Properties Panel - Right Side */}
        <div className="w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 overflow-y-auto shadow-xl">
          {/* Text Properties */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Type className="h-5 w-5 text-blue-600" />
                Text Properties
              </h3>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Content
                </label>
                <textarea
                  value={layers.find(l => l.id === activeLayerId)?.content || ''}
                  onChange={(e) => {
                    const activeLayer = layers.find(l => l.id === activeLayerId)
                    if (activeLayer) {
                      updateActiveLayer({ content: e.target.value })
                    }
                  }}
                  disabled={!activeLayerId}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-sm transition-all duration-200 placeholder:text-slate-400"
                  rows={3}
                  placeholder="Select a text layer to edit..."
                />
              </div>

              {/* Font Size Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Font Size
                  </label>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    {layers.find(l => l.id === activeLayerId)?.fontSize || 48}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={layers.find(l => l.id === activeLayerId)?.fontSize || 48}
                  onChange={(e) => updateActiveLayer({ fontSize: Number(e.target.value) })}
                  disabled={!activeLayerId}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed slider-thumb"
                />
              </div>

              {/* Fill Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Text Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={layers.find(l => l.id === activeLayerId)?.fill || '#FFFFFF'}
                    onChange={(e) => updateActiveLayer({ fill: e.target.value })}
                    disabled={!activeLayerId}
                    className="w-12 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                    {layers.find(l => l.id === activeLayerId)?.fill?.toUpperCase() || '#FFFFFF'}
                  </span>
                </div>
              </div>

              {/* Stroke Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Stroke Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={layers.find(l => l.id === activeLayerId)?.stroke || '#000000'}
                    onChange={(e) => updateActiveLayer({ stroke: e.target.value })}
                    disabled={!activeLayerId}
                    className="w-12 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                    {layers.find(l => l.id === activeLayerId)?.stroke?.toUpperCase() || '#000000'}
                  </span>
                </div>
              </div>

              {/* Stroke Width */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Stroke Width
                  </label>
                  <span className="text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                    {layers.find(l => l.id === activeLayerId)?.strokeWidth || 0}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={layers.find(l => l.id === activeLayerId)?.strokeWidth || 0}
                  onChange={(e) => updateActiveLayer({ strokeWidth: Number(e.target.value) })}
                  disabled={!activeLayerId}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed slider-thumb"
                />
              </div>

              {/* Layer Management */}
              <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-6">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Layers ({layers.length})
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {layers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No text layers yet</p>
                      <p className="text-xs">Click "Add Text" to get started</p>
                    </div>
                  ) : (
                    layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          activeLayerId === layer.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                        }`}
                        onClick={() => setActiveLayerId(layer.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              {layer.content || 'Empty Text'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Font: {layer.fontSize}px • Color: {layer.fill}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateSpecificLayer(layer.id)
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-150"
                            title="Duplicate Layer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSpecificLayer(layer.id)
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150"
                            title="Delete Layer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-700/60 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Creation Tools */}
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </button>
            <button
              onClick={addNewTextLayer}
              className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Add Text
            </button>
            <button
              onClick={deleteLayer}
              disabled={!activeLayerId}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <Delete className="h-5 w-5" />
              Delete Layer
            </button>
          </div>

          {/* Right: Export Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={!imageSrc && layers.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              Download PNG
            </button>
            <button
              onClick={handleShare}
              disabled={!imageSrc || isSharing}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <Share2 className="h-5 w-5" />
              {isSharing ? 'Sharing...' : 'Share to Community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}