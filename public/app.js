/* ========================================
   Nova AI — Frontend Application
   ======================================== */

(function () {
  'use strict';

  // ── Elements ──
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesContainer = document.getElementById('messagesContainer');
  const messagesList = document.getElementById('messagesList');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const typingIndicator = document.getElementById('typingIndicator');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const suggestionCards = document.querySelectorAll('.suggestion-card');

  // ── State ──
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  let isProcessing = false;

  // ── Configure Marked ──
  marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (e) { /* fallback */ }
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
  });

  // ── Auto-resize textarea ──
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
    sendBtn.disabled = !messageInput.value.trim();
  });

  // ── Submit on Enter (Shift+Enter for new line) ──
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing && messageInput.value.trim()) {
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  // ── Suggestion cards ──
  suggestionCards.forEach((card) => {
    card.addEventListener('click', () => {
      const prompt = card.dataset.prompt;
      if (prompt) {
        messageInput.value = prompt;
        sendBtn.disabled = false;
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // ── Send message ──
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;

    // Hide welcome screen
    if (welcomeScreen) {
      welcomeScreen.style.display = 'none';
    }

    // Add user message
    appendMessage('user', text);

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Show typing
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      typingIndicator.style.display = 'none';
      appendMessage('assistant', data.reply, data.usage);
    } catch (err) {
      typingIndicator.style.display = 'none';
      showError(err.message || 'Failed to get response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      isProcessing = false;
      sendBtn.disabled = !messageInput.value.trim();
    }
  });

  // ── Append Message ──
  function appendMessage(role, content, usage) {
    const div = document.createElement('div');
    div.className = `message message-${role}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (role === 'user') {
      div.innerHTML = `
        <div class="message-avatar">U</div>
        <div class="message-content">
          <div class="message-author">You <span class="message-time">${timeStr}</span></div>
          <div class="message-body">${escapeHtml(content)}</div>
        </div>
      `;
    } else {
      const renderedContent = renderMarkdown(content);
      div.innerHTML = `
        <div class="message-avatar">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="url(#msgGrad${Date.now()})" stroke-width="2" fill="none"/>
            <circle cx="14" cy="14" r="3" fill="url(#msgGrad${Date.now()})"/>
            <defs><linearGradient id="msgGrad${Date.now()}" x1="2" y1="2" x2="26" y2="26"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs>
          </svg>
        </div>
        <div class="message-content">
          <div class="message-author">Nova <span class="message-time">${timeStr}</span></div>
          <div class="message-body">${renderedContent}</div>
        </div>
      `;
    }

    messagesList.appendChild(div);

    // Apply syntax highlighting to new code blocks
    div.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

    // Add copy buttons to code blocks
    div.querySelectorAll('pre').forEach((pre) => {
      addCopyButton(pre);
    });

    scrollToBottom();
  }

  // ── Render Markdown ──
  function renderMarkdown(text) {
    try {
      return marked.parse(text);
    } catch {
      return escapeHtml(text);
    }
  }

  // ── Add Copy Button to Code Blocks ──
  function addCopyButton(preElement) {
    const codeEl = preElement.querySelector('code');
    if (!codeEl) return;

    // Detect language
    const classes = codeEl.className || '';
    const langMatch = classes.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : 'code';

    const header = document.createElement('div');
    header.className = 'code-header';
    header.innerHTML = `
      <span>${lang}</span>
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
    `;

    preElement.insertBefore(header, preElement.firstChild);
  }

  // ── Copy Code (global) ──
  window.copyCode = function (btn) {
    const pre = btn.closest('pre');
    const code = pre.querySelector('code');
    if (!code) return;

    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.textContent = 'Copied!';
      btn.style.color = '#34d399';
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.style.color = '';
      }, 2000);
    }).catch(() => {
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  };

  // ── Escape HTML ──
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Scroll to Bottom ──
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  // ── Error Toast ──
  function showError(message) {
    // Remove existing toast
    const existing = document.querySelector('.error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ── Clear Chat ──
  function clearChat() {
    messagesList.innerHTML = '';
    if (welcomeScreen) {
      welcomeScreen.style.display = 'flex';
    }

    fetch('/api/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => { /* silent */ });
  }

  clearChatBtn.addEventListener('click', clearChat);
  newChatBtn.addEventListener('click', clearChat);

  // ── Mobile sidebar ──
  let overlay = null;

  function openSidebar() {
    sidebar.classList.add('open');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay show';
      overlay.addEventListener('click', closeSidebar);
      document.body.appendChild(overlay);
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  mobileMenuBtn.addEventListener('click', openSidebar);

  // ── Focus input on load ──
  messageInput.focus();

})();
