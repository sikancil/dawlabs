/**
 * {{description}} - Browser Library
 */

// Browser-specific functionality
export class {{className}}Browser {
  private readonly container: HTMLElement | null = null;

  constructor(selectorOrElement?: string | HTMLElement) {
    if (typeof selectorOrElement === 'string') {
      this.container = document.querySelector(selectorOrElement);
    } else if (selectorOrElement instanceof HTMLElement) {
      this.container = selectorOrElement;
    }
  }

  /**
   * Initialize the browser component
   */
  init(): void {
    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Basic initialization logic
    this.container.classList.add('{{name}}-initialized');
  }

  /**
   * Render content to the container
   */
  render(content: string | HTMLElement): void {
    if (!this.container) {
      throw new Error('Container not initialized');
    }

    if (typeof content === 'string') {
      this.container.innerHTML = content;
    } else {
      this.container.innerHTML = '';
      this.container.appendChild(content);
    }
  }

  /**
   * Destroy the component and clean up
   */
  destroy(): void {
    if (this.container) {
      this.container.classList.remove('{{name}}-initialized');
    }
  }

  /**
   * Get the container element
   */
  getContainer(): HTMLElement | null {
    return this.container;
  }
}

// Utility functions
export const create{{className}}Browser = (selectorOrElement?: string | HTMLElement) => {
  return new {{className}}Browser(selectorOrElement);
};

// Re-export shared types
// Shared types can be defined here as needed