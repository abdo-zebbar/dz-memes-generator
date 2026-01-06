import React from 'react';
import { TextElement } from '../types/meme';
import { useTheme } from '../context/ThemeContext';
import './TextControls.css';

interface TextControlsProps {
  selectedText: TextElement | null;
  onTextUpdate: (updates: Partial<TextElement>) => void;
  onTextDelete: () => void;
  onAddText: () => void;
}

export const TextControls: React.FC<TextControlsProps> = ({
  selectedText,
  onTextUpdate,
  onTextDelete,
  onAddText,
}) => {
  const { t } = useTheme();

  if (!selectedText) {
    return (
      <div className="text-controls">
        <button onClick={onAddText} className="add-text-button">
          {t('add.text')}
        </button>
        <div className="controls-placeholder">
          {t('select.text.first')}
        </div>
      </div>
    );
  }

  return (
    <div className="text-controls">
      <h3>{t('text.content')}</h3>
      
      <div className="control-group">
        <label>{t('text.content')}</label>
        <textarea
          value={selectedText.text}
          onChange={(e) => onTextUpdate({ text: e.target.value })}
          className="text-input"
          rows={3}
          placeholder={t('text.content')}
        />
      </div>

      <div className="control-group">
        <label>{t('font.size')}: {selectedText.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="120"
          value={selectedText.fontSize}
          onChange={(e) => onTextUpdate({ fontSize: parseInt(e.target.value) })}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>{t('text.color')}</label>
        <div className="color-input-group">
          <input
            type="color"
            value={selectedText.color}
            onChange={(e) => onTextUpdate({ color: e.target.value })}
            className="color-picker"
          />
          <input
            type="text"
            value={selectedText.color}
            onChange={(e) => onTextUpdate({ color: e.target.value })}
            className="color-text-input"
          />
        </div>
      </div>

      <div className="control-group">
        <label>{t('border.width')}: {selectedText.borderWidth}px</label>
        <input
          type="range"
          min="0"
          max="10"
          value={selectedText.borderWidth}
          onChange={(e) => onTextUpdate({ borderWidth: parseInt(e.target.value) })}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>{t('border.color')}</label>
        <div className="color-input-group">
          <input
            type="color"
            value={selectedText.borderColor}
            onChange={(e) => onTextUpdate({ borderColor: e.target.value })}
            className="color-picker"
          />
          <input
            type="text"
            value={selectedText.borderColor}
            onChange={(e) => onTextUpdate({ borderColor: e.target.value })}
            className="color-text-input"
          />
        </div>
      </div>

      <div className="control-group">
        <label>{t('font.family')}</label>
        <select
          value={selectedText.fontFamily}
          onChange={(e) => onTextUpdate({ fontFamily: e.target.value })}
          className="font-select"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value='"Segoe UI", Arial, sans-serif'>Segoe UI</option>
          <option value='"Times New Roman", serif'>Times New Roman</option>
          <option value='"Courier New", monospace'>Courier New</option>
          <option value='"Comic Sans MS", cursive'>Comic Sans MS</option>
        </select>
      </div>

      <button onClick={onTextDelete} className="delete-button">
        {t('delete.text')}
      </button>
    </div>
  );
};
