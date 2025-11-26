import { {{className}}Browser, create{{className}}Browser } from '../index';

// Mock document for jsdom
const mockContainer = document.createElement('div');
document.body.appendChild(mockContainer);

describe('{{className}}Browser', () => {
  let browser: {{className}}Browser;

  beforeEach(() => {
    // Reset container for each test
    mockContainer.innerHTML = '';
    mockContainer.className = '';
  });

  describe('constructor', () => {
    it('should create browser instance with default', () => {
      browser = new {{className}}Browser();
      expect(browser).toBeInstanceOf({{className}}Browser);
      expect(browser.getContainer()).toBeNull();
    });

    it('should create browser instance with selector', () => {
      mockContainer.id = 'test-container';
      browser = new {{className}}Browser('#test-container');
      expect(browser).toBeInstanceOf({{className}}Browser);
      expect(browser.getContainer()).toBe(mockContainer);
    });

    it('should create browser instance with element', () => {
      browser = new {{className}}Browser(mockContainer);
      expect(browser).toBeInstanceOf({{className}}Browser);
      expect(browser.getContainer()).toBe(mockContainer);
    });
  });

  describe('init', () => {
    it('should initialize with valid container', () => {
      browser = new {{className}}Browser(mockContainer);
      browser.init();
      expect(mockContainer.classList.contains('{{name}}-initialized')).toBe(true);
    });

    it('should throw error when no container', () => {
      browser = new {{className}}Browser();
      expect(() => browser.init()).toThrow('Container element not found');
    });
  });

  describe('render', () => {
    beforeEach(() => {
      browser = new {{className}}Browser(mockContainer);
    });

    it('should render string content', () => {
      const content = '<p>Hello World</p>';
      browser.render(content);
      expect(mockContainer.innerHTML).toBe(content);
    });

    it('should render element content', () => {
      const element = document.createElement('span');
      element.textContent = 'Hello World';

      browser.render(element);
      expect(mockContainer.innerHTML).toBe('<span>Hello World</span>');
      expect(mockContainer.firstChild).toBe(element);
    });

    it('should throw error when no container', () => {
      const noContainerBrowser = new {{className}}Browser();
      expect(() => noContainerBrowser.render('content')).toThrow('Container not initialized');
    });
  });

  describe('destroy', () => {
    it('should clean up initialized container', () => {
      browser = new {{className}}Browser(mockContainer);
      browser.init();
      browser.destroy();
      expect(mockContainer.classList.contains('{{name}}-initialized')).toBe(false);
    });

    it('should handle destroy without initialization', () => {
      browser = new {{className}}Browser(mockContainer);
      expect(() => browser.destroy()).not.toThrow();
    });
  });

  describe('getContainer', () => {
    it('should return the container element', () => {
      browser = new {{className}}Browser(mockContainer);
      expect(browser.getContainer()).toBe(mockContainer);
    });

    it('should return null when no container', () => {
      browser = new {{className}}Browser();
      expect(browser.getContainer()).toBeNull();
    });
  });
});

describe('create{{className}}Browser', () => {
  it('should create a new browser instance', () => {
    const browser = create{{className}}Browser();
    expect(browser).toBeInstanceOf({{className}}Browser);
  });

  it('should create browser with selector', () => {
    mockContainer.id = 'test-container';
    const browser = create{{className}}Browser('#test-container');
    expect(browser.getContainer()).toBe(mockContainer);
  });

  it('should create browser with element', () => {
    const browser = create{{className}}Browser(mockContainer);
    expect(browser.getContainer()).toBe(mockContainer);
  });
});