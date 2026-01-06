import React, { useState, useRef } from 'react';
import { TextElement, ImageState } from '../types/meme';
import { getDefaultFont } from '../utils/canvasUtils';
import { useTheme } from '../context/ThemeContext';
import { ImageUploader } from './ImageUploader';
import { CanvasEditor } from './CanvasEditor';
import { TextControls } from './TextControls';
import { ImageControls } from './ImageControls';
import { DownloadButton } from './DownloadButton';
import { supabase } from '../lib/supabaseClient';
import './MemeGenerator.css';

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

export const MemeGenerator: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [imageState, setImageState] = useState<ImageState>({
    url: null,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    originalWidth: DEFAULT_CANVAS_WIDTH,
    originalHeight: DEFAULT_CANVAS_HEIGHT,
  });

  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const [memeTitle, setMemeTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Calculate canvas dimensions maintaining aspect ratio
        const maxWidth = 1200;
        const maxHeight = 800;
        let width = originalWidth;
        let height = originalHeight;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        setImageState({
          url,
          width,
          height,
          originalWidth,
          originalHeight,
        });
        setCanvasWidth(width);
        setCanvasHeight(height);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleImageResize = (width: number, height: number) => {
    setImageState((prev) => ({
      ...prev,
      width,
      height,
    }));
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

  const handleTextAdd = (x: number, y: number) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x,
      y,
      fontSize: 40,
      color: '#000000',
      borderColor: '#000000',
      borderWidth: 0,
      fontFamily: 'Arial, sans-serif',
    };
    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
  };

  const handleAddTextButton = () => {
    // Add text in the center of the canvas
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    handleTextAdd(centerX, centerY);
  };

  const handleTextUpdate = (id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((text) => {
        if (text.id === id) {
          const updated = { ...text, ...updates };
          // Auto-detect font for Arabic text
          if (updates.text !== undefined) {
            updated.fontFamily = getDefaultFont(updates.text);
          }
          return updated;
        }
        return text;
      })
    );
  };

  const handleTextSelect = (id: string | null) => {
    setSelectedTextId(id);
  };

  const handleTextDelete = () => {
    if (selectedTextId) {
      setTextElements((prev) => prev.filter((text) => text.id !== selectedTextId));
      setSelectedTextId(null);
    }
  };

  const handleUpload = async () => {
    if (!canvasRef.current || !memeTitle.trim()) {
      alert('Please add a title to your meme');
      return;
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to upload memes');
      return;
    }

    setIsUploading(true);

    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to create meme image');
          setIsUploading(false);
          return;
        }

        // Generate unique filename
        const fileName = `meme-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('memes')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload meme');
          setIsUploading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('memes')
          .getPublicUrl(fileName);

        // Insert into posts table
        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            title: memeTitle.trim(),
            image_url: publicUrl,
            user_id: user.id,
            upvotes: 0,
            downvotes: 0
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          alert('Failed to save meme to database');
        } else {
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
          // Reset form
          setMemeTitle('');
          setImageState({
            url: null,
            width: DEFAULT_CANVAS_WIDTH,
            height: DEFAULT_CANVAS_HEIGHT,
            originalWidth: DEFAULT_CANVAS_WIDTH,
            originalHeight: DEFAULT_CANVAS_HEIGHT,
          });
          setTextElements([]);
          setSelectedTextId(null);
        }

        setIsUploading(false);
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading');
      setIsUploading(false);
    }
  };

  const selectedText = textElements.find((text) => text.id === selectedTextId) || null;

  return (
    <div className="meme-generator" data-theme={theme} data-lang={language}>
      <header className="app-header">
        <div className="header-content">
          <h1>dz memes</h1>
          <div className="header-controls">
            <button
              onClick={() => setLanguage('ar')}
              className={`lang-toggle ${language === 'ar' ? 'active' : ''}`}
              aria-label="العربية"
              title="العربية"
            >
              🇩🇿
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`lang-toggle ${language === 'en' ? 'active' : ''}`}
              aria-label="English"
              title="English"
            >
              🇬🇧
            </button>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
        <p>{t('app.description')}</p>
      </header>

      <div className="app-content">
        <div className="left-panel">
          <ImageUploader onImageSelect={handleImageSelect} />
          
          <TextControls
            selectedText={selectedText}
            onTextUpdate={(updates) => {
              if (selectedTextId) {
                handleTextUpdate(selectedTextId, updates);
              }
            }}
            onTextDelete={handleTextDelete}
            onAddText={handleAddTextButton}
          />

          <ImageControls
            imageState={imageState}
            onImageResize={handleImageResize}
          />

          <DownloadButton canvasRef={canvasRef} />

          {/* Meme Title Input */}
          <div className="control-group">
            <label htmlFor="meme-title" className="control-label">
              Meme Title
            </label>
            <input
              id="meme-title"
              type="text"
              value={memeTitle}
              onChange={(e) => setMemeTitle(e.target.value)}
              placeholder="Enter meme title..."
              className="control-input"
              maxLength={100}
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !memeTitle.trim() || !imageState.url}
            className={`upload-button ${isUploading ? 'uploading' : ''} ${uploadSuccess ? 'success' : ''}`}
          >
            {uploadSuccess ? '✅ Success!' : isUploading ? 'Uploading...' : t('editor.shareCommunity')}
          </button>
        </div>

        <div className="right-panel">
          <CanvasEditor
            canvasRef={canvasRef}
            imageState={imageState}
            textElements={textElements}
            selectedTextId={selectedTextId}
            onTextSelect={handleTextSelect}
            onTextUpdate={handleTextUpdate}
            onTextAdd={handleTextAdd}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        </div>
      </div>
    </div>
  );
};
