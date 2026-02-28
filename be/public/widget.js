(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var WEBSITE_ID = script.getAttribute('data-website-id');
  var API_URL = (script.getAttribute('data-api-url') || '').replace(/\/$/, '');

  if (!WEBSITE_ID || !API_URL) {
    console.error('[Fixy Widget] Missing data-website-id or data-api-url on script tag.');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────
  var config = {};
  var messages = [];
  var sessionId = sessionStorage.getItem('fixy_session_' + WEBSITE_ID) || null;
  var isOpen = false;
  var isLoading = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function generateId() {
    return Math.random().toString(36).slice(2);
  }

  function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : '99, 102, 241';
  }

  // ── CSS ────────────────────────────────────────────────────────────────────
  function injectStyles(primaryColor, position) {
    var rgb = hexToRgb(primaryColor);
    var isLeft = position === 'bottom-left';
    var side = isLeft ? 'left: 20px;' : 'right: 20px;';

    var css = [
      '#fixy-widget-btn{position:fixed;bottom:20px;' + side + 'width:56px;height:56px;border-radius:50%;background:' + primaryColor + ';border:none;cursor:pointer;z-index:2147483646;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(' + rgb + ',0.45);transition:transform .2s,box-shadow .2s;}',
      '#fixy-widget-btn:hover{transform:scale(1.08);box-shadow:0 6px 22px rgba(' + rgb + ',0.55);}',
      '#fixy-widget-btn svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '#fixy-widget-panel{position:fixed;bottom:88px;' + side + 'width:370px;max-width:calc(100vw - 28px);height:520px;max-height:calc(100vh - 110px);border-radius:16px;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.18);z-index:2147483645;display:flex;flex-direction:column;overflow:hidden;transition:opacity .22s,transform .22s;opacity:0;transform:translateY(12px) scale(.97);pointer-events:none;}',
      '#fixy-widget-panel.fixy-open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}',
      '#fixy-widget-header{background:' + primaryColor + ';padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
      '#fixy-widget-avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}',
      '#fixy-widget-avatar img{width:100%;height:100%;object-fit:cover;}',
      '#fixy-widget-avatar-icon{width:22px;height:22px;fill:#fff;}',
      '#fixy-widget-header-info{flex:1;min-width:0;}',
      '#fixy-widget-botname{color:#fff;font-weight:600;font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '#fixy-widget-status{color:rgba(255,255,255,.8);font-size:12px;display:flex;align-items:center;gap:4px;}',
      '#fixy-widget-status-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;flex-shrink:0;}',
      '#fixy-widget-close{background:none;border:none;cursor:pointer;padding:4px;color:#fff;opacity:.8;line-height:1;font-size:20px;transition:opacity .15s;}',
      '#fixy-widget-close:hover{opacity:1;}',
      '#fixy-widget-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
      '#fixy-widget-messages::-webkit-scrollbar{width:4px;}',
      '#fixy-widget-messages::-webkit-scrollbar-track{background:transparent;}',
      '#fixy-widget-messages::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}',
      '.fixy-msg{max-width:82%;word-break:break-word;font-size:14px;line-height:1.55;}',
      '.fixy-msg-bot{align-self:flex-start;}',
      '.fixy-msg-user{align-self:flex-end;}',
      '.fixy-bubble{padding:9px 13px;border-radius:16px;white-space:pre-wrap;}',
      '.fixy-msg-bot .fixy-bubble{background:#f3f4f6;color:#111827;border-bottom-left-radius:4px;}',
      '.fixy-msg-user .fixy-bubble{background:' + primaryColor + ';color:#fff;border-bottom-right-radius:4px;}',
      '.fixy-time{font-size:11px;color:#9ca3af;margin-top:3px;}',
      '.fixy-msg-bot .fixy-time{text-align:left;}',
      '.fixy-msg-user .fixy-time{text-align:right;}',
      '.fixy-typing{display:flex;gap:4px;align-items:center;padding:10px 14px;}',
      '.fixy-dot{width:7px;height:7px;border-radius:50%;background:#9ca3af;animation:fixy-bounce 1.2s infinite ease-in-out;}',
      '.fixy-dot:nth-child(2){animation-delay:.2s;}',
      '.fixy-dot:nth-child(3){animation-delay:.4s;}',
      '@keyframes fixy-bounce{0%,80%,100%{transform:scale(.7)}40%{transform:scale(1)}}',
      '#fixy-widget-footer{padding:10px 12px;border-top:1px solid #f3f4f6;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}',
      '#fixy-widget-input{flex:1;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 12px;font-size:14px;resize:none;outline:none;max-height:110px;min-height:40px;line-height:1.4;font-family:inherit;color:#111827;background:#fff;transition:border-color .15s;}',
      '#fixy-widget-input:focus{border-color:' + primaryColor + ';}',
      '#fixy-widget-input::placeholder{color:#9ca3af;}',
      '#fixy-widget-send{width:38px;height:38px;border-radius:10px;background:' + primaryColor + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}',
      '#fixy-widget-send:hover{opacity:.85;}',
      '#fixy-widget-send:disabled{opacity:.45;cursor:not-allowed;}',
      '#fixy-widget-send svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '#fixy-powered{font-size:10px;color:#9ca3af;text-align:center;padding:4px 0 6px;flex-shrink:0;}',
      '#fixy-powered a{color:#6b7280;text-decoration:none;}',
      '#fixy-powered a:hover{text-decoration:underline;}',
      '@media(max-width:420px){#fixy-widget-panel{width:calc(100vw - 20px);' + (isLeft ? 'left:10px;' : 'right:10px;') + 'border-radius:12px;}}',
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'fixy-widget-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── SVG icons ──────────────────────────────────────────────────────────────
  var CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SEND_ICON = '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  var BOT_AVATAR = '<svg id="fixy-widget-avatar-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.9)"/><path d="M20 21a8 8 0 1 0-16 0" fill="rgba(255,255,255,0.7)"/></svg>';

  // ── DOM Build ──────────────────────────────────────────────────────────────
  function buildWidget() {
    // Toggle button
    var btn = document.createElement('button');
    btn.id = 'fixy-widget-btn';
    btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML = CHAT_ICON;

    // Panel
    var panel = document.createElement('div');
    panel.id = 'fixy-widget-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat widget');

    // Header
    var avatarEl = document.createElement('div');
    avatarEl.id = 'fixy-widget-avatar';
    if (config.avatarUrl) {
      var img = document.createElement('img');
      img.src = config.avatarUrl;
      img.alt = config.botName;
      avatarEl.appendChild(img);
    } else {
      avatarEl.innerHTML = BOT_AVATAR;
    }

    var headerInfo = document.createElement('div');
    headerInfo.id = 'fixy-widget-header-info';
    headerInfo.innerHTML =
      '<div id="fixy-widget-botname">' + escapeHtml(config.botName) + '</div>' +
      '<div id="fixy-widget-status"><span id="fixy-widget-status-dot"></span>Online</div>';

    var closeBtn = document.createElement('button');
    closeBtn.id = 'fixy-widget-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML = '&times;';

    var header = document.createElement('div');
    header.id = 'fixy-widget-header';
    header.appendChild(avatarEl);
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Messages area
    var messagesEl = document.createElement('div');
    messagesEl.id = 'fixy-widget-messages';

    // Footer
    var input = document.createElement('textarea');
    input.id = 'fixy-widget-input';
    input.placeholder = 'Type your message…';
    input.rows = 1;
    input.setAttribute('aria-label', 'Message input');

    var sendBtn = document.createElement('button');
    sendBtn.id = 'fixy-widget-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.innerHTML = SEND_ICON;

    var footer = document.createElement('div');
    footer.id = 'fixy-widget-footer';
    footer.appendChild(input);
    footer.appendChild(sendBtn);

    var powered = document.createElement('div');
    powered.id = 'fixy-powered';
    powered.innerHTML = 'Powered by <a href="https://fixy.iamsamir.space" target="_blank" rel="noopener">Fixy</a>';

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(footer);
    panel.appendChild(powered);

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // ── Welcome message ──────────────────────────────────────────────────────
    appendMessage('bot', config.welcomeMessage);

    // ── Auto-resize textarea ─────────────────────────────────────────────────
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    });

    // ── Send on Enter (Shift+Enter = newline) ────────────────────────────────
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    sendBtn.addEventListener('click', handleSend);

    // ── Toggle open/close ────────────────────────────────────────────────────
    btn.addEventListener('click', function () {
      isOpen = !isOpen;
      panel.classList.toggle('fixy-open', isOpen);
      btn.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
      btn.innerHTML = isOpen ? CLOSE_ICON : CHAT_ICON;
      if (isOpen) {
        scrollToBottom();
        setTimeout(function () { input.focus(); }, 220);
      }
    });

    closeBtn.addEventListener('click', function () {
      isOpen = false;
      panel.classList.remove('fixy-open');
      btn.innerHTML = CHAT_ICON;
    });
  }

  // ── Message rendering ──────────────────────────────────────────────────────
  function appendMessage(role, text) {
    var msg = { id: generateId(), role: role, text: text, time: new Date() };
    messages.push(msg);
    renderMessage(msg);
    scrollToBottom();
  }

  function renderMessage(msg) {
    var messagesEl = document.getElementById('fixy-widget-messages');
    if (!messagesEl) return;

    var timeStr = msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var wrapper = document.createElement('div');
    wrapper.className = 'fixy-msg fixy-msg-' + msg.role;
    wrapper.dataset.id = msg.id;
    wrapper.innerHTML =
      '<div class="fixy-bubble">' + escapeHtml(msg.text) + '</div>' +
      '<div class="fixy-time">' + timeStr + '</div>';
    messagesEl.appendChild(wrapper);
  }

  function showTyping() {
    var messagesEl = document.getElementById('fixy-widget-messages');
    if (!messagesEl) return;
    var typing = document.createElement('div');
    typing.id = 'fixy-typing';
    typing.className = 'fixy-msg fixy-msg-bot';
    typing.innerHTML = '<div class="fixy-bubble fixy-typing"><span class="fixy-dot"></span><span class="fixy-dot"></span><span class="fixy-dot"></span></div>';
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('fixy-typing');
    if (el) el.parentNode.removeChild(el);
  }

  function scrollToBottom() {
    var el = document.getElementById('fixy-widget-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  function handleSend() {
    var input = document.getElementById('fixy-widget-input');
    var sendBtn = document.getElementById('fixy-widget-send');
    if (!input || isLoading) return;

    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    appendMessage('user', text);

    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    var body = JSON.stringify({ query: text, websiteId: Number(WEBSITE_ID), sessionId: sessionId });

    fetch(API_URL + '/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': config.apiSecret,
      },
      body: body,
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        if (data.sessionId) {
          sessionId = data.sessionId;
          sessionStorage.setItem('fixy_session_' + WEBSITE_ID, sessionId);
        }
        var reply = data.response || data.answer || 'Sorry, I could not get a response.';
        appendMessage('bot', reply);
      })
      .catch(function () {
        hideTyping();
        appendMessage('bot', 'Something went wrong. Please try again.');
      })
      .finally(function () {
        isLoading = false;
        sendBtn.disabled = false;
      });
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  function init(cfg) {
    config = cfg;
    injectStyles(config.primaryColor || '#6366f1', config.position || 'bottom-right');
    buildWidget();
  }

  function fetchConfigAndInit() {
    fetch(API_URL + '/api/v1/public/websites/' + WEBSITE_ID + '/widget-config')
      .then(function (res) { return res.json(); })
      .then(function (cfg) { init(cfg); })
      .catch(function (err) {
        console.error('[Fixy Widget] Failed to load config:', err);
        // Init with defaults so the widget still appears
        init({
          botName: 'Support Bot',
          primaryColor: '#6366f1',
          welcomeMessage: 'Hi! How can I help you today?',
          position: 'bottom-right',
          apiSecret: '',
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchConfigAndInit);
  } else {
    fetchConfigAndInit();
  }
})();
