import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutConfig[];
}

export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Show help modal with all shortcuts
  const showShortcutsHelp = useCallback(() => {
    const shortcutList = shortcuts
      .map((s) => {
        const keys = [];
        if (s.ctrl) keys.push('Ctrl');
        if (s.shift) keys.push('Shift');
        if (s.alt) keys.push('Alt');
        keys.push(s.key.toUpperCase());
        return `${keys.join('+')} - ${s.description}`;
      })
      .join('\n');

    toast.info('Atalhos de Teclado', {
      description: shortcutList,
      duration: 10000,
    });
  }, [shortcuts]);

  return { showShortcutsHelp };
}

// Common shortcuts presets
export const commonShortcuts = {
  save: (action: () => void): ShortcutConfig => ({
    key: 's',
    ctrl: true,
    description: 'Salvar',
    action,
  }),
  newItem: (action: () => void): ShortcutConfig => ({
    key: 'n',
    ctrl: true,
    description: 'Novo item',
    action,
  }),
  search: (action: () => void): ShortcutConfig => ({
    key: 'k',
    ctrl: true,
    description: 'Buscar',
    action,
  }),
  escape: (action: () => void): ShortcutConfig => ({
    key: 'Escape',
    description: 'Fechar/Cancelar',
    action,
  }),
  help: (action: () => void): ShortcutConfig => ({
    key: '?',
    shift: true,
    description: 'Ajuda (atalhos)',
    action,
  }),
  refresh: (action: () => void): ShortcutConfig => ({
    key: 'r',
    ctrl: true,
    description: 'Atualizar',
    action,
  }),
  delete: (action: () => void): ShortcutConfig => ({
    key: 'Delete',
    description: 'Excluir selecionado',
    action,
  }),
  selectAll: (action: () => void): ShortcutConfig => ({
    key: 'a',
    ctrl: true,
    description: 'Selecionar tudo',
    action,
  }),
};

export default useKeyboardShortcuts;
