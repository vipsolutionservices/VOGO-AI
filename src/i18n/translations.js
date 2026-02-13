// src/i18n/translations.js

const translations = {
  en: {
    greeting: 'Hello 👋',
    subGreeting: 'How can I help you today?',
    inputPlaceholder: 'Ask Kodee anything...',
    send: 'Send',
    close: 'Close',
    typingIndicator: 'Kodee is typing...',
    errorMessage: 'Sorry, something went wrong. Please try again.',
    noResults: 'No results found.',
    fallbackMessage: "I'm sorry, I didn't understand that. Please try rephrasing or select from the options above."
  },
  
  ro: {
    greeting: 'Bună 👋',
    subGreeting: 'Cum vă pot ajuta astăzi?',
    inputPlaceholder: 'Întreabă-l pe Kodee orice...',
    send: 'Trimite',
    close: 'Închide',
    typingIndicator: 'Kodee scrie...',
    errorMessage: 'Ne pare rău, ceva nu a mers bine. Vă rugăm încercați din nou.',
    noResults: 'Nu s-au găsit rezultate.',
    fallbackMessage: 'Îmi pare rău, nu am înțeles. Te rog reformulează sau alege din opțiunile de mai sus.'
  },
  
  it: {
    greeting: 'Ciao 👋',
    subGreeting: 'Come posso aiutarti oggi?',
    inputPlaceholder: 'Chiedi a Kodee qualsiasi cosa...',
    send: 'Invia',
    close: 'Chiudi',
    typingIndicator: 'Kodee sta scrivendo...',
    errorMessage: 'Spiacenti, qualcosa è andato storto. Riprova.',
    noResults: 'Nessun risultato trovato.',
    fallbackMessage: 'Mi dispiace, non ho capito. Prova a riformulare o scegli dalle opzioni sopra.'
  },
  
  fr: {
    greeting: 'Bonjour 👋',
    subGreeting: 'Comment puis-je vous aider aujourd\'hui?',
    inputPlaceholder: 'Demandez à Kodee n\'importe quoi...',
    send: 'Envoyer',
    close: 'Fermer',
    typingIndicator: 'Kodee écrit...',
    errorMessage: 'Désolé, quelque chose s\'est mal passé. Veuillez réessayer.',
    noResults: 'Aucun résultat trouvé.',
    fallbackMessage: 'Désolé, je n\'ai pas compris. Veuillez reformuler ou choisir parmi les options ci-dessus.'
  },
  
  de: {
    greeting: 'Hallo 👋',
    subGreeting: 'Wie kann ich Ihnen heute helfen?',
    inputPlaceholder: 'Fragen Sie Kodee etwas...',
    send: 'Senden',
    close: 'Schließen',
    typingIndicator: 'Kodee schreibt...',
    errorMessage: 'Entschuldigung, etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
    noResults: 'Keine Ergebnisse gefunden.',
    fallbackMessage: 'Entschuldigung, ich habe das nicht verstanden. Bitte formulieren Sie um oder wählen Sie aus den obigen Optionen.'
  },
  es: {
  greeting: 'Hola 👋',
  subGreeting: '¿Cómo puedo ayudarte hoy?',
  inputPlaceholder: 'Pregunta a Kodee cualquier cosa...',
  send: 'Enviar',
  close: 'Cerrar',
  typingIndicator: 'Kodee está escribiendo...',
  errorMessage: 'Lo siento, algo salió mal. Por favor, inténtalo de nuevo.',
  noResults: 'No se encontraron resultados.',
  fallbackMessage: 'Lo siento, no entendí eso. Por favor reformula o elige de las opciones anteriores.'
}
};

class I18n {
  constructor(defaultLang = 'en') {
    this.currentLang = defaultLang;
    this.translations = translations;
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
    }
  }

  t(key) {
    return this.translations[this.currentLang][key] || key;
  }

  getCurrentLanguage() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
}

export default I18n;