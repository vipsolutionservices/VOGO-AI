// public/chatbot.js - PHASE 1 QUICK FIX - Properly displays lists
// ✅ FIXED: Removed Qty from shopping list + search results display
// ✅ FIXED: Removed time from agenda UI (keeps DATE only) + removed time from "Added ... on YYYY-MM-DD HH:MM:SS" message

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    proxyUrl: 'http://localhost:3000/api/chatbot',
    nlpUrl: 'http://localhost:3000/api/chatbot-nlp',
    botName: 'Kodee',
    defaultLanguage: 'en',
    baseWebsiteUrl: 'https://vogo.family'
  };

  // Translations
  const TRANSLATIONS = {
    en: {
      greeting: 'Hello 👋',
      subGreeting: 'How can I help you today?',
      inputPlaceholder: 'Ask Kodee anything...',
      send: 'Send',
      errorMessage: 'Sorry, something went wrong. Please try again.',
      thinking: 'Thinking...',
      noResults: 'No results found.',
      demoMode: '(Demo mode)'
    },
    ro: {
      greeting: 'Bună 👋',
      subGreeting: 'Cum vă pot ajuta astăzi?',
      inputPlaceholder: 'Întreabă-l pe Kodee orice...',
      send: 'Trimite',
      errorMessage: 'Ne pare rău, ceva nu a mers bine. Vă rugăm încercați din nou.',
      thinking: 'Gândesc...',
      noResults: 'Nu s-au găsit rezultate.',
      demoMode: '(Mod demo)'
    },
    it: {
      greeting: 'Ciao 👋',
      subGreeting: 'Come posso aiutarti oggi?',
      inputPlaceholder: 'Chiedi a Kodee qualsiasi cosa...',
      send: 'Invia',
      errorMessage: 'Spiacenti, qualcosa è andato storto. Riprova.',
      thinking: 'Pensando...',
      noResults: 'Nessun risultato trovato.',
      demoMode: '(Modalità demo)'
    },
    fr: {
      greeting: 'Bonjour 👋',
      subGreeting: 'Comment puis-je vous aider aujourd\'hui?',
      inputPlaceholder: 'Demandez à Kodee n\'importe quoi...',
      send: 'Envoyer',
      errorMessage: 'Désolé, quelque chose s\'est mal passé. Veuillez réessayer.',
      thinking: 'Réfléchir...',
      noResults: 'Aucun résultat trouvé.',
      demoMode: '(Mode démo)'
    },
    de: {
      greeting: 'Hallo 👋',
      subGreeting: 'Wie kann ich Ihnen heute helfen?',
      inputPlaceholder: 'Fragen Sie Kodee etwas...',
      send: 'Senden',
      errorMessage: 'Entschuldigung, etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
      thinking: 'Denken...',
      noResults: 'Keine Ergebnisse gefunden.',
      demoMode: '(Demo-Modus)'
    }
  };

  // Main Chatbot Class
  class VogoChatbot {
    constructor() {
      this.currentLanguage = CONFIG.defaultLanguage;
      this.conversationStack = [];
      this.isOpen = false;

      this.init();
    }

    init() {
      this.injectCSS();
      this.injectHTML();
      this.cacheElements();
      this.setupEventListeners();
      this.showGreeting();
      this.loadInitialQuestions();
    }

    injectCSS() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'chatbot.css';
      document.head.appendChild(link);
    }

    injectHTML() {
      const html = `
        <div id="vogo-chat-bubble">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.33-3.83-.91l-.27-.15-2.98.51.51-2.98-.15-.27C4.33 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>

        <div id="vogo-chat-window" class="hidden">
          <div class="vogo-chat-header">
            <div>
              <h3>${CONFIG.botName}</h3>
            
            </div>
            <button class="close-btn">×</button>
          </div>

          <div class="vogo-chat-messages" id="vogo-messages"></div>

          <div class="vogo-chat-input">
            <input type="text" id="vogo-input" placeholder="${this.t('inputPlaceholder')}" />
            <button id="vogo-send">${this.t('send')}</button>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
    }

    cacheElements() {
      this.bubble = document.getElementById('vogo-chat-bubble');
      this.window = document.getElementById('vogo-chat-window');
      this.messagesContainer = document.getElementById('vogo-messages');
      this.input = document.getElementById('vogo-input');
      this.sendBtn = document.getElementById('vogo-send');
      this.closeBtn = document.querySelector('.close-btn');
    }

    setupEventListeners() {
      this.bubble.addEventListener('click', () => this.toggleChat());
      this.closeBtn.addEventListener('click', () => this.closeChat());
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    t(key) {
      return TRANSLATIONS[this.currentLanguage][key] || key;
    }

    toggleChat() {
      this.isOpen ? this.closeChat() : this.openChat();
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
      const greeting = document.createElement('div');
      greeting.className = 'vogo-bot-message';
      greeting.innerHTML = `<strong>${this.t('greeting')}</strong><br>${this.t('subGreeting')}`;
      this.messagesContainer.appendChild(greeting);
    }

    addUserMessage(text) {
      const message = document.createElement('div');
      message.className = 'vogo-user-message';
      message.textContent = text;
      this.messagesContainer.appendChild(message);
      this.scrollToBottom();
    }

    addBotMessage(text) {
      const message = document.createElement('div');
      message.className = 'vogo-bot-message';
      message.textContent = text;
      this.messagesContainer.appendChild(message);
      this.scrollToBottom();
    }

    addBotMessageHTML(html) {
      const message = document.createElement('div');
      message.className = 'vogo-bot-message';
      message.innerHTML = html;
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

        btn.addEventListener('click', () => this.handleQuestionClick(q));
        container.appendChild(btn);
      });

      this.messagesContainer.appendChild(container);
      this.scrollToBottom();
    }

    // FIX #1 & #4: Properly display shopping list and calendar items
    // ✅ UPDATED: Removed Qty from shopping items display
    // ✅ UPDATED: Calendar shows DATE ONLY (no time)
    showListItems(items, type = 'shopping') {
      if (!items || items.length === 0) {
        this.addBotMessage(type === 'shopping' ? 'Your shopping list is empty.' : 'Your calendar is empty.');
        return;
      }

      const container = document.createElement('div');
      container.className = 'vogo-list-items';
      container.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;';

      const title = document.createElement('div');
      title.style.cssText = 'font-weight: 600; margin-bottom: 10px; color: #667eea;';
      title.textContent = type === 'shopping' ? `Items: ${items.length}` : `Events: ${items.length}`;
      container.appendChild(title);

      items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'padding: 8px; margin: 5px 0; background: white; border-radius: 4px; display: flex; align-items: center; gap: 10px;';

        if (type === 'shopping') {
          // backend returns {name, quantity, done} OR old simple strings
          const rawName = (typeof item === 'string')
            ? item
            : (item.item || item.name || item.item_name || 'Item');

          // ✅ If backend sends "milk (Qty: 1)" as a string, strip it
          const name = String(rawName).replace(/\s*\(Qty:\s*\d+\)\s*/gi, '').trim();

          const done = (typeof item === 'object' && item) ? (item.done ?? item.is_done ?? false) : false;

          // ✅ NO QTY in UI
          itemDiv.innerHTML = `
            <span style="color: ${done ? '#28a745' : '#999'}; font-weight: bold;">${done ? '✓' : '•'}</span>
            <span>${name}</span>
          `;
        } else {
          // Calendar/agenda item (DB returns name/datetime)
          const eventTitle = item.event || item.title || item.name || item.event_name || 'Event';
          const eventTime = item.time || item.date || item.datetime || item.event_datetime || '';

          // ✅ Extract only YYYY-MM-DD from "YYYY-MM-DD HH:MM:SS"
          const dateOnly = eventTime ? String(eventTime).split(' ')[0] : '';

          itemDiv.innerHTML = `
            <span style="color: #667eea; font-weight: bold;">📅</span>
            <div style="flex: 1;">
              <div style="font-weight: 500;">${eventTitle}</div>
              ${dateOnly ? `<div style="font-size: 12px; color: #666;">${dateOnly}</div>` : ''}
            </div>
          `;
        }

        container.appendChild(itemDiv);
      });

      this.messagesContainer.appendChild(container);
      this.scrollToBottom();
    }

    // ✅ FIXED: Search results now show SHOPPING LIST matches (NOT products)
    // ✅ UPDATED: Removed Qty from search results display
    showSearchResults(results) {
      if (!results || results.length === 0) {
        this.addBotMessage(this.t('noResults'));
        return;
      }

      const container = document.createElement('div');
      container.className = 'vogo-search-results';

      results.slice(0, 5).forEach(item => {
        const rawName = item?.name ?? item?.item_name ?? item?.title ?? 'Item';
        const name = String(rawName).replace(/\s*\(Qty:\s*\d+\)\s*/gi, '').trim();
        const done = item?.done ?? item?.is_done ?? false;

        const resultDiv = document.createElement('div');
        resultDiv.className = 'vogo-search-item';

        // ✅ No Qty in UI
        resultDiv.innerHTML = `
          <strong>${name}</strong><br>
          <small>Shopping List${done ? ' • ✓' : ''}</small>
        `;

        container.appendChild(resultDiv);
      });

      this.messagesContainer.appendChild(container);
      this.scrollToBottom();
    }

    async handleQuestionClick(question) {
      console.log('🔎 Question clicked:', question);

      this.addUserMessage(question.text);
      this.showTypingIndicator();

      try {
        const fullUrl = this.buildFullUrl(question.link);

        if (fullUrl) {
          this.hideTypingIndicator();
          this.addBotMessageHTML(
            `Opening: <a href="${fullUrl}" target="_blank" style="color: #667eea; text-decoration: underline;">${fullUrl}</a>`
          );

          try {
            window.open(fullUrl, '_blank');
          } catch (error) {
            console.error('Error opening link:', error);
          }

          return;
        }

        const response = await this.callAPI('getPredefinedQA', { parent_id: question.id, lang: "auto" });

        this.hideTypingIndicator();

        if (response.data && response.data.length > 0) {
          this.showPredefinedQuestions(response.data);
        } else {
          this.addBotMessage('Thank you for your question!');
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addBotMessage(this.t('errorMessage'));
        console.error('Error handling question:', error);
      }
    }

    buildFullUrl(link) {
      if (!link || link === 'null' || link === null) {
        return null;
      }

      const cleanLink = link.trim();

      if (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) {
        return cleanLink;
      }

      if (cleanLink.startsWith('/')) {
        return CONFIG.baseWebsiteUrl + cleanLink;
      }

      return CONFIG.baseWebsiteUrl + '/' + cleanLink;
    }

    async sendMessage() {
      const text = this.input.value.trim();
      if (!text) return;

      this.addUserMessage(text);
      this.input.value = '';

      this.showTypingIndicator();

      try {
        const response = await fetch(CONFIG.nlpUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            language: "auto"
          })
        });

        const data = await response.json();

        this.hideTypingIndicator();

        if (data.success && data.result) {
          const result = data.result;

          // Show response
          this.addBotMessage(result.response);

          // Log matching info (for debugging)
          console.log(`🎯 Intent: ${result.intent} | Method: ${result.method} | Confidence: ${result.confidence}`);

          // FIX #1 & #4: Show action results with proper display
          if (data.action) {
            // Shopping list items
            if (data.action.items && Array.isArray(data.action.items) && data.action.items.length > 0) {
              this.showListItems(data.action.items, 'shopping');
            }
            // Calendar/agenda events
            else if (data.action.events && Array.isArray(data.action.events) && data.action.events.length > 0) {
              this.showListItems(data.action.events, 'calendar');
            }
            // Search results (NOW shopping-list matches)
            else if (data.action.results && Array.isArray(data.action.results) && data.action.results.length > 0) {
              this.showSearchResults(data.action.results);
            }
            // Additional message
            else if (data.action.message) {
              // ✅ Strip time from "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DD"
              const msg = String(data.action.message)
                .replace(/\b(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\b/g, '$1');

              if (msg !== result.response) {
                this.addBotMessage(msg);
              }
            }
          }
        } else {
          this.addBotMessage(this.t('errorMessage'));
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addBotMessage(this.t('errorMessage'));
        console.error('NLP Error:', error);
      }
    }

    async loadInitialQuestions() {
      this.showTypingIndicator();

      try {
        const response = await this.callAPI('getPredefinedQA', { parent_id: null, lang: "auto" });

        this.hideTypingIndicator();

        if (response.data && response.data.length > 0) {
          this.showPredefinedQuestions(response.data);
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addBotMessage(this.t('errorMessage'));
        console.error('Error loading questions:', error);
      }
    }

    async callAPI(action, data) {
      const response = await fetch(CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      return await response.json();
    }

    clearMessages() {
      this.messagesContainer.innerHTML = '';
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VogoChatbot());
  } else {
    new VogoChatbot();
  }

  // Make available globally
  window.VogoChatbot = VogoChatbot;
})();
