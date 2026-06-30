/**
 * AsyncQueue is a mutex-based lock queue designed to prevent race conditions
 * when multiple tools write to persistent storage (e.g. localStorage or chrome.storage) concurrently.
 */
export class AsyncQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  /**
   * Enqueues an operation to be executed sequentially.
   * @param operation An async function to execute.
   * @returns A promise that resolves when the operation finishes.
   */
  public enqueue<T>(operation: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedOperation = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      this.queue.push(wrappedOperation);
      this.processNext();
    });
  }

  /**
   * Processes the next task in the queue if not currently busy.
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const nextOperation = this.queue.shift();

    if (nextOperation) {
      try {
        await nextOperation();
      } catch (err) {
        console.error('[AsyncQueue] Operation error:', err);
      }
    }

    this.isProcessing = false;
    this.processNext();
  }
}

// Global single instance to serialize operations across the app
export const globalStorageQueue = new AsyncQueue();
