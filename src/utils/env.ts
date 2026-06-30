export type AppEnvironment = 'EXTENSION' | 'TAURI' | 'WEB';

/**
 * Detect the current runtime environment.
 */
export const getEnvironment = (): AppEnvironment => {
  if (
    typeof window !== 'undefined' &&
    (window as any).chrome &&
    (window as any).chrome.runtime &&
    (window as any).chrome.runtime.id
  ) {
    return 'EXTENSION';
  }

  if (
    typeof window !== 'undefined' &&
    (window as any).__TAURI_METADATA__
  ) {
    return 'TAURI';
  }

  return 'WEB';
};

export const isExtension = (): boolean => getEnvironment() === 'EXTENSION';
export const isTauri = (): boolean => getEnvironment() === 'TAURI';
export const isWeb = (): boolean => getEnvironment() === 'WEB';
