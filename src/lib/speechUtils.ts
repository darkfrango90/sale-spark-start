/**
 * Text-to-Speech utility using Web Speech API
 * Provides voice feedback for operators in Portuguese
 */

export const speak = (text: string, lang: string = 'pt-BR'): void => {
  // Check browser support
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;   // Normal speed
  utterance.pitch = 1.0;  // Normal pitch
  utterance.volume = 1.0; // Maximum volume

  // Try to use a Portuguese voice if available
  const loadVoicesAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Voices might not be loaded immediately on some browsers
  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoicesAndSpeak();
  } else {
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
  }
};

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
