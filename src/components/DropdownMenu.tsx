import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DropdownMenu.css';

interface MenuItem {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
  className?: string;
  onMenuToggle?: (isOpen: boolean) => void;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, className = '', onMenuToggle, scrollContainerRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ 
        top: rect.bottom + 4, 
        left: rect.right - 100
      });
    }
    
    setIsOpen(prev => !prev);
  };

  // Notify parent when menu state changes
  useEffect(() => {
    onMenuToggle?.(isOpen);
  }, [isOpen, onMenuToggle]);

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
    setPosition(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPosition(null);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('scroll', handleScroll, { passive: true });
      
      // Also listen to scroll events on the specific scroll container
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.addEventListener('scroll', handleScroll, { passive: true });
      }
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('scroll', handleScroll);
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [isOpen, scrollContainerRef]);

  return (
    <div className={`dropdown-menu-container ${className}`} style={{ zIndex: isOpen ? 99999 : 'auto' }}>
      <button
        ref={buttonRef}
        className="dropdown-menu-button"
        aria-label="More options"
        onClick={handleButtonClick}
      >
        ⋮
      </button>
      
      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          className="dropdown-menu-content"
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 999999,
            maxWidth: '100px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => (
            <button
              key={index}
              className={`dropdown-menu-item ${item.isDestructive ? 'delete' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DropdownMenu;
