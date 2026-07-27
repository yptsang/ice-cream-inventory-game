import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

interface UseAccessibleDialogOptions {
  isOpen: boolean;
  onClose: () => void;
}

export const useAccessibleDialog = <T extends HTMLElement>({
  isOpen,
  onClose
}: UseAccessibleDialogOptions) => {
  const dialogRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialogElement = dialogRef.current;
    const focusableElements = dialogElement
      ? Array.from(dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const firstFocusableElement = focusableElements[0];

    const focusTarget = firstFocusableElement ?? dialogElement;
    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogElement) {
        return;
      }

      const activeFocusableElements = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (activeFocusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstElement = activeFocusableElements[0];
      const lastElement = activeFocusableElements[activeFocusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
};
