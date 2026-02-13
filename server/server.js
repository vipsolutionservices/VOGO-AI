// ============================================================================
// VOGO CHATBOT - MAIN SERVER (API-Powered Version)
// File: server/server.js
// Uses REST API (vogo.family) instead of local database
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import configuration
const CONSTANTS = require('../config/general_constant');
const VARIABLES = require('../config/general_variable');

// Import services
const nlpService = require('./nlp_service');
const vogoApi = require('./services/vogoApi');

// ============================================================================
// APPLICATION SETUP
// ============================================================================
const app = express();
const PORT = process.env.SERVER_PORT || CONSTANTS.DEFAULTS.SERVER_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory conversation logs
const conversationLogs = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
let isInitialized = false;

async function initializeServices() {
  if (isInitialized) return true;

  console.log('\n' + '='.repeat(70));
  console.log('🚀 VOGO CHATBOT - API-POWERED VERSION');
  console.log('='.repeat(70));

  try {
    // 1. Test API Connection
    console.log('\n🌐 Step 1/2: Testing API Connection...');
    console.log(`   API Base: ${process.env.VOGO_API_BASE || 'https://vogo.family/wp-json'}`);
    
    try {
      await vogoApi.getToken();
      console.log('✅ API Connection successful');
      VARIABLES.runtimeState.dbConnected = true;
    } catch (error) {
      console.error('⚠️ API Connection failed:', error.message);
      console.log('   Will retry on first request...');
      VARIABLES.runtimeState.dbConnected = false;
    }

    // 2. Initialize NLP Service
    console.log('\n🤖 Step 2/2: Initializing NLP Service...');
    await nlpService.initialize();
    VARIABLES.runtimeState.nlpInitialized = true;
    console.log('✅ NLP Service initialized');

    // Mark as initialized
    isInitialized = true;
    VARIABLES.runtimeState.isInitialized = true;
    VARIABLES.runtimeState.startTime = Date.now();
    VARIABLES.configState.features.apiCallsEnabled = true;

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL SERVICES INITIALIZED SUCCESSFULLY');
    console.log('='.repeat(70));

    return true;
  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

// ============================================================================
// HOME PAGE
// ============================================================================
app.get('/', (req, res) => {
  const health = VARIABLES.getSystemHealth();

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vogo Chatbot - API Powered</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px; 
          margin: 30px auto; 
          padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container { 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #667eea; margin: 0 0 10px 0; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .status {
          padding: 20px;
          background: ${health.status === 'healthy' ? '#d4edda' : '#f8d7da'};
          border-left: 4px solid ${health.status === 'healthy' ? '#28a745' : '#dc3545'};
          border-radius: 6px;
          margin: 20px 0;
        }
        .status h3 { margin-top: 0; color: ${health.status === 'healthy' ? '#155724' : '#721c24'}; }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card strong { display: block; font-size: 32px; color: #667eea; margin-bottom: 5px; }
        .stat-card small { color: #666; }
        .button-group { display: flex; gap: 15px; margin: 30px 0; flex-wrap: wrap; }
        button, .button { 
          background: #667eea; color: white; border: none; 
          padding: 15px 30px; border-radius: 8px; cursor: pointer;
          font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block;
        }
        button:hover, .button:hover { background: #5568d3; }
        .test-btn { background: #17a2b8; }
        .test-btn:hover { background: #138496; }
        .api-badge {
          display: inline-block; background: #28a745; color: white;
          padding: 4px 12px; border-radius: 20px; font-size: 12px;
          margin-left: 10px; vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Vogo Chatbot <span class="api-badge">API Powered</span></h1>
        <p class="subtitle">Connected to vogo.family REST API</p>
        
        <div class="status">
          <h3>System Status: ${health.status.toUpperCase()}</h3>
          <p><strong>API Connection:</strong> ${health.dbConnected ? '✅ Connected' : '⚠️ Reconnecting...'}</p>
          <p><strong>NLP Service:</strong> ${health.nlpInitialized ? '✅ Active' : '❌ Inactive'}</p>
          <p><strong>Mode:</strong> 🌐 REST API (vogo.family)</p>
          <p><strong>Uptime:</strong> ${Math.floor(health.uptime / 1000)}s</p>
        </div>
        
        <div class="stats">
          <div class="stat-card"><strong>${health.totalRequests}</strong><small>Total Requests</small></div>
          <div class="stat-card"><strong>${health.totalConversations}</strong><small>Conversations</small></div>
          <div class="stat-card"><strong>API</strong><small>Data Source</small></div>
          <div class="stat-card"><strong>${health.recentErrors}</strong><small>Recent Errors</small></div>
        </div>
        
        <div class="button-group">
          <a href="/test.html" class="button test-btn">🧪 OPEN CHATBOT</a>
          <a href="/logs" class="button">📋 VIEW LOGS</a>
          <a href="/health" class="button">💚 HEALTH CHECK</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', async (req, res) => {
  const health = VARIABLES.getSystemHealth();

  let apiStatus = 'unknown';
  try {
    await vogoApi.getToken();
    apiStatus = 'connected';
    VARIABLES.runtimeState.dbConnected = true;
  } catch (e) {
    apiStatus = 'disconnected';
    VARIABLES.runtimeState.dbConnected = false;
  }

  res.json({
    status: health.status,
    timestamp: new Date().toISOString(),
    uptime: health.uptime,
    api: { status: apiStatus, baseUrl: process.env.VOGO_API_BASE || 'https://vogo.family/wp-json' },
    nlp: { initialized: health.nlpInitialized },
    stats: { totalRequests: health.totalRequests, totalConversations: health.totalConversations },
    memory: health.memoryUsage
  });
});

// ============================================================================
// LOGS VIEWER
// ============================================================================
app.get('/logs', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Conversation Logs</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1400px; margin: 30px auto; padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { background: white; padding: 30px; border-radius: 12px; }
        h1 { color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #667eea; color: white; position: sticky; top: 0; }
        tr:hover { background: #f5f5f5; }
        .method { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .nlp { background: #cfe2ff; color: #084298; }
        .regex { background: #d4edda; color: #155724; }
        .keyword { background: #fff3cd; color: #856404; }
        .fallback { background: #f8d7da; color: #721c24; }
        .api-badge { background: #17a2b8; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; margin-left: 10px; }
        .btn-group { display: flex; gap: 10px; margin-top: 20px; }
        .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block; }
        .btn-refresh { background: #28a745; color: white; }
        .btn-home { background: #667eea; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📋 Conversation Logs <span class="api-badge">API Mode</span></h1>
        <p>Showing last ${conversationLogs.length} conversations (in-memory)</p>
        
        ${conversationLogs.length === 0 ? `
          <p style="text-align: center; padding: 40px; color: #999;">No conversations yet. Start chatting!</p>
        ` : `
          <table>
            <thead><tr><th>Time</th><th>Method</th><th>Message</th><th>Intent</th><th>Confidence</th><th>Language</th></tr></thead>
            <tbody>
              ${conversationLogs.slice().reverse().map(log => `
                <tr>
                  <td>${new Date(log.timestamp).toLocaleString()}</td>
                  <td><span class="method ${log.method || 'fallback'}">${(log.method || 'unknown').toUpperCase()}</span></td>
                  <td>${log.message || ''}</td>
                  <td><strong>${log.intent || 'unknown'}</strong></td>
                  <td>${log.confidence != null ? Number(log.confidence).toFixed(2) : 'N/A'}</td>
                  <td>${(log.language || 'en').toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
        
        <div class="btn-group">
          <button onclick="location.reload()" class="btn btn-refresh">🔄 Refresh</button>
          <a href="/" class="btn btn-home">🏠 Home</a>
          <a href="/test.html" class="btn btn-refresh">🧪 Open Chatbot</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ============================================================================
// DATE/TIME PARSING UTILITIES
// ============================================================================

function parseHumanDateToMysql(input) {
  if (!input) return null;

  const raw = String(input).trim().toLowerCase();
  const now = new Date();

  const toMysqlFormat = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (raw === 'today') { const d = new Date(now); d.setHours(9, 0, 0, 0); return toMysqlFormat(d); }
  if (raw === 'tonight') { const d = new Date(now); d.setHours(20, 0, 0, 0); return toMysqlFormat(d); }
  if (raw === 'tomorrow') { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return toMysqlFormat(d); }
  if (raw === 'next week') { const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return toMysqlFormat(d); }
  if (raw === 'next month') { const d = new Date(now); d.setMonth(d.getMonth() + 1); d.setHours(9, 0, 0, 0); return toMysqlFormat(d); }

  const weekdays = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  if (weekdays[raw] !== undefined) {
    const target = weekdays[raw];
    const d = new Date(now);
    let diff = (target - d.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    d.setDate(d.getDate() + diff);
    d.setHours(9, 0, 0, 0);
    return toMysqlFormat(d);
  }

  const dateMatch = raw.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  if (dateMatch) {
    const months = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
    const d = new Date(parseInt(dateMatch[3]), months[dateMatch[2].toLowerCase()], parseInt(dateMatch[1]), 9, 0, 0);
    return toMysqlFormat(d);
  }

  const timeMatch = raw.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3]?.toLowerCase();
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    if (!period && hours >= 1 && hours <= 7) hours += 12;
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return toMysqlFormat(d);
  }

  const direct = new Date(input);
  if (!isNaN(direct.getTime())) return toMysqlFormat(direct);

  return null;
}

function extractEventAndDatetime(eventText, dateStr) {
  if (!eventText) return { event: '', datetime: null };
  let event = eventText.trim();
  let datetime = dateStr ? parseHumanDateToMysql(dateStr) : null;
  
  const timeMatch = event.match(/\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*$/i);
  if (timeMatch) {
    event = event.replace(timeMatch[0], '').trim();
    const timeDatetime = parseHumanDateToMysql(timeMatch[1]);
    if (timeDatetime) {
      if (datetime) {
        datetime = `${datetime.split(' ')[0]} ${timeDatetime.split(' ')[1]}`;
      } else {
        datetime = timeDatetime;
      }
    }
  }
  return { event, datetime };
}

// ============================================================================
// NLP CHATBOT ENDPOINT (API-Powered)
// ============================================================================
app.post('/api/chatbot-nlp', async (req, res) => {
  const { text, language } = req.body;

  if (!nlpService) {
    return res.json({ success: false, message: 'NLP service not available' });
  }

  VARIABLES.incrementStat('totalRequests');
  VARIABLES.incrementStat('totalConversations');

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 Received: "${text}" [${language}]`);

    const result = await nlpService.processMessage(text, language);
    console.log(`🎯 Intent: ${result.intent} | Method: ${result.method}`);

    const entities = nlpService.extractEntities(text, result.intent);
    let actionResult = null;

    switch (result.intent) {
      // =====================================================================
      // SHOPPING LIST - ADD
      // =====================================================================
      case CONSTANTS.NLP.INTENTS.SHOPPING_LIST_ADD:
        if (entities.item) {
          console.log(`🌐 API: Adding "${entities.item}" to shopping list...`);
          try {
            const apiResult = await vogoApi.addShoppingItem(entities.item, 1);
            actionResult = { success: apiResult.success, message: apiResult.message, item: apiResult.item };
            console.log(`${apiResult.success ? '✅' : '❌'} ${apiResult.message}`);
          } catch (error) {
            console.error('❌ API Error:', error.message);
            actionResult = { success: false, message: `Failed to add item: ${error.message}` };
          }
        }
        break;

      // =====================================================================
      // SHOPPING LIST - SHOW
      // =====================================================================
      case CONSTANTS.NLP.INTENTS.SHOPPING_LIST_SHOW: {
        console.log(`🌐 API: Getting shopping list...`);
        try {
          const apiResult = await vogoApi.getShoppingList();
          actionResult = {
            success: apiResult.success,
            message: apiResult.message,
            items: (apiResult.items || []).map(item => ({
              id: item.id || item.item_id,
              name: item.product_name || item.name || item.title,
              quantity: item.quantity || 1,
              done: item.done_checked || item.is_done || false
            }))
          };
          console.log(`${apiResult.success ? '✅' : '❌'} ${apiResult.message}`);
        } catch (error) {
          console.error('❌ API Error:', error.message);
          actionResult = { success: false, message: `Failed to get shopping list: ${error.message}`, items: [] };
        }
        break;
      }

      // =====================================================================
      // AGENDA - ADD
      // =====================================================================
      case CONSTANTS.NLP.INTENTS.AGENDA_ADD: {
        if (entities.event) {
          const { event: cleanEvent, datetime: extractedDatetime } = extractEventAndDatetime(entities.event, entities.date);
          const eventDatetime = extractedDatetime || parseHumanDateToMysql(entities.date);
          const eventName = cleanEvent || entities.event;
          
          console.log(`🌐 API: Adding "${eventName}" to calendar...`);
          console.log(`   Date: ${entities.date} → ${eventDatetime}`);
          
          try {
            const apiResult = await vogoApi.addAgendaItem(eventName, eventDatetime);
            actionResult = { success: apiResult.success, message: apiResult.message, event: apiResult.event };
            console.log(`${apiResult.success ? '✅' : '❌'} ${apiResult.message}`);
          } catch (error) {
            console.error('❌ API Error:', error.message);
            actionResult = { success: false, message: `Failed to add event: ${error.message}` };
          }
        }
        break;
      }

      // =====================================================================
      // AGENDA - SHOW
      // =====================================================================
      case CONSTANTS.NLP.INTENTS.AGENDA_SHOW: {
        console.log(`🌐 API: Getting agenda...`);
        try {
          const apiResult = await vogoApi.getAgendaItems();
          let events = (apiResult.events || []).map(event => ({
            id: event.id || event.event_id,
            name: event.event_name || event.name || event.title,
            datetime: event.event_datetime || event.datetime,
            location: event.location,
            done: event.done_checked || event.is_done || false
          }));
          
          const term = (entities.searchTerm || '').trim().toLowerCase();
          if (term) {
            events = events.filter(e => String(e.name || '').toLowerCase().includes(term));
          }
          
          actionResult = {
            success: apiResult.success,
            message: term ? `Found ${events.length} event(s) for "${term}"` : `You have ${events.length} events in your calendar`,
            events: events
          };
          console.log(`${apiResult.success ? '✅' : '❌'} ${actionResult.message}`);
        } catch (error) {
          console.error('❌ API Error:', error.message);
          actionResult = { success: false, message: `Failed to get agenda: ${error.message}`, events: [] };
        }
        break;
      }

      // =====================================================================
      // PRODUCT SEARCH
      // =====================================================================
      case CONSTANTS.NLP.INTENTS.SEARCH_PRODUCT: {
        const searchTerm = (entities.searchTerm || '').trim();
        if (searchTerm) {
          console.log(`🌐 API: Searching for "${searchTerm}"...`);
          try {
            const apiResult = await vogoApi.searchProducts(searchTerm);
            actionResult = {
              success: apiResult.success,
              message: apiResult.message,
              results: (apiResult.products || []).map(p => ({
                type: p.type,
                title: p.title || p.product_title || p.name,
                link: p.link || p.product_link || p.url
              }))
            };
            console.log(`${apiResult.success ? '✅' : '❌'} ${apiResult.message}`);
          } catch (error) {
            console.error('❌ API Error:', error.message);
            actionResult = { success: false, message: `Search failed: ${error.message}`, results: [] };
          }
        }
        break;
      }
    }

    // Log conversation
    conversationLogs.push({
      timestamp: new Date().toISOString(),
      message: text,
      intent: result.intent,
      confidence: result.confidence,
      method: result.method,
      language: result.detectedLanguage || language
    });
    while (conversationLogs.length > 100) conversationLogs.shift();

    console.log(`✅ Response: ${result.response}`);
    console.log(`${'='.repeat(60)}\n`);

    res.json({
      success: true,
      result: {
        intent: result.intent,
        confidence: result.confidence,
        method: result.method,
        response: result.response,
        detectedLanguage: result.detectedLanguage || language
      },
      action: actionResult,
      entities: entities
    });

  } catch (error) {
    console.error('❌ NLP Error:', error);
    VARIABLES.recordError('nlp', error);
    res.json({ success: false, message: error.message });
  }
});

// ============================================================================
// PREDEFINED QA ENDPOINT
// ============================================================================
app.post('/api/chatbot', async (req, res) => {
  const { action, data } = req.body;

  try {
    if (action === 'getPredefinedQA') {
      const parentId = data?.parent_id ?? null;
      const lang = data?.lang || 'en';

      console.log(`🌐 API: Fetching predefined QA (parent_id: ${parentId})...`);
      
      try {
        const live = await vogoApi.fetchPredefinedQA(parentId, lang);
        const list = Array.isArray(live) ? live : Array.isArray(live?.data) ? live.data : [];
        const normalized = list.map(q => ({ ...q, text: q.text || q.question || String(q) }));
        
        console.log(`✅ Loaded ${normalized.length} predefined questions`);
        return res.json({ success: true, data: normalized, source: 'api' });
      } catch (e) {
        console.error("❌ Predefined QA failed:", e.message);
        return res.json({ success: false, message: e.message, data: [] });
      }
    }
    
    return res.json({ success: false, message: 'Unknown action' });
  } catch (error) {
    console.error('API Error:', error);
    res.json({ success: false, message: error.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================
async function startServer() {
  const initialized = await initializeServices();
  if (!initialized) {
    console.error('\n❌ Server startup failed');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log(`🌐 Server running: http://localhost:${PORT}`);
    console.log(`🧪 Test chatbot: http://localhost:${PORT}/test.html`);
    console.log(`📋 View logs: http://localhost:${PORT}/logs`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(70) + '\n');
    console.log('🌐 API-POWERED MODE:');
    console.log('   ✅ Shopping list → REST API');
    console.log('   ✅ Calendar/agenda → REST API');
    console.log('   ✅ Product search → REST API');
    console.log('   ✅ Predefined QA → REST API');
    console.log(`   🔗 API Base: ${process.env.VOGO_API_BASE || 'https://vogo.family/wp-json'}`);
    console.log('\n' + '='.repeat(70) + '\n');
  });
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

startServer();