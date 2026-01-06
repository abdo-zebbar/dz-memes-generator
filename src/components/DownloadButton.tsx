import React, { useState } from 'react';
import { downloadCanvas } from '../utils/canvasUtils';
import { useTheme } from '../context/ThemeContext';
import './DownloadButton.css';

interface DownloadButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ canvasRef }) => {
  const { t } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, 'meme.png');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`download-button ${showSuccess ? 'success' : ''}`}
    >
      {showSuccess ? '✅ Success!' : t('download.meme')}
    </button>
  );
};
