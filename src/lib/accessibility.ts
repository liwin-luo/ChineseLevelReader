// 可访问性工具库

/**
 * 键盘导航支持
 */
export class KeyboardNavigation {
  private static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex=\"-1\"])',
    '[contenteditable=\"true\"]'
  ].join(', ');

  /**
   * 获取容器内所有可聚焦元素
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors)) as HTMLElement[];
  }

  /**
   * 创建焦点陷阱
   */
  static createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * 添加跳转到主内容的快捷键
   */
  static addSkipToMainContent() {
    if (typeof window === 'undefined') return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = '跳转到主内容';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

/**
 * ARIA 标签管理
 */
export class AriaManager {
  /**
   * 设置元素的 ARIA 属性
   */
  static setAriaAttributes(element: HTMLElement, attributes: Record<string, string | boolean | number>) {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      element.setAttribute(ariaKey, String(value));
    });
  }

  /**
   * 创建实时区域公告
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // 短暂延迟后移除
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * 管理模态框的 ARIA 属性
   */
  static setupModalAria(modal: HTMLElement, triggerId?: string) {
    const modalId = modal.id || `modal-${Date.now()}`;
    modal.id = modalId;
    
    this.setAriaAttributes(modal, {
      'role': 'dialog',
      'aria-modal': 'true',
      'aria-hidden': 'false'
    });

    if (triggerId) {
      const trigger = document.getElementById(triggerId);
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', modalId);
      }
    }

    // 查找标题元素并设置 aria-labelledby
    const title = modal.querySelector('h1, h2, h3, h4, h5, h6, [role=\"heading\"]') as HTMLElement;
    if (title) {
      const titleId = title.id || `${modalId}-title`;
      title.id = titleId;
      modal.setAttribute('aria-labelledby', titleId);
    }
  }

  /**
   * 管理下拉菜单的 ARIA 属性
   */
  static setupDropdownAria(trigger: HTMLElement, dropdown: HTMLElement) {
    const dropdownId = dropdown.id || `dropdown-${Date.now()}`;
    dropdown.id = dropdownId;
    
    this.setAriaAttributes(trigger, {
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': dropdownId
    });

    this.setAriaAttributes(dropdown, {
      'role': 'menu',
      'aria-hidden': 'true'
    });

    // 为菜单项添加角色
    const menuItems = dropdown.querySelectorAll('a, button');
    menuItems.forEach(item => {
      item.setAttribute('role', 'menuitem');
    });
  }
}

/**
 * 颜色对比度和主题管理
 */
export class ThemeAccessibility {
  /**
   * 检测用户的偏好设置
   */
  static getUserPreferences() {
    if (typeof window === 'undefined') return {};

    return {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }

  /**
   * 应用减少动画设置
   */
  static applyReducedMotion() {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
      
      // 添加 CSS 样式
      const style = document.createElement('style');
      style.textContent = `
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * 应用高对比度主题
   */
  static applyHighContrast() {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
      
      // 高对比度样式
      const style = document.createElement('style');
      style.textContent = `
        .high-contrast {
          --text-color: #000000;
          --bg-color: #ffffff;
          --border-color: #000000;
          --link-color: #0000ff;
          --visited-color: #800080;
        }
        
        .high-contrast * {
          color: var(--text-color) !important;
          background-color: var(--bg-color) !important;
          border-color: var(--border-color) !important;
        }
        
        .high-contrast a {
          color: var(--link-color) !important;
        }
        
        .high-contrast a:visited {
          color: var(--visited-color) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * 屏幕阅读器支持
 */
export class ScreenReaderSupport {
  /**
   * 添加视觉隐藏但屏幕阅读器可访问的文本
   */
  static addScreenReaderText(element: HTMLElement, text: string) {
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = text;
    element.appendChild(srText);
  }

  /**
   * 为复杂内容添加描述
   */
  static addDescription(element: HTMLElement, description: string) {
    const descId = `desc-${Date.now()}`;
    const descElement = document.createElement('div');
    descElement.id = descId;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    
    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', descId);
  }

  /**
   * 管理页面标题的层级结构
   */
  static validateHeadingStructure() {
    if (typeof window === 'undefined') return;

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const issues: string[] = [];
    
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('页面应该以 h1 标题开始');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`标题层级跳跃：${heading.textContent} (h${level})`);
      }
      
      previousLevel = level;
    });
    
    if (issues.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('标题结构问题：', issues);
    }
  }
}

/**
 * 可访问性初始化
 */
export const initializeAccessibility = (): void => {
  if (typeof window === 'undefined') return;

  // 添加跳转链接
  KeyboardNavigation.addSkipToMainContent();
  
  // 应用用户偏好
  ThemeAccessibility.applyReducedMotion();
  ThemeAccessibility.applyHighContrast();
  
  // 验证标题结构（开发模式）
  if (process.env.NODE_ENV === 'development') {
    ScreenReaderSupport.validateHeadingStructure();
  }
  
  // 添加基础 CSS 类
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .sr-only:focus,
    .sr-only:active {
      position: static;
      width: auto;
      height: auto;
      margin: 0;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
    
    *:focus {
      outline: 2px solid #4F46E5;
      outline-offset: 2px;
    }
    
    .focus-visible {
      outline: 2px solid #4F46E5;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
};