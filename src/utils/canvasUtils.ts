import { TextElement } from '../types/meme';

export const isArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

export const getDefaultFont = (text: string): string => {
  return isArabic(text) ? 'Arial, "Segoe UI", sans-serif' : 'Arial, sans-serif';
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  textElement: TextElement,
  isSelected: boolean = false
): void => {
  ctx.save();
  
  // Set font properties
  ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
  ctx.textAlign = isArabic(textElement.text) ? 'right' : 'left';
  ctx.textBaseline = 'top';
  
  // Draw border (stroke)
  if (textElement.borderWidth > 0) {
    ctx.strokeStyle = textElement.borderColor;
    ctx.lineWidth = textElement.borderWidth;
    ctx.strokeText(textElement.text, textElement.x, textElement.y);
  }
  
  // Draw text (fill)
  ctx.fillStyle = textElement.color;
  ctx.fillText(textElement.text, textElement.x, textElement.y);
  
  // Draw selection indicator
  if (isSelected) {
    const metrics = ctx.measureText(textElement.text);
    const textWidth = metrics.width;
    const textHeight = textElement.fontSize;
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      textElement.x - 5,
      textElement.y - 5,
      textWidth + 10,
      textHeight + 10
    );
    ctx.setLineDash([]);
  }
  
  ctx.restore();
};

export const isPointInText = (
  x: number,
  y: number,
  textElement: TextElement,
  ctx: CanvasRenderingContext2D
): boolean => {
  ctx.save();
  ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
  const metrics = ctx.measureText(textElement.text);
  const textWidth = metrics.width;
  const textHeight = textElement.fontSize;
  ctx.restore();
  
  return (
    x >= textElement.x - 5 &&
    x <= textElement.x + textWidth + 5 &&
    y >= textElement.y - 5 &&
    y <= textElement.y + textHeight + 5
  );
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string = 'meme.png'): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};
