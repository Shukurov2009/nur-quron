export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakArabic(text: string, rate = 0.72) {
  if (!text || !speechSupported()) return false
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA'
    utterance.rate = rate
    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase().startsWith('ar'))
    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
    return true
  } catch {
    return false
  }
}
