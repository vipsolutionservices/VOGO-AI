// ============================================================================
// VOGO API SERVICE - Complete REST API Integration
// File: server/services/vogoApi.js
// Based on Postman Collection - All endpoints implemented
// ============================================================================

// API Configuration
// NOTE: Using production (vogo.family) because test07 login endpoint returns 404
const WP_JSON_BASE = process.env.VOGO_API_BASE || 'https://vogo.family/wp-json';
const USERNAME = process.env.VOGO_USERNAME || 'app_mobile_general@vogo.family';
const PASSWORD = process.env.VOGO_PASSWORD || 'Abc123$';

let cachedToken = null;
let tokenExpiresAt = 0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function vogoUrl(path) {
  const base = (WP_JSON_BASE || 'https://vogo.family/wp-json').replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}

// ============================================================================
// AUTHENTICATION
// Login: POST /vogo/v1/login_jwt/
// Body: { username, password }
// Response: { token, expires_in, user_email, user_roles }
// ============================================================================

async function loginJwt() {
  // Login URL from Abhishek's message: /vogo/v1/public/login_jwt/
  const loginUrl = vogoUrl("vogo/v1/public/login_jwt/");
  
  console.log('🔐 Logging in to API...');
  console.log(`   URL: ${loginUrl}`);

  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('❌ Login failed:', data);
    throw new Error(`JWT login failed ${res.status}: ${JSON.stringify(data)}`);
  }
  
  if (!data.token) {
    throw new Error(`JWT login missing token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.token;
  const expiresInSec = Number(data.expires_in || 3600);
  tokenExpiresAt = Date.now() + expiresInSec * 1000 - 60_000; // 60s buffer
  
  console.log('✅ API Login successful');
  console.log(`   User: ${data.user_email || USERNAME}`);
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  return loginJwt();
}

// Get authenticated headers for API calls
async function getAuthHeaders() {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ============================================================================
// GENERIC API CALL WRAPPER
// ============================================================================

async function apiCall(endpoint, method = 'POST', body = null) {
  const url = vogoUrl(`vogo/v1${endpoint}`);
  const headers = await getAuthHeaders();
  
  const options = {
    method,
    headers
  };
  
  // All endpoints use POST with JSON body (even if empty)
  if (method === 'POST') {
    options.body = body ? JSON.stringify(body) : '';
  }
  
  console.log(`🌐 API ${method}: ${endpoint}`);
  if (body) console.log(`   Body:`, JSON.stringify(body).substring(0, 100));
  
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }));
    
    if (!res.ok) {
      console.error(`❌ API Error ${res.status}:`, data);
      return { success: false, error: data.message || `HTTP ${res.status}`, status: res.status, data };
    }
    
    console.log(`✅ API Success`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ API Call Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// PREDEFINED Q&A
// POST /vogo/v1/predefined_qa
// Body: { parent_id: 1 }
// Response: { success: true, data: [...] }
// ============================================================================

async function fetchPredefinedQA(parentId = null, lang = "en") {
  const body = {
    parent_id: parentId === undefined ? null : parentId
  };
  
  // Note: lang might not be used by the API based on Postman, but we keep it for compatibility
  if (lang && lang !== 'en') {
    body.lang = lang;
  }
  
  const result = await apiCall('/predefined_qa', 'POST', body);
  
  if (result.success) {
    const data = result.data;
    // Normalize response - API returns { success: true, data: [...] }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.questions)) return data.questions;
    return data;
  }
  
  throw new Error(result.error || 'Failed to fetch predefined QA');
}

// ============================================================================
// SHOPPING LIST API
// ============================================================================

/**
 * Add item to shopping list
 * POST /vogo/v1/shopListAddItem
 * Body: { product_name, product_id, product_vendor, quantity, other_info, done_checked }
 */
async function addShoppingItem(productName, quantity = 1, productId = null, vendor = null, otherInfo = null) {
  const body = {
    product_name: productName,
    quantity: quantity,
    done_checked: 0
  };
  
  // Optional fields
  if (productId) body.product_id = productId;
  if (vendor) body.product_vendor = vendor;
  if (otherInfo) body.other_info = otherInfo;
  
  const result = await apiCall('/shopListAddItem', 'POST', body);
  
  return {
    success: result.success,
    item: result.data,
    message: result.success 
      ? `Added "${productName}" to your shopping list`
      : `Failed to add "${productName}": ${result.error}`
  };
}

/**
 * Get user's shopping list
 * POST /vogo/v1/shopListShowUserItems
 * Body: empty string (from Postman)
 */
async function getShoppingList() {
  const result = await apiCall('/shopListShowUserItems', 'POST', null);
  
  if (result.success) {
    // Normalize response
    let items = [];
    const data = result.data;
    
    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.data)) {
      items = data.data;
    } else if (Array.isArray(data?.items)) {
      items = data.items;
    }
    
    return {
      success: true,
      items: items,
      count: items.length,
      message: `You have ${items.length} items in your shopping list`
    };
  }
  
  return {
    success: false,
    items: [],
    error: result.error,
    message: `Failed to get shopping list: ${result.error}`
  };
}

/**
 * Delete item from shopping list
 * POST /vogo/v1/shopListDeleteItem
 * Body: { item_id }
 */
async function deleteShoppingItem(itemId) {
  const result = await apiCall('/shopListDeleteItem', 'POST', { item_id: itemId });
  
  return {
    success: result.success,
    message: result.success ? 'Item deleted from shopping list' : `Failed to delete: ${result.error}`
  };
}

/**
 * Mark shopping item as done
 * POST /vogo/v1/shopListMarkDone
 * Body: { item_id }
 */
async function markShoppingItemDone(itemId) {
  const result = await apiCall('/shopListMarkDone', 'POST', { item_id: itemId });
  
  return {
    success: result.success,
    message: result.success ? 'Item marked as done' : `Failed: ${result.error}`
  };
}

// ============================================================================
// AGENDA/CALENDAR API
// ============================================================================

/**
 * Add event to agenda/calendar
 * POST /vogo/v1/agendaAddItem
 * Body: { event_name, event_datetime, location, duration, participants_names, done_checked }
 */
async function addAgendaItem(eventName, eventDatetime = null, location = null, duration = null, participants = null) {
  const body = {
    event_name: eventName,
    done_checked: 0
  };
  
  // Optional fields
  if (eventDatetime) body.event_datetime = eventDatetime;
  if (location) body.location = location;
  if (duration) body.duration = duration;
  if (participants) body.participants_names = participants;
  
  const result = await apiCall('/agendaAddItem', 'POST', body);
  
  return {
    success: result.success,
    event: result.data,
    message: result.success 
      ? `Added "${eventName}" to your calendar${eventDatetime ? ` on ${eventDatetime}` : ''}`
      : `Failed to add "${eventName}": ${result.error}`
  };
}

/**
 * Get user's agenda/calendar items
 * POST /vogo/v1/agendaShowUserItems
 * Body: { dateFrom, dateTo }
 */
async function getAgendaItems(dateFrom = null, dateTo = null) {
  // If no dates provided, use a wide range (1 year before to 1 year after)
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAhead = new Date(now);
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
  
  const formatDate = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  
  const body = {
    dateFrom: dateFrom || formatDate(oneYearAgo),
    dateTo: dateTo || formatDate(oneYearAhead)
  };
  
  const result = await apiCall('/agendaShowUserItems', 'POST', body);
  
  if (result.success) {
    // Normalize response
    let events = [];
    const data = result.data;
    
    if (Array.isArray(data)) {
      events = data;
    } else if (Array.isArray(data?.data)) {
      events = data.data;
    } else if (Array.isArray(data?.events)) {
      events = data.events;
    } else if (Array.isArray(data?.items)) {
      events = data.items;
    }
    
    return {
      success: true,
      events: events,
      count: events.length,
      message: `You have ${events.length} events in your calendar`
    };
  }
  
  return {
    success: false,
    events: [],
    error: result.error,
    message: `Failed to get agenda: ${result.error}`
  };
}

/**
 * Delete event from agenda
 * POST /vogo/v1/agendaDeleteItem
 * Body: { id }
 */
async function deleteAgendaItem(eventId) {
  const result = await apiCall('/agendaDeleteItem', 'POST', { id: eventId });
  
  return {
    success: result.success,
    message: result.success ? 'Event deleted from calendar' : `Failed: ${result.error}`
  };
}

/**
 * Mark agenda item as done
 * POST /vogo/v1/agendaMarkDone
 * Body: { id }
 */
async function markAgendaItemDone(eventId) {
  const result = await apiCall('/agendaMarkDone', 'POST', { id: eventId });
  
  return {
    success: result.success,
    message: result.success ? 'Event marked as done' : `Failed: ${result.error}`
  };
}

// ============================================================================
// PRODUCT SEARCH API
// POST /vogo/v1/search_by_keyword
// Body: { searchText, location }
// Response: { success: true, searchText: "pizza", results: [...] }
// ============================================================================

async function searchProducts(searchText, location = 'Brașov') {
  const body = {
    searchText: searchText,
    location: location
  };
  
  const result = await apiCall('/search_by_keyword', 'POST', body);
  
  if (result.success) {
    // Response format: { success: true, searchText: "pizza", results: [...] }
    const data = result.data;
    let products = [];
    
    if (Array.isArray(data?.results)) {
      products = data.results;
    } else if (Array.isArray(data)) {
      products = data;
    } else if (Array.isArray(data?.products)) {
      products = data.products;
    }
    
    return {
      success: true,
      products: products,
      count: products.length,
      searchText: data?.searchText || searchText,
      message: products.length > 0 
        ? `Found ${products.length} result(s) for "${searchText}"`
        : `No results found for "${searchText}"`
    };
  }
  
  return {
    success: false,
    products: [],
    error: result.error,
    message: `Search failed: ${result.error}`
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Authentication
  getToken,
  loginJwt,
  
  // Predefined QA
  fetchPredefinedQA,
  
  // Shopping List
  addShoppingItem,
  getShoppingList,
  deleteShoppingItem,
  markShoppingItemDone,
  
  // Agenda/Calendar
  addAgendaItem,
  getAgendaItems,
  deleteAgendaItem,
  markAgendaItemDone,
  
  // Product Search
  searchProducts
};