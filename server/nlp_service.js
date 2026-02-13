// server/nlp_service.js - PROPER AI CHATBOT - Memory + Context + Better NLP
// Enhanced with comprehensive multilingual detection

const { NlpManager } = require('node-nlp');
const nlp = require('compromise');
const fs = require('fs');
const path = require('path');

class NLPService {
  constructor() {
    this.manager = new NlpManager({ 
      languages: ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl', 'ru'],
      forceNER: true
    });
    this.rules = [];
    this.initialized = false;
    this.conversationLogs = [];
    
    // Conversation memory and context
    this.conversationHistory = [];
    this.currentLanguage = 'en'; // Default to English
    this.userPreferences = {
      preferredLanguage: 'en',
      lastIntent: null,
      lastEntity: null
    };

    // =========================================================================
    // COMPREHENSIVE LANGUAGE DETECTION DICTIONARIES
    // =========================================================================
    
    // Romanian phrases and words
    this.romanianPhrases = [
      // Greetings
      'salut', 'buna', 'bună', 'buna ziua', 'bună ziua', 'buna seara', 'bună seara',
      'buna dimineata', 'bună dimineața', 'neata', 'servus', 'salutare', 'ce faci',
      'ce mai faci', 'noroc', 'pa', 'la revedere', 'pe curand', 'pe curând',
      // Thanks
      'multumesc', 'mulțumesc', 'mersi', 'merci', 'multumiri', 'mulțumiri', 'ms',
      'multumesc mult', 'mulțumesc mult', 'multumesc frumos', 'mulțumesc frumos',
      // Please/Requests
      'te rog', 'va rog', 'vă rog', 'daca poti', 'dacă poți', 'ai putea',
      // Common verbs
      'vreau', 'doresc', 'am nevoie', 'trebuie', 'pot', 'poti', 'poți',
      'adauga', 'adaugă', 'sterge', 'șterge', 'arata', 'arată', 'vezi',
      'cauta', 'caută', 'gaseste', 'găsește', 'pune', 'ia', 'cumpara', 'cumpără',
      // Shopping related
      'lista de cumparaturi', 'listă de cumpărături', 'cos de cumparaturi', 
      'coș de cumpărături', 'cumparaturi', 'cumpărături', 'magazin', 'piata', 'piață',
      // Calendar related
      'calendar', 'agenda', 'programare', 'intalnire', 'întâlnire', 'eveniment',
      'aminteste', 'amintește', 'programeaza', 'programează', 'sedinta', 'ședință',
      // Question words
      'ce', 'cine', 'unde', 'cand', 'când', 'cum', 'cat', 'cât', 'de ce', 'care',
      // Common words
      'si', 'și', 'sau', 'dar', 'pentru', 'de la', 'la', 'cu', 'fara', 'fără',
      'acum', 'azi', 'astazi', 'astăzi', 'maine', 'mâine', 'ieri', 'saptamana', 'săptămâna',
      'luna', 'an', 'ora', 'minut', 'secunda', 'secundă',
      // Food items (commonly searched)
      'lapte', 'paine', 'pâine', 'oua', 'ouă', 'branza', 'brânză', 'carne',
      'legume', 'fructe', 'apa', 'apă', 'suc', 'cafea', 'ceai'
    ];
this.neutralSharedWords = [
  'pizza', 'pasta', 'coffee', 'tea', 'milk', 'bread', 'water', 'burger'
];

    // Italian phrases and words
    this.italianPhrases = [
      // Greetings
      'ciao', 'salve', 'buongiorno', 'buonasera', 'buonanotte', 'arrivederci',
      'a presto', 'addio', 'come stai', 'come sta', 'come va', 'tutto bene',
      // Thanks
      'grazie', 'grazie mille', 'grazie tante', 'ti ringrazio', 'la ringrazio',
      'molte grazie', 'grazie infinite',
      // Please/Requests
      'per favore', 'per piacere', 'prego', 'scusa', 'scusi', 'mi scusi',
      'potresti', 'potrebbe', 'puoi', 'può',
      // Common verbs
      'voglio', 'vorrei', 'desidero', 'ho bisogno', 'devo', 'posso',
      'aggiungi', 'aggiungere', 'rimuovi', 'rimuovere', 'mostra', 'mostrare',
      'cerca', 'cercare', 'trova', 'trovare', 'metti', 'mettere',
      // Shopping related
      'lista della spesa', 'carrello', 'spesa', 'comprare', 'acquistare',
      'negozio', 'supermercato', 'mercato',
      // Calendar related
      'calendario', 'agenda', 'appuntamento', 'riunione', 'evento',
      'ricordami', 'ricorda', 'promemoria', 'programma', 'programmato',
      // Question words
      'che', 'cosa', 'chi', 'dove', 'quando', 'come', 'quanto', 'perché', 'quale',
      // Common words
      'e', 'o', 'ma', 'per', 'da', 'a', 'con', 'senza', 'in', 'su',
      'oggi', 'domani', 'ieri', 'settimana', 'mese', 'anno', 'ora', 'minuto',
      // Food items
      'latte', 'pane', 'uova', 'formaggio', 'carne', 'verdure', 'frutta',
      'acqua', 'succo', 'caffè', 'tè', 'vino', 'birra', 'pasta', 'pizza'
    ];

    // French phrases and words
    this.frenchPhrases = [
      // Greetings
      'bonjour', 'bonsoir', 'bonne nuit', 'salut', 'coucou', 'au revoir',
      'à bientôt', 'a bientot', 'adieu', 'comment allez-vous', 'comment vas-tu',
      'ça va', 'ca va', 'comment ça va',
      // Thanks
      'merci', 'merci beaucoup', 'merci bien', 'je vous remercie', 'je te remercie',
      'mille mercis', 'un grand merci',
      // Please/Requests
      's\'il vous plaît', 's\'il te plaît', 'sil vous plait', 'sil te plait',
      'svp', 'excusez-moi', 'excuse-moi', 'pardon',
      'pourriez-vous', 'pourrais-tu', 'pouvez-vous', 'peux-tu',
      // Common verbs
      'je veux', 'je voudrais', 'je désire', 'j\'ai besoin', 'je dois', 'je peux',
      'ajouter', 'ajoute', 'supprimer', 'supprime', 'montrer', 'montre',
      'chercher', 'cherche', 'trouver', 'trouve', 'mettre', 'mets',
      // Shopping related
      'liste de courses', 'liste d\'achats', 'panier', 'courses', 'acheter',
      'magasin', 'supermarché', 'marché', 'épicerie',
      // Calendar related
      'calendrier', 'agenda', 'rendez-vous', 'réunion', 'événement',
      'rappelle-moi', 'rappel', 'rappeler', 'programme', 'programmé',
      // Question words
      'que', 'quoi', 'qui', 'où', 'ou', 'quand', 'comment', 'combien', 'pourquoi', 'quel',
      // Common words
      'et', 'ou', 'mais', 'pour', 'de', 'à', 'avec', 'sans', 'dans', 'sur',
      'aujourd\'hui', 'demain', 'hier', 'semaine', 'mois', 'année', 'an', 'heure', 'minute',
      // Food items
      'lait', 'pain', 'oeufs', 'œufs', 'fromage', 'viande', 'légumes', 'fruits',
      'eau', 'jus', 'café', 'thé', 'vin', 'bière'
    ];

    // German phrases and words
    this.germanPhrases = [
      // Greetings
      'hallo', 'guten tag', 'guten morgen', 'guten abend', 'gute nacht',
      'auf wiedersehen', 'tschüss', 'tschuss', 'bis bald', 'servus', 'moin',
      'wie geht es ihnen', 'wie geht\'s', 'wie gehts', 'alles gut',
      // Thanks
      'danke', 'danke schön', 'danke schon', 'dankeschön', 'vielen dank',
      'herzlichen dank', 'besten dank', 'ich danke ihnen', 'ich danke dir',
      // Please/Requests
      'bitte', 'bitte schön', 'bitte schon', 'entschuldigung', 'entschuldigen sie',
      'könnten sie', 'könntest du', 'können sie', 'kannst du',
      // Common verbs
      'ich will', 'ich möchte', 'ich brauche', 'ich muss', 'ich kann',
      'hinzufügen', 'hinzufugen', 'entfernen', 'löschen', 'loschen', 'zeigen',
      'suchen', 'finden', 'setzen', 'stellen', 'legen',
      // Shopping related
      'einkaufsliste', 'warenkorb', 'einkaufen', 'kaufen', 'einkauf',
      'geschäft', 'geschaft', 'supermarkt', 'markt', 'laden',
      // Calendar related
      'kalender', 'terminkalender', 'termin', 'besprechung', 'ereignis',
      'erinnere mich', 'erinnerung', 'erinnern', 'planen', 'geplant',
      // Question words
      'was', 'wer', 'wo', 'wann', 'wie', 'wieviel', 'warum', 'welche', 'welcher',
      // Common words
      'und', 'oder', 'aber', 'für', 'fur', 'von', 'zu', 'mit', 'ohne', 'in', 'auf',
      'heute', 'morgen', 'gestern', 'woche', 'monat', 'jahr', 'stunde', 'minute',
      // Food items
      'milch', 'brot', 'eier', 'käse', 'kase', 'fleisch', 'gemüse', 'gemuse', 'obst',
      'wasser', 'saft', 'kaffee', 'tee', 'wein', 'bier'
    ];

    // Spanish phrases and words
    this.spanishPhrases = [
      // Greetings
      'hola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches',
      'adiós', 'adios', 'hasta luego', 'hasta pronto', 'cómo estás', 'como estas',
      'qué tal', 'que tal',
      // Thanks
      'gracias', 'muchas gracias', 'muchísimas gracias', 'te agradezco', 'le agradezco',
      // Please/Requests
      'por favor', 'perdón', 'perdon', 'disculpe', 'disculpa',
      'podrías', 'podrias', 'podría', 'podria', 'puedes', 'puede',
      // Common verbs
      'quiero', 'quisiera', 'necesito', 'tengo que', 'puedo',
      'añadir', 'anadir', 'agregar', 'eliminar', 'borrar', 'mostrar',
      'buscar', 'encontrar', 'poner',
      // Shopping related
      'lista de compras', 'carrito', 'compras', 'comprar',
      'tienda', 'supermercado', 'mercado',
      // Calendar related
      'calendario', 'agenda', 'cita', 'reunión', 'reunion', 'evento',
      'recuérdame', 'recuerdame', 'recordatorio', 'recordar', 'programar',
      // Question words
      'qué', 'que', 'quién', 'quien', 'dónde', 'donde', 'cuándo', 'cuando',
      'cómo', 'como', 'cuánto', 'cuanto', 'por qué', 'cuál', 'cual',
      // Common words
      'y', 'o', 'pero', 'para', 'de', 'a', 'con', 'sin', 'en', 'sobre',
      'hoy', 'mañana', 'manana', 'ayer', 'semana', 'mes', 'año', 'ano', 'hora', 'minuto',
      // Food items
      'leche', 'pan', 'huevos', 'queso', 'carne', 'verduras', 'frutas',
      'agua', 'jugo', 'zumo', 'café', 'cafe', 'té', 'te', 'vino', 'cerveza'
    ];

    // Portuguese phrases and words
    this.portuguesePhrases = [
      // Greetings
      'olá', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite',
      'adeus', 'tchau', 'até logo', 'ate logo', 'como vai', 'tudo bem',
      // Thanks
      'obrigado', 'obrigada', 'muito obrigado', 'muito obrigada', 'agradeço', 'agradeco',
      // Please/Requests
      'por favor', 'desculpe', 'desculpa', 'com licença', 'com licenca',
      'poderia', 'pode', 'podes',
      // Common verbs
      'quero', 'gostaria', 'preciso', 'tenho que', 'posso',
      'adicionar', 'remover', 'apagar', 'mostrar',
      'procurar', 'buscar', 'encontrar', 'colocar',
      // Shopping related
      'lista de compras', 'carrinho', 'compras', 'comprar',
      'loja', 'supermercado', 'mercado',
      // Calendar related
      'calendário', 'calendario', 'agenda', 'compromisso', 'reunião', 'reuniao', 'evento',
      'lembre-me', 'lembrete', 'lembrar', 'agendar',
      // Question words
      'o que', 'quem', 'onde', 'quando', 'como', 'quanto', 'por que', 'qual',
      // Common words
      'e', 'ou', 'mas', 'para', 'de', 'a', 'com', 'sem', 'em', 'sobre',
      'hoje', 'amanhã', 'amanha', 'ontem', 'semana', 'mês', 'mes', 'ano', 'hora', 'minuto'
    ];

    // Dutch phrases and words
    this.dutchPhrases = [
      // Greetings
      'hallo', 'hoi', 'goedemorgen', 'goedemiddag', 'goedenavond', 'goedenacht',
      'dag', 'doei', 'tot ziens', 'hoe gaat het',
      // Thanks
      'dank je', 'dank u', 'bedankt', 'heel erg bedankt', 'hartelijk dank',
      // Please/Requests
      'alstublieft', 'alsjeblieft', 'sorry', 'pardon', 'excuseer',
      'zou je', 'zou u', 'kun je', 'kunt u',
      // Common verbs
      'ik wil', 'ik zou graag', 'ik heb nodig', 'ik moet', 'ik kan',
      'toevoegen', 'verwijderen', 'tonen', 'laten zien',
      'zoeken', 'vinden', 'zetten',
      // Shopping related
      'boodschappenlijst', 'winkelwagen', 'boodschappen', 'kopen',
      'winkel', 'supermarkt', 'markt',
      // Calendar related
      'kalender', 'agenda', 'afspraak', 'vergadering', 'evenement',
      'herinner me', 'herinnering', 'plannen',
      // Common words
      'en', 'of', 'maar', 'voor', 'van', 'naar', 'met', 'zonder', 'in', 'op',
      'vandaag', 'morgen', 'gisteren', 'week', 'maand', 'jaar', 'uur', 'minuut'
    ];

    // Polish phrases and words
    this.polishPhrases = [
      // Greetings
      'cześć', 'czesc', 'witaj', 'dzień dobry', 'dzien dobry', 'dobry wieczór',
      'dobry wieczor', 'dobranoc', 'do widzenia', 'pa', 'jak się masz',
      // Thanks
      'dziękuję', 'dziekuje', 'dzięki', 'dzieki', 'bardzo dziękuję',
      // Please/Requests
      'proszę', 'prosze', 'przepraszam', 'wybacz',
      'czy mógłbyś', 'czy mogłbyś', 'czy możesz',
      // Common verbs
      'chcę', 'chce', 'chciałbym', 'potrzebuję', 'potrzebuje', 'muszę', 'musze', 'mogę', 'moge',
      'dodaj', 'usuń', 'usun', 'pokaż', 'pokaz',
      'szukaj', 'znajdź', 'znajdz',
      // Shopping related
      'lista zakupów', 'lista zakupow', 'koszyk', 'zakupy', 'kupić', 'kupic',
      'sklep', 'supermarket',
      // Calendar related
      'kalendarz', 'terminarz', 'spotkanie', 'wydarzenie',
      'przypomnij mi', 'przypomnienie',
      // Common words
      'i', 'lub', 'ale', 'dla', 'od', 'do', 'z', 'bez', 'w', 'na',
      'dzisiaj', 'jutro', 'wczoraj', 'tydzień', 'tydzien', 'miesiąc', 'miesiac', 'rok', 'godzina', 'minuta'
    ];

    // Russian phrases (transliterated)
    this.russianPhrases = [
      // Greetings (transliterated)
      'privet', 'zdravstvuyte', 'dobroe utro', 'dobryy den', 'dobryy vecher',
      'spokoynoy nochi', 'poka', 'do svidaniya', 'kak dela',
      // Thanks
      'spasibo', 'bolshoe spasibo', 'blagodaryu',
      // Please
      'pozhaluysta', 'izvinite', 'prostite',
      // Common words
      'da', 'net', 'khorosho', 'ya khochu', 'mne nuzhno',
      'dobavit', 'udalit', 'pokazat', 'iskat', 'nayti'
    ];

    // English common words (for positive detection)
    this.englishWords = [
      // Articles and pronouns
      'the', 'a', 'an', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them',
      // Common verbs
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'can', 'may', 'might', 'must', 'shall',
      'add', 'show', 'view', 'open', 'close', 'find', 'search', 'get', 'put',
      'want', 'need', 'like', 'make', 'take', 'give', 'know', 'think', 'see', 'look',
      // Prepositions
      'to', 'for', 'with', 'from', 'at', 'in', 'on', 'of', 'by', 'about',
      // Conjunctions
      'and', 'or', 'but', 'if', 'because', 'so', 'that', 'when', 'while',
      // Question words
      'what', 'where', 'when', 'why', 'how', 'who', 'which',
      // Common nouns
      'list', 'shopping', 'cart', 'calendar', 'agenda', 'schedule', 'event',
      'reminder', 'item', 'product', 'thing',
      // Common adjectives/adverbs
      'please', 'thanks', 'thank', 'hello', 'hi', 'hey', 'yes', 'no', 'okay', 'ok',
      'good', 'great', 'nice', 'new', 'also', 'just', 'now', 'today', 'tomorrow',
      // Greetings
      'morning', 'afternoon', 'evening', 'night', 'bye', 'goodbye'
    ];
  }

  // =========================================================================
  // HELPERS (ADDED - does NOT remove anything, only fixes detection/routing)
  // =========================================================================
  escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Whole-word/whole-phrase match to avoid false positives like "e" matching everything
  hasPhrase(textLower, phrase) {
  const p = String(phrase).trim().toLowerCase();
  if (!p) return false;

  // Ignore ultra-short phrases (1-2 chars)
  if (p.length < 3) return false;

  // ✅ NEW: ignore “neutral” shared words so they don't bias language
  if (this.neutralSharedWords && this.neutralSharedWords.includes(p)) return false;

  const re = new RegExp(`\\b${this.escapeRegex(p)}\\b`, 'i');
  return re.test(textLower);
}

  // Strong English signal
  isStrongEnglish(textLower) {
    return /\b(add|append|put|insert|include|save|show|view|see|display|please|thank|thanks|shopping|list|calendar|remind|search|find)\b/i.test(textLower);
  }

  // Force ADD > SHOW when both appear, so "add milk to shopping list" never shows the list
  enforceIntentPriority(text) {
    const t = String(text).toLowerCase();

    const hasAdd = /\b(add|append|put|insert|include|save)\b/.test(t);
    const hasShow = /\b(show|view|see|display)\b/.test(t);
    const hasShoppingList = /\b(shopping\s+list|grocery\s+list|shopping|list|cart)\b/.test(t);

    // 🔥 If user is adding, ALWAYS add (do not show)
    if (hasAdd && hasShoppingList) return 'shopping_list_add';

    // If user is asking to view (and not adding), show
    if (hasShow && hasShoppingList && !hasAdd) return 'shopping_list_show';

    return null; // no override
  }

  // ✅ NEW (1): normalize input text before detection + intent matching
  normalizeText(text) {
    return String(text || '')
      .replace(/[\u201C\u201D]/g, '"')           // smart quotes -> "
      .replace(/^[\s"'`]+|[\s"'`]+$/g, '')       // trim spaces and surrounding quotes
      .trim();
  }

  // ✅ NEW (1): Strong sanitize for search terms (fixes: pizza.  pizza ?  "pizza ?"
  sanitizeSearchTerm(term) {
    if (!term) return '';
    return String(term)
      .replace(/[\u201C\u201D]/g, '"')           // smart quotes -> "
      .replace(/["'`]/g, '')                     // remove quotes anywhere
      .replace(/\bfound\b/gi, '')                // remove the word "found"
      .replace(/[.,!?;:(){}\[\]<>\\/|+=@#$%^&*_~]/g, ' ') // remove punctuation (safe)
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🤖 Initializing PROPER AI Chatbot...');

    try {
      const dbPath = path.join(__dirname, 'nlp-database.json');
      
      if (!fs.existsSync(dbPath)) {
        throw new Error(`NLP database not found at ${dbPath}`);
      }

      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      this.rules = dbData.rules;
      console.log(`✅ Loaded ${this.rules.length} NLP rules`);

      const trainingData = dbData.training_data;

      for (const [language, intents] of Object.entries(trainingData)) {
        for (const [intent, examples] of Object.entries(intents)) {
          for (const example of examples) {
            this.manager.addDocument(language, example, intent);
          }
        }
      }

      this.addAnswers();
      await this.manager.train();
      console.log('✅ AI Chatbot trained successfully');

      this.initialized = true;
    } catch (error) {
      console.error('❌ AI Chatbot initialization failed:', error.message);
      throw error;
    }
  }

  addAnswers() {
    const languages = ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl'];
    const intents = ['greeting', 'thanks', 'shopping_list_add', 'shopping_list_show', 
                     'agenda_add', 'agenda_show', 'search_product'];

    languages.forEach(lang => {
      intents.forEach(intent => {
        const rule = this.rules.find(r => r.language === lang && r.intent === intent);
        if (rule && rule.response) {
          this.manager.addAnswer(lang, intent, rule.response);
        }
      });
    });
  }

  // =========================================================================
  // ENHANCED MULTILINGUAL LANGUAGE DETECTION
  // =========================================================================
  async detectLanguage(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const lowerText = text.toLowerCase().trim();
      const words = lowerText.split(/\s+/);

      // ✅ SHORT MESSAGE OVERRIDE (prevents random language from preference)
      // Example: "hi", "ok", "yes", "no" should not trigger PL/RO/etc.
      const compact = lowerText.replace(/[^a-z0-9]+/g, '');
      if (compact.length <= 3) {
        const map = {
          hi: 'en',
          hey: 'en',
          ok: 'en',
          yes: 'en',
          no: 'en',
          thx: 'en',
          pls: 'en'
        };
        if (map[compact]) {
          console.log(`🌐 Short input override: ${compact} -> ${map[compact]}`);
          return map[compact];
        }
      }

      // Score for each language
      const scores = {
        en: 0,
        ro: 0,
        it: 0,
        fr: 0,
        de: 0,
        es: 0,
        pt: 0,
        nl: 0,
        pl: 0,
        ru: 0
      };

      // =====================================================================
      // STEP 1: Check for exact phrase matches (highest confidence)
      // FIXED: uses whole-word matching and ignores 1-2 letter phrases
      // =====================================================================
      
      // Romanian
      for (const phrase of this.romanianPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.ro += phrase.split(' ').length * 3; // Weight by phrase length
        }
      }

      // Italian
      for (const phrase of this.italianPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.it += phrase.split(' ').length * 3;
        }
      }

      // French
      for (const phrase of this.frenchPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.fr += phrase.split(' ').length * 3;
        }
      }

      // German
      for (const phrase of this.germanPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.de += phrase.split(' ').length * 3;
        }
      }

      // Spanish
      for (const phrase of this.spanishPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.es += phrase.split(' ').length * 3;
        }
      }

      // Portuguese
      for (const phrase of this.portuguesePhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.pt += phrase.split(' ').length * 3;
        }
      }

      // Dutch
      for (const phrase of this.dutchPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.nl += phrase.split(' ').length * 3;
        }
      }

      // Polish
      for (const phrase of this.polishPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.pl += phrase.split(' ').length * 3;
        }
      }

      // Russian (transliterated)
      for (const phrase of this.russianPhrases) {
        if (this.hasPhrase(lowerText, phrase)) {
          scores.ru += phrase.split(' ').length * 3;
        }
      }

      // English words (lighter weight, but frequent)
      for (const word of words) {
        if (this.englishWords.includes(word)) {
          scores.en += 1;
        }
      }

      // ✅ Strong English signal bonus (prevents EN text from flipping to IT/FR/etc.)
      if (this.isStrongEnglish(lowerText)) {
        scores.en += 5;
      }

      // =====================================================================
      // STEP 2: Check for character patterns unique to languages
      // =====================================================================
      
      // Romanian diacritics
      if (/[ăâîșțĂÂÎȘȚ]/.test(text)) {
        scores.ro += 5;
      }
      
      // French accents
      if (/[éèêëàâùûüôîïç]/.test(text)) {
        scores.fr += 3;
      }
      
      // German umlauts and ß
      if (/[äöüßÄÖÜ]/.test(text)) {
        scores.de += 5;
      }
      
      // Spanish ñ and ¿¡
      if (/[ñÑ¿¡]/.test(text)) {
        scores.es += 5;
      }
      
      // Portuguese specific
      if (/[ãõÃÕ]/.test(text)) {
        scores.pt += 5;
      }
      
      // Polish specific
      if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) {
        scores.pl += 5;
      }

      // =====================================================================
      // STEP 3: Determine winner
      // =====================================================================
      
      // Find the language with highest score
      let maxScore = 0;
      let detectedLang = 'en'; // Default to English
      
      for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
          maxScore = score;
          detectedLang = lang;
        }
      }

      // If English looks strong, force English
      if (this.isStrongEnglish(lowerText) && scores.en >= 3) {
        detectedLang = 'en';
        maxScore = scores.en;
      }

      // If English has equal or higher score than others, prefer English
      if (scores.en >= maxScore && scores.en > 0) {
        detectedLang = 'en';
      }

      // If no clear detection, use stored preference or default to English
      if (maxScore === 0) {
        detectedLang = 'en';
        console.log(`🌐 No language detected, defaulting to: ${detectedLang}`);
      } else {
        console.log(`🌐 Language detected: ${detectedLang} (score: ${maxScore})`);
        this.currentLanguage = detectedLang;

        // ✅ Only store preference when detection is confident enough
        if (maxScore >= 3) {
          this.userPreferences.preferredLanguage = detectedLang;
        }
      }

      return detectedLang;
      
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Always default to English on error
    }
  }

  // Check Regex patterns
  checkRegex(text, language) {
    const activeRules = this.rules
      .filter(r => r.active && r.language === language && r.regex)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      try {
        const regex = new RegExp(rule.regex, 'i');
        if (regex.test(text)) {
          console.log(`✅ REGEX match: ${rule.intent}`);
          this.logConversation('REGEX', text, rule.intent, 1.0, language);
          return {
            matched: true,
            intent: rule.intent,
            confidence: 1.0,
            method: 'regex',
            response: rule.response,
            rule_id: rule.id
          };
        }
      } catch (error) {
        console.error(`Invalid regex in rule ${rule.id}:`, error);
      }
    }

    return { matched: false };
  }

  // Check Keywords
  checkKeywords(text, language) {
    const activeRules = this.rules
      .filter(r => r.active && r.language === language && r.keywords)
      .sort((a, b) => b.priority - a.priority);

    const lowerText = text.toLowerCase();

    for (const rule of activeRules) {
      const keywords = Array.isArray(rule.keywords) 
        ? rule.keywords 
        : rule.keywords.split(',').map(k => k.trim());

      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          console.log(`✅ KEYWORD match: ${rule.intent} (${keyword})`);
          this.logConversation('KEYWORD', text, rule.intent, 0.85, language);
          return {
            matched: true,
            intent: rule.intent,
            confidence: 0.85,
            method: 'keyword',
            response: rule.response,
            matched_keyword: keyword,
            rule_id: rule.id
          };
        }
      }
    }

    return { matched: false };
  }

  // NLP Intent Detection
  async detectIntent(text, language = 'en') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await this.manager.process(language, text);

      if (result.intent && result.intent !== 'None' && result.score > 0.5) {
        console.log(`✅ NLP match: ${result.intent} (confidence: ${result.score.toFixed(2)})`);
        this.logConversation('NLP', text, result.intent, result.score, language);
        
        // Store last intent for context
        this.userPreferences.lastIntent = result.intent;
        
        return {
          matched: true,
          intent: result.intent,
          confidence: result.score,
          method: 'nlp',
          response: result.answer || null,
          entities: result.entities || []
        };
      }
    } catch (error) {
      console.error('NLP detection error:', error);
    }

    return { matched: false };
  }

  // Fallback response with multi-language support
  getFallbackResponse(language) {
    const fallbacks = {
      en: "I'm sorry, I didn't understand that. You can:\n• Add items to your shopping list\n• View your shopping list\n• Search for products\n• Add events to your calendar\n• View your calendar",
      ro: "Îmi pare rău, nu am înțeles. Poți:\n• Adăuga produse în lista de cumpărături\n• Vedea lista de cumpărături\n• Căuta produse\n• Adăuga evenimente în calendar\n• Vedea calendarul",
      it: "Mi dispiace, non ho capito. Puoi:\n• Aggiungere articoli alla lista della spesa\n• Vedere la lista della spesa\n• Cercare prodotti\n• Aggiungere eventi al calendario\n• Vedere il calendario",
      fr: "Je suis désolé, je n'ai pas compris. Vous pouvez:\n• Ajouter des articles à votre liste de courses\n• Voir votre liste de courses\n• Rechercher des produits\n• Ajouter des événements au calendrier\n• Voir votre calendrier",
      de: "Es tut mir leid, das habe ich nicht verstanden. Sie können:\n• Artikel zur Einkaufsliste hinzufügen\n• Ihre Einkaufsliste ansehen\n• Produkte suchen\n• Termine zum Kalender hinzufügen\n• Ihren Kalender ansehen",
      es: "Lo siento, no entendí. Puedes:\n• Añadir artículos a tu lista de compras\n• Ver tu lista de compras\n• Buscar productos\n• Añadir eventos al calendario\n• Ver tu calendario",
      pt: "Desculpe, não entendi. Você pode:\n• Adicionar itens à lista de compras\n• Ver sua lista de compras\n• Buscar produtos\n• Adicionar eventos ao calendário\n• Ver seu calendário",
      nl: "Sorry, ik begreep dat niet. Je kunt:\n• Items toevoegen aan je boodschappenlijst\n• Je boodschappenlijst bekijken\n• Producten zoeken\n• Evenementen aan de kalender toevoegen\n• Je kalender bekijken",
      pl: "Przepraszam, nie zrozumiałem. Możesz:\n• Dodać produkty do listy zakupów\n• Zobacz listę zakupów\n• Szukać produktów\n• Dodać wydarzenia do kalendarza\n• Zobacz kalendarz"
    };
    
    const fallback = fallbacks[language] || fallbacks.en;
    
    return {
      matched: false,
      intent: 'fallback',
      confidence: 0,
      method: 'fallback',
      response: fallback
    };
  }

  // Main routing function with memory
  async processMessage(text, language = 'en') {
    text = this.normalizeText(text); // ✅ NEW
    console.log(`\n🔍 Processing: "${text}" [${language}]`);

    // Add to conversation history
    this.conversationHistory.push({
      timestamp: new Date().toISOString(),
      userMessage: text,
      inputLanguage: language
    });

    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }

    // ✅ Respect UI language if valid; only auto-detect if language is missing/invalid/"auto"
    const supported = ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl', 'ru'];
    let detectedLang = (language && supported.includes(language)) ? language : 'auto';

    if (detectedLang === 'auto') {
      detectedLang = await this.detectLanguage(text);
    }

    console.log(`🌐 Final language: ${detectedLang}`);

    // STEP 2: Regex
    const regexResult = this.checkRegex(text, detectedLang);
    if (regexResult.matched) {
      // ✅ Intent override (ADD beats SHOW)
      const forced = this.enforceIntentPriority(text);
      if (forced) regexResult.intent = forced;
      return { ...regexResult, detectedLanguage: detectedLang };
    }

    // STEP 3: Keywords
    const keywordResult = this.checkKeywords(text, detectedLang);
    if (keywordResult.matched) {
      // ✅ Intent override (ADD beats SHOW)
      const forced = this.enforceIntentPriority(text);
      if (forced) keywordResult.intent = forced;
      return { ...keywordResult, detectedLanguage: detectedLang };
    }

    // STEP 4: NLP
    const nlpResult = await this.detectIntent(text, detectedLang);
    if (nlpResult.matched) {
      // ✅ Intent override (ADD beats SHOW)
      const forced = this.enforceIntentPriority(text);
      if (forced) nlpResult.intent = forced;
      return { ...nlpResult, detectedLanguage: detectedLang };
    }

    // STEP 5: Fallback
    console.log('❌ No match - using fallback');
    this.logConversation('FALLBACK', text, 'fallback', 0, detectedLang);
    return { ...this.getFallbackResponse(detectedLang), detectedLanguage: detectedLang };
  }

  // IMPROVED: Better entity extraction with extensive debugging
  extractEntities(text, intent) {
    console.log(`\n🔧 EXTRACTING ENTITIES`);
    console.log(`   Text: "${text}"`);
    console.log(`   Intent: "${intent}"`);
    
    const entities = {};

    try {
      const doc = nlp(text);

      switch (intent) {
        case 'shopping_list_add':
          let item = null;
          let itemMatch = null;
          
          // Clean text - remove common filler words
          const cleanText = text
            .toLowerCase()
            .replace(/\.$/, '') // Remove trailing period
            .replace(/\b(also|just|please|can you|could you|would you|now)\b/gi, '')
            .trim();
          
          console.log(`   🔧 Cleaned: "${cleanText}"`);
          
          // Pattern 1: "add to my shopping list to buy X" or "add to list to buy X"
          itemMatch = cleanText.match(/(?:add|append|put|insert|include|save)\s+(?:to|in)\s+(?:my\s+)?(?:shopping\s+)?(?:list|cart)\s+(?:to\s+)?(?:buy\s+)?(.+)/i);
          if (itemMatch && itemMatch[1]) {
            item = itemMatch[1].trim();
            console.log(`   📦 Pattern 1 (add to list to buy X): "${item}"`);
          }
          
          // Pattern 2: "add X to my shopping list" (item before "to list")
          if (!item) {
            itemMatch = cleanText.match(/(?:add|append|put|insert|include|save)\s+(.+?)\s+(?:to|in)\s+(?:my\s+)?(?:shopping\s+)?(?:list|cart)/i);
            if (itemMatch && itemMatch[1]) {
              item = itemMatch[1].trim();
              // Make sure we didn't just capture filler words
              if (!['to', 'the', 'a', 'an', 'some'].includes(item)) {
                console.log(`   📦 Pattern 2 (add X to list): "${item}"`);
              } else {
                item = null;
              }
            }
          }
          
          // Pattern 3: "buy X", "get X", "need X"
          if (!item) {
            itemMatch = cleanText.match(/(?:buy|get|need|purchase|grab|pick up)\s+(.+?)(?:\s+(?:from|at|to|for me).*)?$/i);
            if (itemMatch && itemMatch[1]) {
              item = itemMatch[1].trim();
              console.log(`   📦 Pattern 3 (buy/get/need X): "${item}"`);
            }
          }
          
          // Pattern 4: Extract nouns using NLP
          if (!item) {
            const nouns = doc.nouns().out('array');
            const stopWords = ['list', 'shopping', 'cart', 'item', 'store', 'groceries', 'market'];
            
            for (const noun of nouns) {
              if (!stopWords.includes(noun.toLowerCase())) {
                item = noun;
                console.log(`   📦 Pattern 4 (noun extraction): "${item}"`);
                break;
              }
            }
          }
          
          // Pattern 5: Get everything after common trigger phrases
          if (!item) {
            itemMatch = cleanText.match(/(?:list|cart|shopping)\s+(.+)$/i);
            if (itemMatch && itemMatch[1]) {
              item = itemMatch[1].replace(/^(to\s+buy\s+|to\s+get\s+|to\s+)/i, '').trim();
              if (item) {
                console.log(`   📦 Pattern 5 (after trigger): "${item}"`);
              }
            }
          }
          
          entities.item = item || 'item';
          this.userPreferences.lastEntity = entities.item;
          console.log(`   📦 ✅ FINAL ITEM: "${entities.item}"`);
          break;

        case 'search_product':
          let searchTerm = null;
          let searchMatch = null;
          
          // Clean the text first
          const cleanSearchText = text
            .toLowerCase()
            .replace(/\.$|\?$/, '') // Remove trailing period or question mark
            .replace(/\b(i\s+am|i'm|am)\b/gi, '')
            .trim();
          
          console.log(`   🔧 Cleaned search: "${cleanSearchText}"`);
          
          // Pattern 1: "want to eat X" or "want some X" or "want X"
          searchMatch = cleanSearchText.match(/(?:want|like|love)\s+(?:to\s+eat\s+)?(?:some\s+)?(.+?)(?:\s*\.\s*|\s+found\??|\s+please)?$/i);
          if (searchMatch && searchMatch[1]) {
            searchTerm = searchMatch[1]
              .replace(/\b(some|a|an|the|found|please)\b/gi, '')
              .trim();
            if (searchTerm) {
              console.log(`   🔍 Pattern 1 (want/like X): "${searchTerm}"`);
            }
          }
          
          // Pattern 2: "looking for X" or "search for X" or "find X"
          if (!searchTerm) {
            searchMatch = cleanSearchText.match(/(?:looking\s+for|search\s+for|searching\s+for|find|need)\s+(.+?)(?:\s*\.?\s*$)/i);
            if (searchMatch && searchMatch[1]) {
              searchTerm = searchMatch[1]
                .replace(/\b(some|a|an|the|please)\b/gi, '')
                .trim();
              console.log(`   🔍 Pattern 2 (looking for X): "${searchTerm}"`);
            }
          }
          
          // Pattern 3: Extract food nouns
          if (!searchTerm) {
            const nouns = doc.nouns().out('array');
            console.log(`   🔍 Found nouns: [${nouns.join(', ')}]`);
            
            const stopWords = ['search', 'looking', 'find', 'thing', 'product', 'item', 'something', 'anything'];
            for (const noun of nouns) {
              if (!stopWords.includes(noun.toLowerCase())) {
                searchTerm = noun;
                console.log(`   🔍 Pattern 3 (noun): "${searchTerm}"`);
                break;
              }
            }
          }
          
          // Pattern 4: Look for common food/product words
          if (!searchTerm) {
            const foodWords = ['pizza', 'burger', 'milk', 'bread', 'cheese', 'chicken', 'beef', 'fish', 'rice', 'pasta', 'coffee', 'tea', 'juice', 'water', 'fruit', 'vegetable', 'apple', 'banana', 'orange'];
            for (const food of foodWords) {
              if (cleanSearchText.includes(food)) {
                searchTerm = food;
                console.log(`   🔍 Pattern 4 (food word): "${searchTerm}"`);
                break;
              }
            }
          }
          
          // Pattern 5: Last meaningful word
          if (!searchTerm) {
            const words = cleanSearchText.split(/\s+/).filter(w => 
              !['i', 'want', 'to', 'eat', 'some', 'a', 'an', 'the', 'found', 'please', 'find', 'search', 'for'].includes(w)
            );
            if (words.length > 0) {
              searchTerm = words[words.length - 1];
              console.log(`   🔍 Pattern 5 (last word): "${searchTerm}"`);
            }
          }
          
          // ✅ Final cleanup: remove punctuation and helper words like "found"
          if (searchTerm) {
            searchTerm = String(searchTerm)
              .toLowerCase()
              .replace(/\bfound\b/gi, '')           // remove "found"
              .replace(/[^\p{L}\p{N}\s-]/gu, ' ')   // remove punctuation (keeps letters/numbers/spaces)
              .replace(/\s+/g, ' ')                // collapse spaces
              .trim();
          }

          // ✅ ALWAYS sanitize final search term (fixes pizza. / pizza ? / quotes)
          searchTerm = this.sanitizeSearchTerm(searchTerm);

          entities.searchTerm = searchTerm || 'product';
          this.userPreferences.lastEntity = entities.searchTerm;
          console.log(`   🔍 ✅ FINAL SEARCH TERM: "${entities.searchTerm}"`);
          break;

          this.userPreferences.lastEntity = entities.searchTerm;
          console.log(`   🔍 ✅ FINAL SEARCH TERM: "${entities.searchTerm}"`);
          break;

        case 'agenda_show': {
          const clean = text.toLowerCase();

          const m = clean.match(/(?:search|find|look\s+for|show)\s+(?:my\s+)?(?:agenda|calendar)?\s*(?:for\s+)?(.+)$/i);
          if (m && m[1]) {
            const term = m[1]
              .replace(/\b(agenda|calendar|events|event|please|me|my)\b/gi, '')
              .trim();

            if (term) entities.searchTerm = term;
          }
          break;
        }

        case 'agenda_add':
          let event = null;
          let agendaMatch = null;
          
          // Clean text
          const cleanAgendaText = text.toLowerCase();
          
          // Pattern 1: "remind me to EVENT"
          agendaMatch = cleanAgendaText.match(/(?:remind\s+me\s+to|reminder\s+to)\s+(.+)/i);
          if (agendaMatch) {
            event = agendaMatch[1].trim();
            console.log(`   📅 Pattern 1: "${event}"`);
          } else {
            // Pattern 2: "schedule EVENT" or "add to calendar EVENT"
            agendaMatch = cleanAgendaText.match(/(?:schedule|add\s+to\s+(?:calendar|agenda):?)\s+(.+)/i);
            if (agendaMatch) {
              event = agendaMatch[1].trim();
              console.log(`   📅 Pattern 2: "${event}"`);
            } else {
              // Pattern 3: Remove all trigger words
              event = text
                .replace(/\b(add|remind|schedule|to|my|me|calendar|agenda|tyo|the)\b/gi, '')
                .trim();
              console.log(`   📅 Pattern 3: "${event}"`);
            }
          }
          
          // Extract date from the event text
          const dateMatch = event ? event.match(/\b(tomorrow|today|tonight|next\s+week|next\s+month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\s+\w+\s+\d{4})/i) : null;
          if (dateMatch) {
            entities.date = dateMatch[1];
            // Remove date from event text
            event = event.replace(dateMatch[0], '').trim();
            console.log(`   📅 Date extracted: "${entities.date}"`);
          }
          
          entities.event = event || 'event';
          this.userPreferences.lastEntity = entities.event;
          console.log(`   📅 ✅ FINAL EVENT: "${entities.event}"${entities.date ? ` on ${entities.date}` : ''}`);
          break;
          
        default:
          console.log(`   ⚠️  No extraction logic for intent: ${intent}`);
      }
    } catch (error) {
      console.error('   ❌ Entity extraction error:', error);
    }

    console.log(`   📤 Returning entities:`, entities);
    return entities;
  }

  // Log conversation
  logConversation(method, input, intent, confidence, language) {
    const log = {
      timestamp: new Date().toISOString(),
      method,
      input,
      intent,
      confidence: typeof confidence === 'number' ? confidence.toFixed(2) : '0.00',
      language
    };
    
    this.conversationLogs.push(log);
    
    if (this.conversationLogs.length > 100) {
      this.conversationLogs.shift();
    }
  }

  // Get logs
  getLogs() {
    return this.conversationLogs;
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Reset conversation
  resetConversation() {
    this.conversationHistory = [];
    this.currentLanguage = 'en';
    this.userPreferences = {
      preferredLanguage: 'en',
      lastIntent: null,
      lastEntity: null
    };
    console.log('🔄 Conversation reset');
  }

  // Get statistics
  getStats() {
    return {
      totalRules: this.rules.length,
      activeRules: this.rules.filter(r => r.active).length,
      languagesSupported: ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl', 'pl', 'ru'],
      intentsAvailable: [...new Set(this.rules.map(r => r.intent))],
      totalConversations: this.conversationLogs.length,
      conversationHistory: this.conversationHistory.length,
      currentLanguage: this.currentLanguage
    };
  }
}

// Export singleton
module.exports = new NLPService();
