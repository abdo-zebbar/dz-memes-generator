import React, { useState } from 'react';
import { ImageState } from '../types/meme';
import { useTheme } from '../context/ThemeContext';
import './ImageControls.css';

interface ImageControlsProps {
  imageState: ImageState;
  onImageResize: (width: number, height: number) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  imageState,
  onImageResize,
}) => {
  const { t } = useTheme();
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [width, setWidth] = useState(imageState.width);
  const [height, setHeight] = useState(imageState.height);

  React.useEffect(() => {
    setWidth(imageState.width);
    setHeight(imageState.height);
  }, [imageState.width, imageState.height]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio && imageState.originalWidth > 0) {
      const ratio = imageState.originalHeight / imageState.originalWidth;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio && imageState.originalHeight > 0) {
      const ratio = imageState.originalWidth / imageState.originalHeight;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleApply = () => {
    onImageResize(width, height);
  };

  const handleReset = () => {
    setWidth(imageState.originalWidth);
    setHeight(imageState.originalHeight);
    onImageResize(imageState.originalWidth, imageState.originalHeight);
  };

  if (!imageState.url) {
    return (
      <div className="image-controls">
        <div className="controls-placeholder">
          {t('upload.image')}
        </div>
      </div>
    );
  }

  return (
    <div className="image-controls">
      <h3>{t('resize.image')}</h3>
      
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={maintainAspectRatio}
            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
            className="checkbox"
          />
          Maintain Aspect Ratio
        </label>
      </div>

      <div className="control-group">
        <label>{t('width')} (px)</label>
        <input
          type="number"
          value={width}
          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
          className="number-input"
          min="1"
        />
      </div>

      <div className="control-group">
        <label>{t('height')} (px)</label>
        <input
          type="number"
          value={height}
          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
          className="number-input"
          min="1"
        />
      </div>

      <div className="button-group">
        <button onClick={handleApply} className="apply-button">
          {t('apply')}
        </button>
        <button onClick={handleReset} className="reset-button">
          {t('reset')}
        </button>
      </div>

      <div className="image-info">
        <p>Original: {imageState.originalWidth} × {imageState.originalHeight}px</p>
        <p>Current: {imageState.width} × {imageState.height}px</p>
      </div>
    </div>
  );
};
