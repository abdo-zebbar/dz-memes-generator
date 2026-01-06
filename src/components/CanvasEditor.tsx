import React, { useState, useCallback } from 'react';
import { TextElement, ImageState } from '../types/meme';
import { useCanvas } from '../hooks/useCanvas';
import './CanvasEditor.css';

interface CanvasEditorProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageState: ImageState;
  textElements: TextElement[];
  selectedTextId: string | null;
  onTextSelect: (id: string | null) => void;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  onTextAdd: (x: number, y: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  canvasRef,
  imageState,
  textElements,
  selectedTextId,
  onTextSelect,
  onTextUpdate,
  onTextAdd,
  canvasWidth,
  canvasHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { getTextElementAtPoint } = useCanvas({
    canvasRef,
    imageState,
    textElements,
    selectedTextId,
    canvasWidth,
    canvasHeight,
  });

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [canvasRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const textElement = getTextElementAtPoint(coords.x, coords.y);

    if (textElement) {
      setIsDragging(true);
      setDragOffset({
        x: coords.x - textElement.x,
        y: coords.y - textElement.y,
      });
      onTextSelect(textElement.id);
    } else {
      onTextSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && selectedTextId) {
      const coords = getCanvasCoordinates(e);
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;

      // Keep text within canvas bounds
      const constrainedX = Math.max(0, Math.min(newX, canvasWidth - 50));
      const constrainedY = Math.max(0, Math.min(newY, canvasHeight - 50));

      onTextUpdate(selectedTextId, {
        x: constrainedX,
        y: constrainedY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    onTextAdd(coords.x, coords.y);
  };

  return (
    <div className="canvas-editor">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="meme-canvas"
        style={{
          maxWidth: '100%',
          height: 'auto',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      />
      <p className="canvas-hint">Double-click to add text • Click and drag to move text</p>
    </div>
  );
};
