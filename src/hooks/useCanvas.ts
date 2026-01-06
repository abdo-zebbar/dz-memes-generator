import { RefObject, useEffect } from 'react';
import { TextElement, ImageState } from '../types/meme';
import { drawText, isPointInText } from '../utils/canvasUtils';

interface UseCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  imageState: ImageState;
  textElements: TextElement[];
  selectedTextId: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

export const useCanvas = ({
  canvasRef,
  imageState,
  textElements,
  selectedTextId,
  canvasWidth,
  canvasHeight,
}: UseCanvasProps) => {

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw image if available
    if (imageState.url) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Center the image within the canvas
        const centerX = (canvasWidth - imageState.width) / 2;
        const centerY = (canvasHeight - imageState.height) / 2;

        ctx.drawImage(img, centerX, centerY, imageState.width, imageState.height);

        // Redraw text elements
        textElements.forEach((textElement) => {
          drawText(ctx, textElement, textElement.id === selectedTextId);
        });
      };
      img.src = imageState.url;
    } else {
      // Draw white background if no image
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw text elements
      textElements.forEach((textElement) => {
        drawText(ctx, textElement, textElement.id === selectedTextId);
      });
    }
  }, [imageState, textElements, selectedTextId, canvasWidth, canvasHeight]);

  const getTextElementAtPoint = (x: number, y: number): TextElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Check from last to first (top to bottom)
    for (let i = textElements.length - 1; i >= 0; i--) {
      if (isPointInText(x, y, textElements[i], ctx)) {
        return textElements[i];
      }
    }
    return null;
  };

  return { getTextElementAtPoint };
};
