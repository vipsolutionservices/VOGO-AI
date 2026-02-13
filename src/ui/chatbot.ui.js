// src/ui/chatbot.ui.js

import I18n from '../i18n/translations.js';

class ChatbotUI {
  constructor(containerId, i18n) {
    this.containerId = containerId;
    this.i18n = i18n;
    this.isOpen = false;
    this.messageHandlers = [];
    
    this.init();
  }

  init() {
    // Inject HTML
    this.injectHTML();
    
    // Get elements
    this.bubble = document.getElementById('vogo-chat-bubble');
    this.window = document.getElementById('vogo-chat-window');
    this.messagesContainer = document.getElementById('vogo-chat-messages');
    this.input = document.getElementById('vogo-input');
    this.sendBtn = document.getElementById('vogo-send-btn');
    this.closeBtn = document.getElementById('vogo-close-btn');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup language selector
    this.setupLanguageSelector();
    
    // Show greeting
    this.showGreeting();
  }

  injectHTML() {
    const container = document.getElementById(this.containerId) || document.body;
    
    // Inject CSS
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'vogo-chatbot.css'; // Will be bundled
    document.head.appendChild(style);
    
    // Inject HTML structure
    const html = `
      <div id="vogo-chat-bubble">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.33-3.83-.91l-.27-.15-2.98.51.51-2.98-.15-.27C4.33 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>

      <div id="vogo-chat-window" class="hidden">
        <div class="vogo-chat-header">
          <div>
            <h3 id="vogo-bot-name">Kodee</h3>
            <div class="vogo-language-selector" id="vogo-language-selector"></div>
          </div>
          <button class="close-btn" id="vogo-close-btn">×</button>
        </div>

        <div class="vogo-chat-messages" id="vogo-chat-messages"></div>

        <div class="vogo-chat-input">
          <input 
            type="text" 
            id="vogo-input" 
            placeholder="${this.i18n.t('inputPlaceholder')}"
          />
          <button id="vogo-send-btn">${this.i18n.t('send')}</button>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
  }

  setupEventListeners() {
    // Open/close chat
    this.bubble.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.closeChat());
    
    // Send message
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  setupLanguageSelector() {
    const selector = document.getElementById('vogo-language-selector');
    const languages = [
      { code: 'en', label: 'EN' },
      { code: 'ro', label: 'RO' },
      { code: 'it', label: 'IT' },
      { code: 'fr', label: 'FR' },
      { code: 'de', label: 'DE' }
    ];

    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.textContent = lang.label;
      btn.dataset.lang = lang.code;
      
      if (lang.code === this.i18n.getCurrentLanguage()) {
        btn.classList.add('active');
      }
      
      btn.addEventListener('click', () => this.changeLanguage(lang.code));
      selector.appendChild(btn);
    });
  }

  changeLanguage(lang) {
    this.i18n.setLanguage(lang);
    
    // Update active button
    document.querySelectorAll('.vogo-language-selector button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update placeholder
    this.input.placeholder = this.i18n.t('inputPlaceholder');
    this.sendBtn.textContent = this.i18n.t('send');
    
    // Notify listeners about language change
    this.notifyLanguageChange(lang);
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.window.classList.remove('hidden');
    this.isOpen = true;
    this.input.focus();
  }

  closeChat() {
    this.window.classList.add('hidden');
    this.isOpen = false;
  }

  showGreeting() {
    const greeting = `
      <div class="vogo-bot-message">
        <strong>${this.i18n.t('greeting')}</strong><br>
        ${this.i18n.t('subGreeting')}
      </div>
    `;
    this.messagesContainer.innerHTML = greeting;
  }

  addBotMessage(text) {
    const message = document.createElement('div');
    message.className = 'vogo-bot-message';
    message.textContent = text;
    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
  }

  addUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'vogo-user-message';
    message.textContent = text;
    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'vogo-typing-indicator';
    typing.id = 'vogo-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typing = document.getElementById('vogo-typing');
    if (typing) typing.remove();
  }

  showPredefinedQuestions(questions) {
    const container = document.createElement('div');
    container.className = 'vogo-predefined-questions';

    questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'vogo-question-btn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
        <span>${q.text}</span>
      `;
      
      btn.addEventListener('click', () => {
        this.handleQuestionClick(q);
      });
      
      container.appendChild(btn);
    });

    this.messagesContainer.appendChild(container);
    this.scrollToBottom();
  }

  handleQuestionClick(question) {
    // Add user message
    this.addUserMessage(question.text);
    
    // Notify message handlers
    this.messageHandlers.forEach(handler => {
      handler({ type: 'question', data: question });
    });
  }

  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;

    // Add user message
    this.addUserMessage(text);
    
    // Clear input
    this.input.value = '';
    
    // Notify message handlers
    this.messageHandlers.forEach(handler => {
      handler({ type: 'text', data: { text } });
    });
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onLanguageChange(handler) {
    this.languageChangeHandler = handler;
  }

  notifyLanguageChange(lang) {
    if (this.languageChangeHandler) {
      this.languageChangeHandler(lang);
    }
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  clearMessages() {
    this.messagesContainer.innerHTML = '';
    this.showGreeting();
  }

  // ============================================================================
  // ✅ NEW: SEARCH RESULTS RENDERER (for shopping-list search)
  // This fixes "undefined / Product" cards by rendering correct fields.
  // ✅ UPDATED: Removed Qty from list display
  // ============================================================================

  showSearchResults(results = [], options = {}) {
    // results expected: [{ id, name, quantity, done }]
    // options can include labelText if you want
    const labelText = options.labelText || 'Shopping List';

    const container = document.createElement('div');
    container.className = 'vogo-predefined-questions'; // reuse existing styling

    if (!Array.isArray(results) || results.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'vogo-bot-message';
      msg.textContent = options.emptyText || 'No items found.';
      this.messagesContainer.appendChild(msg);
      this.scrollToBottom();
      return;
    }

    results.forEach(r => {
      const name = r?.name ?? r?.item_name ?? r?.title ?? 'Item';

      const btn = document.createElement('button');
      btn.className = 'vogo-question-btn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
        <span>
          <strong>${name}</strong><br/>
          <small>${labelText}</small>
        </span>
      `;

      // optional: clicking a result can re-add it or do nothing.
      btn.addEventListener('click', () => {
        // default: do nothing; keep for future features
      });

      container.appendChild(btn);
    });

    this.messagesContainer.appendChild(container);
    this.scrollToBottom();
  }
}

export default ChatbotUI;
