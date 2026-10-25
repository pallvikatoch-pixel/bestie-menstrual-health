// Words that always add a help card, in the app and on the AI server, whatever any answer says.
// English, Hindi and Hinglish. Keep lowercase.
export const URGENT_WORDS = [
  // fainting, sudden or severe pain, bleeding in pregnancy (heavy bleeding alone gets a doctor card, not this)
  'faint', 'fainted', 'fainting', 'passed out', 'unconscious', 'severe pain', 'sudden pain', 'unbearable pain',
  'pregnant and bleeding', 'bleeding while pregnant', 'bleeding in pregnancy',
  'बेहोश', 'चक्कर आकर गिर', 'बहुत तेज़ दर्द', 'अचानक तेज़ दर्द', 'प्रेग्नेंसी में खून',
  'behosh', 'bahut tez dard', 'achanak dard', 'pregnancy me khoon',
]
export const SELF_HARM_WORDS = [
  'hurt myself', 'hurting myself', 'kill myself', 'suicide', 'end my life', 'self harm', 'self-harm', 'cut myself',
  'want to die', 'don’t want to live', "don't want to live", 'no reason to live',
  'ख़ुद को नुक़सान', 'खुद को नुकसान', 'मरना चाहती', 'आत्महत्या', 'जीना नहीं', 'जान दे',
  'khud ko nuksan', 'marna chahti', 'jeena nahi', 'suicide karna',
]
const norm = (s) => s.toLowerCase().normalize('NFC')
export function safetyFlags(text) {
  const t = norm(text || '')
  return {
    urgent: URGENT_WORDS.some((w) => t.includes(norm(w))),
    selfHarm: SELF_HARM_WORDS.some((w) => t.includes(norm(w))),
  }
}
