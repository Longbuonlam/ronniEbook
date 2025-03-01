import React, { useState, useEffect } from 'react';
import './file-reorder-modal.scss';
import { RonnieFile } from '../../model/file.model';

interface FileReorderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (files: RonnieFile[]) => void;
  initialFiles: RonnieFile[];
}

function FileReorderModal({ isOpen, onClose, onSave, initialFiles }: FileReorderPopupProps) {
  const [files, setFiles] = useState<RonnieFile[]>(initialFiles);
  const [draggedItem, setDraggedItem] = useState<RonnieFile | null>(null);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles, isOpen]);

  if (!isOpen) return null;

  // Get file icon based on file type
  const getFileIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      jpg: '🖼️',
      png: '🖼️',
      default: '📁',
    };

    return iconMap[type] || iconMap.default;
  };

  // Handle manual order changes
  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>, fileId: string): void => {
    const newOrder = parseInt(e.target.value);

    if (newOrder < 1 || newOrder > files.length) {
      return;
    }

    setFiles(prevFiles => {
      // Create a copy of the files array
      const updatedFiles = [...prevFiles];

      // Find the file being changed
      const fileToUpdate = updatedFiles.find(f => f.id === fileId);
      if (!fileToUpdate) return prevFiles;

      const oldOrder = fileToUpdate.order;

      // Update other files' orders
      if (newOrder < oldOrder) {
        // Moving up in the list
        updatedFiles.forEach(file => {
          if (file.id !== fileId && file.order >= newOrder && file.order < oldOrder) {
            file.order++;
          }
        });
      } else if (newOrder > oldOrder) {
        // Moving down in the list
        updatedFiles.forEach(file => {
          if (file.id !== fileId && file.order <= newOrder && file.order > oldOrder) {
            file.order--;
          }
        });
      }

      // Update the changed file's order
      fileToUpdate.order = newOrder;

      return updatedFiles;
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, file: RonnieFile): void => {
    setDraggedItem(file);
    // Add a delay to apply the dragging class
    setTimeout(() => {
      e.currentTarget.classList.add('dragging');
    }, 0);
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent): void => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetFile: RonnieFile): void => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetFile.id) {
      return;
    }

    setFiles(prevFiles => {
      // Create a copy of the files array
      const updatedFiles = [...prevFiles];

      // Find the dragged file and target file
      const draggedFile = updatedFiles.find(f => f.id === draggedItem.id);
      const targetFileObj = updatedFiles.find(f => f.id === targetFile.id);

      if (!draggedFile || !targetFileObj) return prevFiles;

      const oldOrder = draggedFile.order;
      const newOrder = targetFileObj.order;

      // Update orders
      if (oldOrder < newOrder) {
        // Moving down
        updatedFiles.forEach(file => {
          if (file.id !== draggedItem.id && file.order > oldOrder && file.order <= newOrder) {
            file.order--;
          }
        });
      } else {
        // Moving up
        updatedFiles.forEach(file => {
          if (file.id !== draggedItem.id && file.order < oldOrder && file.order >= newOrder) {
            file.order++;
          }
        });
      }

      draggedFile.order = newOrder;

      return updatedFiles;
    });
  };

  // Handle save button click
  const handleSave = (): void => {
    onSave(files);
  };

  // Handle cancel button click
  const handleCancel = (): void => {
    setFiles(initialFiles);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        {/* Popup Header */}
        <div className="popup-header">
          <h3 className="popup-title">Reorder Files</h3>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        {/* Popup Body */}
        <div className="popup-body">
          <p>Drag files to reorder or manually change the position numbers.</p>

          <ul className="file-list">
            {files
              .sort((a, b) => a.order - b.order)
              .map(file => (
                <li
                  key={file.id}
                  className="file-item"
                  draggable
                  onDragStart={e => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, file)}
                >
                  <div className="file-order">
                    <input type="number" min="1" max={files.length} value={file.order} onChange={e => handleOrderChange(e, file.id)} />
                  </div>
                  <div className="file-icon">{getFileIcon(file.fileName)}</div>
                  <div className="file-name">{file.fileName}</div>
                  {/* <div className="file-size">{file.fileName}</div> */}
                  <div className="drag-handle">⋮⋮</div>
                </li>
              ))}
          </ul>
        </div>

        {/* Popup Footer */}
        <div className="popup-footer">
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileReorderModal;
