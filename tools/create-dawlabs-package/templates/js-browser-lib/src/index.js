/**
 * {{description}} - Browser Library
 */

// Browser-specific functionality
export class {{className}}Browser {
  /**
   * Create a new browser component instance
   * @param {string|HTMLElement} [selectorOrElement] - CSS selector or HTMLElement
   */
  constructor(selectorOrElement) {
    if (typeof selectorOrElement === 'string') {
      this.container = document.querySelector(selectorOrElement);
    } else if (selectorOrElement instanceof HTMLElement) {
      this.container = selectorOrElement;
    }
  }

  /**
   * Initialize the browser component
   */
  init() {
    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Basic initialization logic
    this.container.classList.add('{{className}}-initialized');
  }

  /**
   * Render content to the container
   * @param {string|HTMLElement} content - Content to render
   */
  render(content) {
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
  destroy() {
    if (this.container) {
      this.container.classList.remove('{{className}}-initialized');
    }
  }

  /**
   * Get the container element
   * @returns {HTMLElement|null}
   */
  getContainer() {
    return this.container || null;
  }
}

// Utility functions
/**
 * Create a new browser component instance
 * @param {string|HTMLElement} [selectorOrElement] - CSS selector or HTMLElement
 * @returns {{{className}}Browser}
 */
export const create{{className}}Browser = (selectorOrElement) => {
  return new {{className}}Browser(selectorOrElement);
};

// Re-export shared types
// Note: Shared types are available via // Shared types can be defined here as needed package
// Uncomment the line below if you want to re-export shared types
// // Shared types can be defined here as needed