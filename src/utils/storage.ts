import { isExtension } from './env';

/**
 * Get an item from storage dynamically based on environment.
 */
export const getStorageItem = async (key: string): Promise<string | null> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      try {
        (window as any).chrome.storage.local.get([key], (result: any) => {
          resolve(result && result[key] ? result[key] : null);
        });
      } catch (err) {
        console.error('Failed to get from chrome.storage', err);
        resolve(null);
      }
    });
  }
  return localStorage.getItem(key);
};

/**
 * Set an item in storage dynamically based on environment.
 */
export const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      try {
        (window as any).chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      } catch (err) {
        console.error('Failed to set in chrome.storage', err);
        resolve();
      }
    });
  }
  localStorage.setItem(key, value);
};
