import { Policy, FloorMapZone } from '../types';

export type SupportedLanguage = 'en' | 'tl' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'hi';

export interface BotQueryResult {
  text: string;
  isEscalated?: boolean;
  isSilentThreat?: boolean;
  threatCategory?: 'Self-Harm' | 'Violence/Threat' | 'Illegal Acts/Crime' | 'Sabotage';
  citations?: Array<{
    policyId: string;
    policyTitle: string;
    snippet: string;
  }>;
  floorMapTrigger?: {
    zoneId: string;
    zoneName: string;
    actionLabel: string;
  };
  requiresAssistanceNotice?: boolean;
  assistanceNoticeDetails?: {
    title: string;
    description: string;
    channels: string[];
    isEscalatedToTicket?: boolean;
    ticketId?: string;
  };
}

export function detectLanguage(text: string): SupportedLanguage {
  const lower = text.toLowerCase().trim();

  // Character scripts
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fa5]/.test(text)) {
    if (/\b(有給|ありがとう|こんにちは)\b/.test(text)) return 'ja';
    return 'zh';
  }
  if (/[\u0900-\u097f]/.test(text)) return 'hi';

  // Tagalog / Filipino cues (including colloquialisms and common variants)
  if (
    /\b(kamusta|kumusta|kailan|kelan|saan|nasaan|ano|sino|paano|magkano|bakasyon|sahod|sweldo|kaltas|salamat|gaano|katagal|araw|oras|tulong|trabaho|sagot|sagutin|mag-reply|magrereply|puwede|pwede|po|opo|kalusugan|namin|inyo|ako|ko|kami|ba|mga|nang|tungkol|nakakintindi|nakakaintindi|naintindihan|marunong|astig|galing|ayos|sige|tanghalian|pahinga|pagod|antok|inaantok|bata|alitan|panggabi)\b/i.test(
      lower
    )
  ) {
    return 'tl';
  }

  // Spanish cues
  if (
    /[¿¡]/.test(text) ||
    /\b(hola|buenos|buenas|cómo|como|estás|estas|gracias|cuándo|cuando|dónde|donde|cuánto|cuanto|quién|quien|qué|que|vacaciones|permiso|salud|seguro|remoto|tarda|responder|ayuda|días|dias|estipendio|oficina|hablas|español|espanol|vale|entendido|cansado|nómina|nomina)\b/i.test(
      lower
    )
  ) {
    return 'es';
  }

  // French cues
  if (
    /\b(bonjour|salut|merci|combien|quand|où|ou|comment|congés|conges|vacances|télétravail|teletravail|santé|sante|qui|délai|delai|répondre|repondre|aide|jours|bureau|parles|français|francais|d'accord|compris|fatigué)\b/i.test(
      lower
    )
  ) {
    return 'fr';
  }

  // German cues
  if (
    /\b(hallo|guten|morgen|abend|tag|danke|wann|wie|lange|dauert|wo|wer|urlaub|homeoffice|krankenversicherung|gesundheit|antwort|hilfe|tage|büro|sprichst|deutsch|verstanden|müde)\b/i.test(
      lower
    )
  ) {
    return 'de';
  }

  // Hindi latin transliteration cues
  if (/\b(namaste|dhanyawad|shukriya|kab|kahan|kaise|kitna|chutti|beema|sahayata)\b/i.test(lower)) {
    return 'hi';
  }

  return 'en';
}

export const MULTILINGUAL_STOP_WORDS = new Set([
  'what', 'where', 'from', 'with', 'that', 'have', 'this', 'would', 'could', 'about',
  'when', 'will', 'does', 'take', 'your', 'help', 'please', 'know', 'tell', 'much',
  'many', 'some', 'time', 'days', 'work', 'there', 'their', 'they', 'them', 'then',
  'than', 'into', 'just', 'more', 'also', 'been', 'were', 'which', 'each', 'make',
  'like', 'need', 'want', 'look', 'find', 'give', 'good', 'policy', 'policies',
  'ano', 'saan', 'kailan', 'paano', 'sino', 'bakit', 'gaano', 'magkano', 'ang', 'mga',
  'nang', 'para', 'kayo', 'kami', 'tayo', 'dito', 'doon', 'nito', 'natin', 'namin'
]);

let globalTurnCounter = 0;

export function processMultilingualBotQuery(
  query: string,
  policies: Policy[],
  floorZones: FloorMapZone[],
  onEscalate: (q: string, meta?: any) => void,
  companyName: string = 'Acme Corp',
  adminName: string = 'Claire Admin',
  turnIndex?: number,
  onSilentThreat?: (q: string, category: 'Self-Harm' | 'Violence/Threat' | 'Illegal Acts/Crime' | 'Sabotage') => void
): BotQueryResult {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const lang = detectLanguage(query);
  const currentTurn = turnIndex !== undefined ? turnIndex : globalTurnCounter++;
  const hrContactBadge = `${companyName} HR Team (${adminName})`;

  // =========================================================================
  // 1. SILENT CRITICAL THREAT ROUTING & RESTRICTED CONTENT BOUNDARIES
  // =========================================================================

  // A. Prohibited Content / Illegal Activities
  const isProhibitedOrIllegal =
    /\b(how to make a bomb|make explosives|how to buy a gun illegally|how to make weapons|how to hack|hack into passwords|crack passwords|steal payroll|steal money|steal equipment|steal laptop|launder money|counterfeit|how to synthesize drugs|illegal drugs|sabotage servers|bypass firewalls to steal)\b/i.test(lower);

  if (isProhibitedOrIllegal) {
    if (onSilentThreat) {
      onSilentThreat(query, 'Illegal Acts/Crime');
    } else {
      onEscalate(query, {
        priority: 'Critical_Threat',
        isThreat: true,
        threatCategory: 'Illegal Acts/Crime',
        originalThreatText: query,
      });
    }
    return {
      text: `This request violates workplace safety, legal compliance, and enterprise information security boundaries. PolicyBot AI is strictly restricted from disclosing instructions, materials, or information regarding prohibited activities, illegal actions, weapons, or unauthorized security breaches.`,
      isSilentThreat: true,
      threatCategory: 'Illegal Acts/Crime',
    };
  }

  // B. Self-Harm / Suicide Threat (Silent Escalation + Compassionate Crisis Support)
  const isSelfHarm =
    /\b(kill myself|commit suicide|end my life|want to die|harm myself|hanging myself|overdose on pills|cutting myself|laslas|magpakamatay|gusto ko nang mawala|ayoko na mabuhay)\b/i.test(lower) ||
    (/\b(i want to|planning to|going to)\b/i.test(lower) && /\b(die|suicide|kill myself|end it all)\b/i.test(lower));

  if (isSelfHarm) {
    if (onSilentThreat) {
      onSilentThreat(query, 'Self-Harm');
    } else {
      onEscalate(query, {
        priority: 'Critical_Threat',
        isThreat: true,
        threatCategory: 'Self-Harm',
        originalThreatText: query,
      });
    }
    return {
      text: `I want you to be safe. If you are experiencing overwhelming distress, emotional pain, or having thoughts of harming yourself, please know that compassionate, confidential support is available right now:\n\n• **National Center for Mental Health (NCMH) Crisis Hotline**: Call **1553** (Luzon-wide toll-free) or mobile **0917-899-USAP (8727)**\n• **In Touch Community Services**: (02) 8893-7603 / 0917-800-1123\n• **${companyName} Employee Assistance Program (EAP)**: Confidential counseling is available 24/7 at eap@${companyName.toLowerCase().replace(/\s+/g, '')}.com\n\nPlease reach out to one of these resources or connect with someone you trust—you do not have to carry this alone.`,
      isSilentThreat: true,
      threatCategory: 'Self-Harm',
    };
  }

  // C. Threat to Coworkers, Management, or Boss (Silent Escalation + De-escalation Response)
  const isViolenceThreat =
    /\b(kill my boss|kill the boss|hurt my boss|punch my boss|beat up my boss|murder my boss|attack my boss|hurt my manager|punch my manager|kill my manager|attack my manager|shoot up the office|bring a gun to work|bring a knife to work|stab my coworker|beat up my coworker|hurt someone here|gonna hurt (him|her|them)|sasapakin ko boss ko|papatayin ko manager|sasaktan ko katrabaho)\b/i.test(lower) ||
    (/\b(going to|gonna|want to|planning to|will)\b/i.test(lower) && /\b(punch|beat|hurt|kill|shoot|stab|attack|destroy)\b/i.test(lower) && /\b(boss|manager|supervisor|coworker|colleague|office|workplace)\b/i.test(lower));

  if (isViolenceThreat) {
    if (onSilentThreat) {
      onSilentThreat(query, 'Violence/Threat');
    } else {
      onEscalate(query, {
        priority: 'Critical_Threat',
        isThreat: true,
        threatCategory: 'Violence/Threat',
        originalThreatText: query,
      });
    }
    return {
      text: `I understand that workplace situations can become stressful and emotionally charged, but PolicyBot AI cannot participate in discussions involving physical confrontation, violence, or harm. If you are experiencing serious conflict with management or a colleague, our confidential Workplace Conduct & Dispute Mediation channels are available through People Operations for structured, protected resolution.`,
      isSilentThreat: true,
      threatCategory: 'Violence/Threat',
    };
  }

  // =========================================================================
  // 2. CONTEXTUAL INTENT ROUTING & TONE ADAPTATION (PREVENT FALSE ESCALATIONS)
  // =========================================================================

  // A. Casual Greetings & Foreign Phrases (Peer-like Tone, No Escalation)
  const isCasualGreeting =
    /^(hi|hello|hey|yo|sup|hola|bonjour|hallo|annyeong|annyeonghaseyo|annyeong haseyo|kamusta|kumusta|musta|mabuhay|good day|good morning|good afternoon|good evening|magandang araw|magandang umaga|magandang hapon|magandang gabi|aloha|ciao|namaste|konnichiwa|ni hao|nihao)[\s!.,?]*$/i.test(trimmed) ||
    /^(hey there|hello there|hi policybot|hello policybot|hey bot|hi bot|good day bot)[\s!.,?]*$/i.test(trimmed);

  if (isCasualGreeting) {
    if (lower.includes('annyeong')) {
      return {
        text: `Annyeonghaseyo! 안녕하세요! 😊 Great to connect with you! How's your day going? Feel free to ask me anything about ${companyName} company policies, Philippine labor guidelines, or getting around the office!`,
      };
    }
    if (lower.includes('kamusta') || lower.includes('kumusta') || lower.includes('mabuhay')) {
      return {
        text: `Kamusta! Mabuhay! 😊 Ayos ba ang araw mo? Nandito ako para tumulong sa anumang katanungan mo tungkol sa mga patakaran ng ${companyName}, benepisyo, o floor map!`,
      };
    }
    if (lower.includes('hola')) {
      return {
        text: `¡Hola! ¿Qué tal? 😊 ¡Qué bueno saludarte! Pregúntame lo que necesites sobre las políticas de ${companyName}, beneficios o ubicación en la oficina.`,
      };
    }
    if (lower.includes('bonjour')) {
      return {
        text: `Bonjour ! Comment ça va ? 😊 N'hésitez pas si vous avez des questions sur les politiques de ${companyName} ou les espaces de travail !`,
      };
    }
    return {
      text: `Hey there! Great to see you! How's your day going? 😊 If you need anything regarding ${companyName} policies, leave balances, health perks, or finding rooms on the floor map, just shout—happy to help!`,
    };
  }

  // B. Casual Banter & Chit-Chat (Peer-like Tone, No Escalation)
  const isCasualBanter =
    /\b(how are you|how're you|how r u|how is it going|how's it going|what's up|whats up|wassup|tell me a joke|tell a joke|say something funny|what's your favorite|whats your favorite|do you like|are you a human|are you human|are you real|are you an ai|what can you do|good job|thank you|thanks|salamat|arigato|merci|gracias)\b/i.test(lower) &&
    !lower.includes('policy') && !lower.includes('leave') && !lower.includes('pto') && !lower.includes('benefit') && !lower.includes('overtime') && !lower.includes('salary');

  if (isCasualBanter) {
    if (lower.includes('joke')) {
      return {
        text: `Why did the employee bring a ladder to the office? Because they wanted to reach the next corporate band! 😄 Hope that brought a quick smile. Let me know whenever you need help with real policies, leave credits, or meeting rooms!`,
      };
    }
    if (lower.includes('how are you') || lower.includes("how's it going") || lower.includes("what's up")) {
      return {
        text: `I'm doing awesome, thanks for asking! Ready and eager to help you navigate anything you need across ${companyName}. How are things going on your end today?`,
      };
    }
    if (lower.includes('thank') || lower.includes('salamat') || lower.includes('gracias') || lower.includes('merci')) {
      return {
        text: `You're very welcome! Anytime at all. Just ping me if another question comes up. Have a great day! 🙌`,
      };
    }
    if (lower.includes('human') || lower.includes('real') || lower.includes('ai')) {
      return {
        text: `I am PolicyBot AI—an assistant specifically trained on ${companyName}'s company handbook, Philippine DOLE Labor Code regulations, and our workplace floor plan!`,
      };
    }
    return {
      text: `Glad to chat! As PolicyBot, I'm here to make workplace policies, leave inquiries, and office navigation effortless. What can I look up for you?`,
    };
  }

  // C. Nonsense / Keyboard Mash (Reasonable, Friendly Tone, No Escalation)
  const isNonsenseOrSpam =
    (/^[a-z]{6,}$/i.test(trimmed) && !/[aeiouy]{2}/i.test(trimmed)) ||
    /^(blablabla|blah blah|blah|test test|testing 123|123456|qwerty|asdf|zxcv|lalala|haha+h*|hehe+h*)[\s!.,?]*$/i.test(lower) ||
    (trimmed.length > 5 && /^([^a-zA-Z0-9]+)$/.test(trimmed));

  if (isNonsenseOrSpam) {
    return {
      text: `Haha, looks like some fun keyboard practice! Whenever you have actual questions about ${companyName} policies, leave days, health benefits, or office rooms, just let me know—happy to help!`,
    };
  }

  // =========================================================================
  // LOCATION / SPATIAL INTENT CHECK (STRICT LOCATION GATING)
  // ONLY triggered when explicit spatial/location keywords are present
  // =========================================================================
  const hasSpatialLocationKeyword =
    /\b(where|floor|room|desk|zone|find|cafeteria|bistro|canteen|boardroom|map)\b/i.test(lower) ||
    /(nasaan|saan|pwesto|silid|dónde|donde|ubicación|ubicacion|sala|mapa|où|ou se trouve|bureau|plan|wo ist|standort|raum|どこ|場所|部屋|在哪里|位置|办公室|会议室|kahan|कहाँ|कमरा)/i.test(lower);

  // =========================================================================
  // TIER 1: LANGUAGE & CAPABILITY CHECKS (DO NOT ESCALATE)
  // Queries: "nakakaintindi ka ng tagalog?", "hablas español?", "who are you?"
  // =========================================================================
  const isTagalogCheck =
    lower.includes('nakakaintindi ka') ||
    lower.includes('nakakintindi ka') ||
    lower.includes('marunong ka mag tagalog') ||
    lower.includes('marunong ka mag-tagalog') ||
    lower.includes('naintindihan mo tagalog') ||
    lower.includes('kaya mo ba mag tagalog') ||
    lower.includes('kaya mo ba mag-tagalog') ||
    lower.includes('speak tagalog') ||
    lower.includes('understand tagalog');

  if (isTagalogCheck) {
    return {
      text: `Oo, nakakaintindi at nakakapagsalita ako ng Tagalog! Paano kita matutulungan sa mga patakaran at pasilidad ng ${companyName}?`
    };
  }

  const isSpanishCheck =
    lower.includes('hablas español') ||
    lower.includes('hablas espanol') ||
    lower.includes('entiendes español') ||
    lower.includes('entiendes espanol') ||
    lower.includes('speak spanish') ||
    lower.includes('understand spanish');

  if (isSpanishCheck) {
    return {
      text: `¡Sí, hablo español con total fluidez! ¿Cómo puedo ayudarte hoy con las políticas o espacios de ${companyName}?`
    };
  }

  const isOtherLangCheck =
    lower.includes('parles-tu français') ||
    lower.includes('parlez-vous français') ||
    lower.includes('speak french') ||
    lower.includes('sprichst du deutsch') ||
    lower.includes('speak german') ||
    lower.includes('日本語話せる') ||
    lower.includes('speak japanese') ||
    lower.includes('你会说中文') ||
    lower.includes('speak chinese') ||
    lower.includes('hindi bolte ho') ||
    lower.includes('speak hindi');

  if (isOtherLangCheck) {
    if (lang === 'fr' || lower.includes('french') || lower.includes('français')) {
      return { text: `Oui, je parle et comprends couramment le français ! Comment puis-je vous aider avec les politiques de ${companyName} ?` };
    }
    if (lang === 'de' || lower.includes('german') || lower.includes('deutsch')) {
      return { text: `Ja, ich spreche und verstehe fließend Deutsch! Wie kann ich Ihnen heute bei den Richtlinien von ${companyName} helfen?` };
    }
    if (lang === 'ja' || lower.includes('japanese') || lower.includes('日本語')) {
      return { text: `はい、日本語でのご質問に完全対応しております！${companyName}の社内規定やオフィス案内についてご質問をどうぞ。` };
    }
    if (lang === 'zh' || lower.includes('chinese') || lower.includes('中文')) {
      return { text: `是的，我完全支持中文交流！请问在 ${companyName} 的公司制度或办公空间方面有什么可以协助您的？` };
    }
    if (lang === 'hi' || lower.includes('hindi') || lower.includes('हिंदी')) {
      return { text: `हाँ, मैं हिंदी में पूरी तरह बात कर सकता हूँ! ${companyName} की नीतियों के बारे में आज मैं आपकी क्या सहायता कर सकता हूँ?` };
    }
  }

  const isIdentityCheck =
    lower.includes('who are you') ||
    lower.includes('what are you') ||
    lower.includes('who made you') ||
    lower.includes('sino ka') ||
    lower.includes('quién eres') ||
    lower.includes('quien eres') ||
    lower.includes('qui es-tu') ||
    lower.includes('wer bist du') ||
    lower.includes('あなたは誰') ||
    lower.includes('你是谁');

  if (isIdentityCheck) {
    if (lang === 'tl') {
      return {
        text: `Ako si PolicyBot AI, ang HR assistant para sa ${companyName}. Nagbibigay ako ng mabilis na gabay tungkol sa mga patakaran ng kumpanya, Philippine labor laws (DOLE), floor navigation, at direct HR escalations.`
      };
    }
    if (lang === 'es') {
      return {
        text: `Soy PolicyBot AI, el asistente de RRHH para ${companyName}. Proporciono orientación inmediata sobre políticas internas, normativas laborales de Filipinas (DOLE), orientación en oficinas y derivaciones a RRHH.`
      };
    }
    return {
      text: `I am PolicyBot AI, the intelligent HR assistant operating for ${companyName}. I provide direct guidance on company policies, Philippine labor laws (DOLE), workspace navigation, and HR support.`
    };
  }

  // =========================================================================
  // TIER 2: CASUAL CHAT & BANTER (DO NOT ESCALATE)
  // Queries: "hi", "good morning", "thanks", "im tired", jokes, math questions
  // =========================================================================
  const isGreeting =
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|what's up|whats up|sup)[\.\!\s]*$/i.test(trimmed) ||
    /^(kamusta|kumusta|magandang umaga|magandang araw|magandang hapon|magandang gabi)[\.\!\s]*$/i.test(trimmed) ||
    /^(hola|buenos días|buenos dias|buenas tardes|buenas noches)[\.\!\s]*$/i.test(trimmed) ||
    /^(bonjour|salut|guten tag|guten morgen|こんにちは|你好|नमस्ते)[\.\!\s]*$/i.test(trimmed);

  if (isGreeting) {
    if (lang === 'tl') {
      return { text: `Magandang araw! Paano kita matutulungan ngayon sa mga patakaran o pasilidad ng ${companyName}?` };
    }
    if (lang === 'es') {
      return { text: `¡Hola! ¿En qué puedo orientarte hoy respecto a las políticas o espacios de ${companyName}?` };
    }
    return { text: `Good day! How can I assist you today with ${companyName} workplace policies or guidelines?` };
  }

  const isThanks =
    /\b(thanks|thank you|thx|appreciate it|thank you so much)\b/i.test(lower) ||
    /\b(salamat|maraming salamat|salamat po)\b/i.test(lower) ||
    /\b(gracias|muchas gracias)\b/i.test(lower) ||
    /\b(merci|danke|ありがとう|谢谢|धन्यवाद)\b/i.test(lower);

  if (isThanks) {
    if (lang === 'tl') {
      return { text: `Walang anuman! Sabihin mo lang kung may kailangan ka pa tungkol sa mga patakaran ng ${companyName}.` };
    }
    if (lang === 'es') {
      return { text: `¡De nada! Aquí estoy siempre que necesites consultar las políticas o beneficios de ${companyName}.` };
    }
    return { text: `You're very welcome! Feel free to ask anytime if you need information regarding ${companyName} policies.` };
  }

  const isTiredOrExhausted =
    /\b(tired|exhausted|sleepy|stressed|overwhelmed|long day|drained|need a break)\b/i.test(lower) ||
    /\b(pagod|inaantok|tambak ang trabaho|hapo|kapagod)\b/i.test(lower) ||
    /\b(cansado|agotado|estresado)\b/i.test(lower) ||
    /\b(fatigué|müde|疲れた|累了|थक गया)\b/i.test(lower);

  if (isTiredOrExhausted) {
    if (lang === 'tl') {
      return {
        text: `Huminga nang malalim at magpahinga sandali! ☕ Bukas ang Level 1 Cafeteria para sa kape o meryenda. Huwag mag-atubiling mag-recharge kung kailangan mo ng break.`
      };
    }
    if (lang === 'es') {
      return {
        text: `¡Tómate un respiro! ☕ Recuerda tomar una breve pausa o disfrutar de un café. La Cafetería del Piso 1 está disponible si necesitas despejarte un momento.`
      };
    }
    return {
      text: `Take a breather and hang in there! ☕ Don't hesitate to take a short break or grab coffee. The Level 1 Cafeteria is open if you need a refreshing pause.`
    };
  }

  const isJoke =
    /\b(joke|jokes|tell me a joke|make me laugh|something funny)\b/i.test(lower) ||
    /\b(biro|magbiro|magpatawa)\b/i.test(lower) ||
    /\b(chiste|broma)\b/i.test(lower);

  if (isJoke) {
    return {
      text: `Why did the computer apply for a job? Because it wanted to get a better byte! 💻 Let me know if you'd like to check any workplace policies or benefits!`
    };
  }

  const isMath =
    /\b(2\s*\+\s*2|what is 2\+2|what's 2\+2)\b/i.test(lower) ||
    /^\s*\d+\s*[\+\-\*\/]\s*\d+\s*\??$/i.test(lower);

  if (isMath) {
    return {
      text: `2 + 2 = 4! Let me know if you need help calculating leave balances, overtime rates, or benefits!`
    };
  }

  const isBanterAck =
    /^(ok|okay|got it|noted|alright|sure|cool|nice|awesome|sige|ayos|vale|entendido|d'accord|compris|了解|好的)[\.\!\s]*$/i.test(trimmed);

  if (isBanterAck) {
    if (lang === 'tl') {
      return { text: `Ayos! Sabihin mo lang kung may susunod kang katanungan.` };
    }
    if (lang === 'es') {
      return { text: `¡Entendido! Avísame cuando tengas otra consulta.` };
    }
    return { text: `Got it! Let me know whenever you're ready for another topic or policy query.` };
  }

  // =========================================================================
  // TIER 3: TURNAROUND & SLA INQUIRIES (DO NOT ESCALATE)
  // Queries: "kailan mag-reply ang HR?", "how long until HR responds?", "ticket status"
  // =========================================================================
  const isSlaTurnaround =
    lower.includes('kailan mag-reply') ||
    lower.includes('kailan magrereply') ||
    lower.includes('kelan mag-reply') ||
    lower.includes('kelan magrereply') ||
    lower.includes('gaano katagal bago sumagot') ||
    lower.includes('kailan sasagot ang hr') ||
    lower.includes('oras bago mag-reply') ||
    lower.includes('how long until hr responds') ||
    lower.includes('when will hr reply') ||
    lower.includes('when will hr respond') ||
    lower.includes('how long does hr take') ||
    lower.includes('response time') ||
    lower.includes('turnaround time') ||
    lower.includes('ticket status') ||
    lower.includes('hr response window') ||
    lower.includes('cuándo responderá rrhh') ||
    lower.includes('cuanto tarda rrhh') ||
    lower.includes('délai de réponse rh');

  if (isSlaTurnaround) {
    if (lang === 'tl') {
      return {
        text: `Karaniwang sumasagot ang ${hrContactBadge} sa loob ng **24 hanggang 48 oras ng negosyo**. Ang sagot nila ay direktang lalabas dito sa iyong chat feed bilang isang highlighted HR Direct Message card.`
      };
    }
    if (lang === 'es') {
      return {
        text: `El equipo de ${hrContactBadge} suele revisar y responder las consultas en un plazo de **24 a 48 horas hábiles**. La respuesta aparecerá directamente en este chat como una tarjeta destacada de Mensaje Directo.`
      };
    }
    return {
      text: `The standard HR response window is **24 to 48 business hours**. Once reviewed, replies from the **${hrContactBadge}** will appear directly in your chat feed as a highlighted HR Direct Message card.`
    };
  }

  // =========================================================================
  // TIER 4: INDEXED POLICIES & DOLE PHILIPPINE LABOR LAWS
  // Grounded in legal mandate, Book 3, Mandatory Programs & Company Policies
  // =========================================================================

  // 1. DOLE Executive Mandate & Overview
  const isDoleExecutive =
    lower.includes('dole mandate') ||
    lower.includes('mandate of dole') ||
    lower.includes('executive mandate') ||
    lower.includes('core pillars of dole') ||
    lower.includes('dole pillars') ||
    lower.includes('dole overview') ||
    lower.includes('ano ang dole') ||
    lower.includes('mandato ng dole') ||
    lower.includes('department of labor and employment') ||
    (lower.includes('dole') && (lower.includes('pillar') || lower.includes('function') || lower.includes('agency')));

  if (isDoleExecutive) {
    const doleExecPolicy = policies.find((p) => p.title.includes('Executive_Mandate')) || {
      id: 'p_dole_exec',
      companyId: 'acme',
      title: 'DOLE_Executive_Mandate.pdf',
      content: 'Primary executive agency of Philippine Government for labor & employment. Core pillars: Gainful Employment Promotion, Worker Protection & Welfare, Industrial Peace.',
      category: 'DOLE & Philippine Labor Law',
      lastUpdated: '2026-03-01'
    };

    if (lang === 'tl') {
      return {
        text: `Ang Department of Labor and Employment (DOLE) ang pangunahing executive agency ng Pamahalaan ng Pilipinas na may mandato sa pagbalangkas, pagpapatupad, at koordinasyon ng mga patakaran sa paggawa at empleyo.\n\nMga Pangunahing Haligi (Core Pillars):\n- **Gainful Employment Promotion:** Pagpapadali ng trabaho sa loob at labas ng bansa at pagpapahusay ng kasanayan.\n- **Worker Protection & Welfare:** Pagpapatupad ng statutory wages, kaligtasan sa trabaho, at occupational health standards.\n- **Industrial Peace:** Pagresolba ng alitan sa paggawa sa pamamagitan ng conciliation-mediation (SEnA) at voluntary arbitration. [📄 DOLE_Executive_Mandate.pdf]`,
        citations: [{
          policyId: doleExecPolicy.id,
          policyTitle: 'DOLE_Executive_Mandate.pdf',
          snippet: doleExecPolicy.content
        }]
      };
    }

    return {
      text: `The Department of Labor and Employment (DOLE) is the primary executive agency of the Philippine Government mandated to formulate, coordinate, and implement policies and programs in labor and employment.\n\nCore Pillars:\n- **Gainful Employment Promotion:** Local and overseas job placement facilitation and skills development programs.\n- **Worker Protection & Welfare:** Enforcing statutory minimum wages, workplace safety, and occupational health standards.\n- **Industrial Peace:** Resolving labor-management disputes through conciliation-mediation (SEnA) and voluntary arbitration. [📄 DOLE_Executive_Mandate.pdf]`,
      citations: [{
        policyId: doleExecPolicy.id,
        policyTitle: 'DOLE_Executive_Mandate.pdf',
        snippet: doleExecPolicy.content
      }]
    };
  }

  // 2. DOLE Labor Code Book 3: Conditions of Employment
  const isBook3Overtime =
    lower.includes('overtime') ||
    lower.includes('ot pay') ||
    lower.includes('overtime pay') ||
    lower.includes('bayad sa overtime') ||
    lower.includes('magkano ot') ||
    lower.includes('magkano ang ot') ||
    lower.includes('art 87') ||
    lower.includes('art 88') ||
    lower.includes('arts 87-88') ||
    lower.includes('undertime');

  const isBook3NightDiff =
    lower.includes('night shift') ||
    lower.includes('night diff') ||
    lower.includes('night differential') ||
    lower.includes('art 86') ||
    lower.includes('10:00 pm') ||
    lower.includes('panggabi') ||
    lower.includes('panggabing trabaho');

  const isBook3HoursAndMeals =
    lower.includes('hours of work') ||
    lower.includes('meal break') ||
    lower.includes('meal period') ||
    lower.includes('uncompensated meal') ||
    lower.includes('short rest') ||
    lower.includes('oras ng trabaho') ||
    lower.includes('tanghalian') ||
    lower.includes('arts 83-85') ||
    lower.includes('8 normal working hours') ||
    lower.includes('8 hours per day');

  const isBook3RestDay =
    lower.includes('rest day') ||
    lower.includes('weekly rest day') ||
    lower.includes('araw ng pahinga') ||
    lower.includes('day off') ||
    lower.includes('arts 91-93') ||
    lower.includes('24 consecutive hours');

  const isBook3HolidaysAndSil =
    lower.includes('regular holiday') ||
    lower.includes('special non-working') ||
    lower.includes('service incentive leave') ||
    lower.includes('sil') ||
    lower.includes('holiday pay') ||
    lower.includes('bayad sa holiday') ||
    lower.includes('arts 94-95');

  const isBook3ServiceCharges =
    lower.includes('service charge') ||
    lower.includes('service charges') ||
    lower.includes('art 96') ||
    lower.includes('ra 11360') ||
    lower.includes('r.a. 11360');

  const isBook3WagesAndDeductions =
    lower.includes('minimum wage') ||
    lower.includes('wage deduction') ||
    lower.includes('unauthorized deduction') ||
    lower.includes('kaltas sa sahod') ||
    lower.includes('rtwpb') ||
    lower.includes('arts 97-119') ||
    lower.includes('intervals not exceeding 16 days');

  const isBook3General =
    lower.includes('book 3') ||
    lower.includes('conditions of employment') ||
    lower.includes('art 82') ||
    lower.includes('labor code book 3');

  if (
    isBook3Overtime ||
    isBook3NightDiff ||
    isBook3HoursAndMeals ||
    isBook3RestDay ||
    isBook3HolidaysAndSil ||
    isBook3ServiceCharges ||
    isBook3WagesAndDeductions ||
    isBook3General
  ) {
    const book3Policy = policies.find((p) => p.title.includes('Book3')) || {
      id: 'p_dole_book3',
      companyId: 'acme',
      title: 'DOLE_Labor_Code_Book3.pdf',
      content: 'Labor Code Book 3: Conditions of Employment. Covers normal hours, overtime rates (+25%/+30%), night differential (+10%), rest days, holiday pay, SIL, and wage protections.',
      category: 'Labor Standards & Book 3',
      lastUpdated: '2026-03-01'
    };

    let textResponse = '';

    if (isBook3Overtime) {
      if (lang === 'tl') {
        textResponse = `Ayon sa DOLE Labor Code Book 3 (Arts. 87–88), ganito kinakalkula ang overtime pay:\n- **Regular Workday OT:** Karagdagang **+25%** ng regular hourly rate para sa trabahong lampas sa 8 oras.\n- **Rest Day / Holiday OT:** Karagdagang **+30%** ng rest day o holiday hourly rate.\n- **Undertime Rule:** Ang undertime sa anumang araw ng trabaho ay hindi maaaring ibawas o i-offset sa overtime sa ibang araw. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Arts. 87–88), overtime pay is governed as follows:\n- **Regular Workday OT:** Plus **25%** of the regular hourly rate for work performed beyond 8 hours.\n- **Rest Day / Holiday OT:** Plus **30%** of the applicable rest day or holiday hourly rate.\n- **Undertime Rule:** Undertime on any workday cannot be offset by overtime performed on another day. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3NightDiff) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Art. 86), ang **Night Shift Differential** ay karagdagang **+10%** ng regular hourly wage para sa bawat oras ng trabahong ginawa sa pagitan ng **10:00 PM at 6:00 AM**. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Art. 86), employees are entitled to a **Night Shift Differential** of not less than **+10%** of their regular hourly wage for work performed between **10:00 PM and 6:00 AM**. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3HoursAndMeals) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Arts. 83–85):\n- **Oras ng Trabaho:** Maximum **8 normal working hours** bawat araw.\n- **Meal Break:** May mandatory minimum **60-minute uncompensated meal break**.\n- **Short Rest Periods:** Ang maikling pahinga na **5 hanggang 20 minuto** ay binabayaran bilang working time. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Arts. 83–85):\n- **Hours of Work:** Maximum **8 normal working hours** per day.\n- **Meal Break:** Mandatory minimum **60-minute uncompensated meal break**.\n- **Short Rest Periods:** Rest periods of **5 to 20 minutes** are compensable working time. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3RestDay) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Arts. 91–93), may karapatan ang empleyado sa **24 consecutive hours of rest** pagkatapos ng 6 na magkakasunod na araw ng trabaho. Ang trabaho sa nakatakdang rest day ay may **+30% premium pay** (**+50%** kung tumapat sa special holiday). [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Arts. 91–93), employees have the right to **24 consecutive hours of rest** after 6 consecutive workdays. Work performed on a scheduled rest day commands a **+30% premium pay** (**+50%** if the rest day coincides with a special holiday). [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3HolidaysAndSil) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Arts. 94–95):\n- **Regular Holidays:** Binabayaran ng **100%** kung hindi pumasok; **200%** para sa unang 8 oras kung pumasok.\n- **Special Non-Working Days:** 'No work, no pay' baseline; **130%** kung pumasok.\n- **Service Incentive Leave (SIL):** **5 araw ng bayad na leave** bawat taon pagkatapos ng 1 taong serbisyo; commutable sa cash kung hindi nagamit. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Arts. 94–95):\n- **Regular Holidays:** Paid **100%** if unworked; **200%** for the first 8 hours if worked.\n- **Special Non-Working Days:** 'No work, no pay' baseline; **130%** if worked.\n- **Service Incentive Leave (SIL):** **5 days paid annual leave** after 1 year of service; commutable to cash if unused. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3ServiceCharges) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Art. 96 at R.A. 11360), **100% ng nakolektang service charges** ng mga hotel at restawran ay dapat ipamahagi nang pantay sa lahat ng sakop na kawani. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Art. 96 & R.A. 11360), **100% of service charges** collected by hotels and restaurants must be distributed equally among all covered rank-and-file and supervisory staff. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else if (isBook3WagesAndDeductions) {
      if (lang === 'tl') {
        textResponse = `Ayon sa Labor Code Book 3 (Arts. 97–119):\n- **Minimum Wage:** Itinatakda ng **RTWPB** ayon sa rehiyon.\n- **Pagbabayad:** Ibinibigay nang hindi bababa sa dalawang beses kada buwan (**intervals ≤ 16 days**).\n- **Kaltas:** Mahigpit na ipinagbabawal ang di-awtorisadong kaltas, maliban sa statutory contributions (**SSS, PhilHealth, Pag-IBIG**), buwis, o authorized union dues. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Arts. 97–119):\n- **Minimum Wages:** Regionally determined by the **RTWPB**.\n- **Payment Frequency:** Paid at least twice monthly at **intervals ≤ 16 days**.\n- **Deductions:** Unauthorized wage deductions are strictly illegal, except for statutory **SSS, PhilHealth, Pag-IBIG**, withholding taxes, or authorized union dues. [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    } else {
      // General Book 3
      if (lang === 'tl') {
        textResponse = `Ayon sa DOLE Labor Code Book 3 (Conditions of Employment), sakop ang lahat ng manggagawa sa lahat ng establisimyento maliban sa kawani ng gobyerno, managerial staff, field personnel, at domestic workers. Kinokontrol nito ang normal na 8-oras na araw ng trabaho, 60-minutong break, overtime (+25%/+30%), night differential (+10%), weekly rest day, holiday pay, at 5-araw na SIL. [📄 DOLE_Labor_Code_Book3.pdf]`;
      } else {
        textResponse = `Under Labor Code Book 3 (Conditions of Employment, Art. 82), provisions apply to all employees in all establishments, excluding government workers, managerial personnel, field staff, family dependents, and domestic helpers. It governs the 8-hour workday, mandatory 60-min meal break, night differential (+10%), overtime pay (+25%/+30%), 24-hour weekly rest day, holiday pay, and 5-day Service Incentive Leave (SIL). [📄 DOLE_Labor_Code_Book3.pdf]`;
      }
    }

    return {
      text: textResponse,
      citations: [{
        policyId: book3Policy.id,
        policyTitle: 'DOLE_Labor_Code_Book3.pdf',
        snippet: book3Policy.content
      }]
    };
  }

  // 3. DOLE Mandatory Workplace Policies & Programs
  const isOsh =
    lower.includes('osh') ||
    lower.includes('occupational safety') ||
    lower.includes('safety officer') ||
    lower.includes('first aider') ||
    lower.includes('ra 11058') ||
    lower.includes('r.a. 11058') ||
    lower.includes('do 198-18') ||
    lower.includes('kaligtasan sa trabaho') ||
    lower.includes('safety committee');

  const isDrugFree =
    lower.includes('drug-free') ||
    lower.includes('drug free') ||
    lower.includes('drug test') ||
    lower.includes('random drug') ||
    lower.includes('ra 9165') ||
    lower.includes('r.a. 9165') ||
    lower.includes('do 53-03');

  const isCodiOrHarassment =
    lower.includes('codi') ||
    lower.includes('safe spaces') ||
    lower.includes('decorum and investigation') ||
    lower.includes('ra 7877') ||
    lower.includes('r.a. 7877') ||
    lower.includes('ra 11313') ||
    lower.includes('r.a. 11313') ||
    (lower.includes('harassment') && (lower.includes('sexual') || lower.includes('safe spaces') || lower.includes('law')));

  const isMentalHealth =
    lower.includes('mental health') ||
    lower.includes('ra 11036') ||
    lower.includes('r.a. 11036') ||
    lower.includes('do 208-20') ||
    lower.includes('psychological safety') ||
    lower.includes('counseling support') ||
    lower.includes('destigmatization');

  const isHealthDiseaseControl =
    lower.includes('tuberculosis') ||
    lower.includes('tb policy') ||
    lower.includes('do 73-05') ||
    lower.includes('hiv') ||
    lower.includes('aids') ||
    lower.includes('ra 11166') ||
    lower.includes('r.a. 11166') ||
    lower.includes('hepatitis b') ||
    lower.includes('da 05-10');

  const isLactationFamily =
    lower.includes('lactation') ||
    lower.includes('breastfeeding') ||
    lower.includes('lactation station') ||
    lower.includes('nursing break') ||
    lower.includes('ra 10028') ||
    lower.includes('r.a. 10028') ||
    lower.includes('family welfare') ||
    lower.includes('do 56-03') ||
    lower.includes('nagpapasuso');

  const isMandatoryGeneral =
    lower.includes('mandatory workplace policies') ||
    lower.includes('mandatory workplace programs') ||
    lower.includes('mandatory policies') ||
    lower.includes('dole mandatory');

  if (
    isOsh ||
    isDrugFree ||
    isCodiOrHarassment ||
    isMentalHealth ||
    isHealthDiseaseControl ||
    isLactationFamily ||
    isMandatoryGeneral
  ) {
    const mandatoryPolicy = policies.find((p) => p.title.includes('Mandatory_Policies')) || {
      id: 'p_dole_mandatory',
      companyId: 'acme',
      title: 'DOLE_Mandatory_Policies_2026.pdf',
      content: 'Mandatory workplace programs under Philippine law: OSH Program (R.A. 11058), Drug-Free Workplace (R.A. 9165), Anti-Sexual Harassment CODI (R.A. 7877 & R.A. 11313), Mental Health (R.A. 11036), Infectious Diseases, and Lactation Stations (R.A. 10028).',
      category: 'DOLE Mandatory Programs',
      lastUpdated: '2026-03-01'
    };

    let textResponse = '';

    if (isOsh) {
      if (lang === 'tl') {
        textResponse = `Sa ilalim ng **R.A. 11058 at DOLE DO 198-18**, kinakailangan sa Occupational Safety & Health (OSH) Program ang pagtatalaga ng mga sertipikadong **Safety Officers**, **First Aiders**, safety committee, at mandatoryong 8-oras na oryentasyon sa kaligtasan para sa lahat ng empleyado. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under **R.A. 11058 / DOLE DO 198-18**, workplaces must implement an Occupational Safety & Health (OSH) Program requiring certified **Safety Officers**, certified **First Aiders**, an active Health & Safety Committee, and mandatory safety orientations. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else if (isDrugFree) {
      if (lang === 'tl') {
        textResponse = `Sa ilalim ng **R.A. 9165 at DOLE DO 53-03**, ang Drug-Free Workplace Policy ay nagtatakda ng mandatoryong oryentasyon, random testing protocols mula sa mga accredited center, at tulong sa rehabilitasyon. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under **R.A. 9165 / DOLE DO 53-03**, companies must implement a Drug-Free Workplace Policy requiring employee drug education orientations, random drug testing protocols by accredited facilities, and rehabilitation assistance. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else if (isCodiOrHarassment) {
      if (lang === 'tl') {
        textResponse = `Sa ilalim ng **R.A. 7877 at R.A. 11313 (Safe Spaces Act)**, ipinapatupad ang zero tolerance sa sexual harassment at sapilitang pagtatag ng **Committee on Decorum and Investigation (CODI)** upang mag-imbestiga at lumutas ng mga hinaing sa loob ng 10 araw. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under **R.A. 7877 & R.A. 11313 (Safe Spaces Act)**, employers must maintain zero tolerance for sexual harassment and establish an active **Committee on Decorum and Investigation (CODI)** to investigate and resolve grievances within 10 days. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else if (isMentalHealth) {
      if (lang === 'tl') {
        textResponse = `Sa ilalim ng **R.A. 11036 at DOLE DO 208-20**, itinataguyod ng Mental Health Workplace Policy ang edukasyon, pagtanggal ng stigma, at mga pathways para sa counseling support at pagpapayo sa mga empleyado. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under **R.A. 11036 / DOLE DO 208-20**, employers are mandated to enforce a Mental Health Workplace Policy providing mental health education, de-stigmatization programs, and confidential counseling support pathways. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else if (isHealthDiseaseControl) {
      if (lang === 'tl') {
        textResponse = `Ayon sa mga batas sa kalusugan (**R.A. 11166 / DO 102-10** para sa HIV/AIDS, **DO 73-05** para sa Tuberculosis, at **DA 05-10** para sa Hepatitis B), tinitiyak ang mahigpit na confidentiality ng medical records, walang diskriminasyon, at garantisadong pagbabalik sa trabaho pagkatapos ng gamutan. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under statutory health guidelines (**R.A. 11166 / DO 102-10** for HIV/AIDS, **DO 73-05** for Tuberculosis, and **DA 05-10** for Hepatitis B), employers must guarantee strict medical confidentiality, non-discrimination, and job restoration post-treatment. [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else if (isLactationFamily) {
      if (lang === 'tl') {
        textResponse = `Sa ilalim ng **R.A. 10028**, mayroong malinis na **Lactation Stations** at binabayarang nursing breaks na hindi bababa sa **40 minuto** para sa bawat 8-oras na araw ng trabaho, kasama ang Family Welfare Program (**DO 56-03**). [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Under **R.A. 10028 (Expanded Breastfeeding Promotion Act)**, employers must provide clean **Lactation Stations** and compensable nursing breaks of at least **40 minutes** per 8-hour workday, supported by Family Welfare Programs (**DO 56-03**). [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    } else {
      // General Mandatory Programs
      if (lang === 'tl') {
        textResponse = `Kabilang sa mga mandatoryong programa ng DOLE ang **OSH Program** (R.A. 11058), **Drug-Free Workplace** (R.A. 9165), **Anti-Sexual Harassment & Safe Spaces CODI** (R.A. 11313), **Mental Health Policy** (R.A. 11036), **Health Disease Control** (HIV/TB/Hep B), at **Lactation Stations** (R.A. 10028). [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      } else {
        textResponse = `Statutory DOLE mandatory workplace programs include the **OSH Program** (R.A. 11058), **Drug-Free Workplace Policy** (R.A. 9165), **Anti-Sexual Harassment CODI** (R.A. 11313), **Mental Health Workplace Policy** (R.A. 11036), **Infectious Disease Control** (HIV/TB/Hepatitis B), and **Lactation Stations** (R.A. 10028). [📄 DOLE_Mandatory_Policies_2026.pdf]`;
      }
    }

    return {
      text: textResponse,
      citations: [{
        policyId: mandatoryPolicy.id,
        policyTitle: 'DOLE_Mandatory_Policies_2026.pdf',
        snippet: mandatoryPolicy.content
      }]
    };
  }

  // 4. Floor Map Location Inquiries (Strict Location Trigger Rule)
  // ONLY render floor map directions and trigger if explicit spatial keyword is used!
  if (hasSpatialLocationKeyword) {
    const isHrHelpdeskLoc =
      lower.includes('hr') ||
      lower.includes('helpdesk') ||
      lower.includes('desk') ||
      lower.includes('zone');

    const isBoardroomLoc =
      lower.includes('boardroom') ||
      lower.includes('meeting room') ||
      lower.includes('conference');

    const isCafeteriaLoc =
      lower.includes('cafeteria') ||
      lower.includes('bistro') ||
      lower.includes('canteen') ||
      lower.includes('kainan') ||
      lower.includes('dining');

    if (isBoardroomLoc) {
      return {
        text: `The Executive Boardroom is located on Floor 2 (West Wing), equipped with a 12-person conference table, acoustic soundproofing, and dual 4K presentation screens.`,
        floorMapTrigger: {
          zoneId: 'f2',
          zoneName: 'Executive Boardroom',
          actionLabel: '📍 Highlight Boardroom on Floor Map'
        }
      };
    }

    if (isCafeteriaLoc) {
      return {
        text: `The ${companyName} Bistro & Town Hall Lounge is located on Floor 1 (South Atrium), open daily from 7:30 AM to 6:00 PM with cold brew, espresso bar, and lunch service.`,
        floorMapTrigger: {
          zoneId: 'f4',
          zoneName: 'Acme Bistro & Town Hall Lounge',
          actionLabel: '📍 Highlight Cafeteria on Floor Map'
        }
      };
    }

    if (isHrHelpdeskLoc || lower.includes('map')) {
      return {
        text: `The HR Helpdesk is located at Zone 2B (East Wing) on Floor 2. It operates from 9:00 AM to 5:00 PM for badge pickups, paperwork, and confidential consultations.`,
        floorMapTrigger: {
          zoneId: 'f1',
          zoneName: 'HR Helpdesk (Zone 2B)',
          actionLabel: '📍 Highlight HR Helpdesk on Floor Map'
        }
      };
    }
  }

  // 5. Company Core Policies (PTO, WFH stipend, Health benefits, Conduct, IT Security)
  const isPtoQuery =
    lower.includes('pto') ||
    lower.includes('vacation') ||
    lower.includes('paid time off') ||
    lower.includes('bereavement') ||
    lower.includes('bakasyon') ||
    (lower.includes('leave') && !lower.includes('service incentive leave') && !lower.includes('sil'));

  if (isPtoQuery) {
    const ptoPolicy = policies.find((p) => p.title.includes('PTO')) || policies[0];
    let ptoText = `${companyName} provides 15 days of paid time off (PTO) per calendar year, along with 5 days of bereavement leave. Up to 3 unused PTO days can roll over to the next year. [📄 2026_PTO_Policy.pdf]`;
    if (lang === 'tl') {
      ptoText = `Nagbibigay ang ${companyName} ng 15 araw ng bayad na bakasyon (PTO) bawat taon, kasama ang 5 araw ng bereavement leave. Hanggang 3 hindi nagamit na araw ng PTO ang maaaring i-rollover sa susunod na taon. [📄 2026_PTO_Policy.pdf]`;
    }
    return {
      text: ptoText,
      citations: [{
        policyId: ptoPolicy.id,
        policyTitle: '2026_PTO_Policy.pdf',
        snippet: ptoPolicy.content
      }]
    };
  }

  const isRemoteQuery =
    lower.includes('remote') ||
    lower.includes('wfh') ||
    lower.includes('stipend') ||
    lower.includes('internet') ||
    lower.includes('home office') ||
    lower.includes('equipment stipend');

  if (isRemoteQuery) {
    const remotePolicy = policies.find((p) => p.title.includes('Remote')) || policies[1] || policies[0];
    let remoteText = `Under our Remote Work Policy, ${companyName} provides a $50/month internet reimbursement and a one-time $300 home office equipment stipend. [📄 Remote_Work_Guide.pdf]`;
    if (lang === 'tl') {
      remoteText = `Sa ilalim ng Remote Work Policy, nagbibigay ang ${companyName} ng $50/buwan na bayad sa internet at isang beses na $300 home office equipment stipend. [📄 Remote_Work_Guide.pdf]`;
    }
    return {
      text: remoteText,
      citations: [{
        policyId: remotePolicy.id,
        policyTitle: 'Remote_Work_Guide.pdf',
        snippet: remotePolicy.content
      }]
    };
  }

  const isHealthBenefitsQuery =
    lower.includes('health') ||
    lower.includes('dental') ||
    lower.includes('vision') ||
    lower.includes('open enrollment') ||
    lower.includes('hsa match') ||
    lower.includes('medical insurance') ||
    lower.includes('benepisyo sa kalusugan');

  if (isHealthBenefitsQuery) {
    const healthPolicy = policies.find((p) => p.title.includes('Health')) || policies[2] || policies[0];
    let healthText = `Annual open enrollment runs from November 1 to November 30. Comprehensive medical, dental, and vision coverage details are available in the benefits portal, with up to a $500 employer HSA match. [📄 Health_Benefits_2026.pdf]`;
    if (lang === 'tl') {
      healthText = `Ang taunang open enrollment para sa kalusugan ay bukas mula Nobyembre 1 hanggang Nobyembre 30, kabilang ang medical, dental, at vision coverage na may hanggang $500 employer HSA match. [📄 Health_Benefits_2026.pdf]`;
    }
    return {
      text: healthText,
      citations: [{
        policyId: healthPolicy.id,
        policyTitle: 'Health_Benefits_2026.pdf',
        snippet: healthPolicy.content
      }]
    };
  }

  const isConductQuery =
    lower.includes('workplace conduct') ||
    lower.includes('code of conduct') ||
    lower.includes('ethics') ||
    lower.includes('non-retaliation') ||
    lower.includes('discrimination');

  if (isConductQuery) {
    const conductPolicy = policies.find((p) => p.title.includes('Conduct')) || policies[3] || policies[0];
    let conductText = `Under ${companyName}'s Workplace Conduct Policy, employees are guaranteed an inclusive environment free from harassment and discrimination, with equal opportunity for advancement. Concerns can be confidentially reported with strict non-retaliation protections. [📄 Workplace_Conduct_2026.pdf]`;
    if (lang === 'tl') {
      conductText = `Sa ilalim ng Workplace Conduct Policy ng ${companyName}, ginagarantiyahan ang isang inklusibong kapaligiran na walang diskriminasyon o panliligalig, nang may mahigpit na proteksyon laban sa paghihiganti. [📄 Workplace_Conduct_2026.pdf]`;
    }
    return {
      text: conductText,
      citations: [{
        policyId: conductPolicy.id,
        policyTitle: 'Workplace_Conduct_2026.pdf',
        snippet: conductPolicy.content
      }]
    };
  }

  const isItSecurityQuery =
    lower.includes('security') ||
    lower.includes('mfa') ||
    lower.includes('password') ||
    lower.includes('laptop') ||
    lower.includes('stolen') ||
    lower.includes('lost device') ||
    lower.includes('hardware refresh');

  if (isItSecurityQuery) {
    const itPolicy = policies.find((p) => p.title.includes('IT_Security')) || policies[4] || policies[0];
    let itText = `Under our IT Security Policy, all employees must enable Multi-Factor Authentication (MFA), utilize company hardware eligible for a 3-year laptop refresh cycle, and report lost or stolen devices within 2 hours. [📄 IT_Security_Policy.pdf]`;
    if (lang === 'tl') {
      itText = `Sa ilalim ng IT Security Policy, kailangang paganahin ang MFA, gumamit ng hardware na kwalipikado para sa 3-taong laptop refresh cycle, at i-report ang nawawalang gamit sa loob ng 2 oras. [📄 IT_Security_Policy.pdf]`;
    }
    return {
      text: itText,
      citations: [{
        policyId: itPolicy.id,
        policyTitle: 'IT_Security_Policy.pdf',
        snippet: itPolicy.content
      }]
    };
  }

  // Dynamic search across all policies in knowledge base (including newly created ones)
  const dynamicPolicyMatch = (policies || []).find((p) => {
    if (!p || !p.title) return false;
    const titleClean = p.title.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const words = titleClean.split(/\s+/).filter((w) => w.length > 3 && !['policy', 'guide', 'handbook', 'pdf'].includes(w));
    return words.some((w) => lower.includes(w));
  });

  if (dynamicPolicyMatch) {
    return {
      text: `Based on **${dynamicPolicyMatch.title}** (${dynamicPolicyMatch.category || 'Verified Company Policy'}):\n\n${dynamicPolicyMatch.content}`,
      citations: [
        {
          policyId: dynamicPolicyMatch.id,
          policyTitle: dynamicPolicyMatch.title,
          snippet: dynamicPolicyMatch.content.slice(0, 160),
        },
      ],
    };
  }

  // =========================================================================
  // TIER 5: UNANSWERED / OUT-OF-SCOPE QUESTIONS & ESCALATION RULES
  // When PolicyBot cannot confidently answer based on the verified handbook:
  // - Clearly state that it cannot be answered based on available company info
  // - Do NOT provide guessed, misleading, or unsupported answers
  // - Display a highly visible RED-HIGHLIGHTED notice for further assistance
  // - Only auto-create an HR ticket when existing escalation rules are met
  // =========================================================================
  const isWorkPolicyRelated =
    /\b(policy|handbook|leave|pto|vacation|sick|maternity|paternity|bereavement|overtime|holiday|night shift|differential|salary|wage|payroll|deduction|13th|separation|severance|bonus|benefit|allowance|hmo|insurance|health|stipend|reimbursement|remote|wfh|work from home|equipment|laptop|vpn|monitor|conduct|harassment|discipline|termination|resignation|notice period|probation|promotion|appraisal|hours|schedule|uniform|dress code|attendance|tardiness|dole|labor code|zone|room|desk|office|cafeteria|bistro|pet|crypto|bitcoin|tuition|sabbatical|mental health day|transfers|wages)\b/i.test(
      lower
    ) ||
    lower.includes('can i') ||
    lower.includes('are we allowed') ||
    lower.includes('how do i apply') ||
    lower.includes('is it allowed') ||
    lower.includes('pwede ba') ||
    lower.includes('magkano') ||
    lower.includes('kailan') ||
    lower.includes('entitled');

  // Case A: Out-of-Scope / Non-Policy / Personal Query not meeting escalation rules
  // DO NOT automatically create an HR ticket!
  if (!isWorkPolicyRelated) {
    let outOfScopeText = `PolicyBot cannot answer this question based on the available company information. I specialize strictly in verified ${companyName} company policies, Philippine DOLE Labor Code guidelines, and workplace facilities.\n\nTo ensure complete accuracy, I do not provide guessed, misleading, or unsupported answers.`;
    if (lang === 'tl') {
      outOfScopeText = `Hindi masagot ng PolicyBot ang katanungang ito batay sa kasalukuyang impormasyon ng kumpanya. Upang matiyak ang kumpletong katumpakan, hindi ako nagbibigay ng mga hula o hindi beripikadong sagot.`;
    } else if (lang === 'es') {
      outOfScopeText = `PolicyBot no puede responder a esta pregunta con base en la información disponible de la empresa. Para garantizar la precisión, no proporciono respuestas basadas en suposiciones ni datos no verificados.`;
    }

    return {
      text: outOfScopeText,
      isEscalated: false,
      requiresAssistanceNotice: true,
      assistanceNoticeDetails: {
        title: '⚠️ FURTHER ASSISTANCE NEEDED',
        description: 'PolicyBot cannot answer this question based on the available company information.',
        channels: ['HR Direct Messages', 'My HR Tickets'],
        isEscalatedToTicket: false,
      },
    };
  }

  // Case B: Genuine unlisted work inquiry meeting escalation rules -> LOG HR TICKET
  onEscalate(query, { priority: 'Policy_Gap' });

  let escalationNoticeText = `PolicyBot cannot answer this question based on the available company information. This topic is currently unlisted in our verified company handbook.\n\nAn escalation inquiry ticket has been logged with the **${hrContactBadge}** for review. In accordance with policy accuracy standards, no guessed or unsupported answer is provided. HR typically reviews and responds within 24 to 48 business hours, and their response will appear directly in this chat thread.`;

  if (lang === 'tl') {
    escalationNoticeText = `Hindi masagot ng PolicyBot ang katanungang ito batay sa kasalukuyang impormasyon ng kumpanya. Ang patakarang ito ay kasalukuyang hindi nakalista sa ating verified handbook.\n\nAng iyong katanungan ay awtomatikong naitala at na-escalate sa **${hrContactBadge}** para suriin. Hindi nagbibigay ang system ng mga hula o hindi beripikadong sagot. Lalabas ang opisyal na sagot ng HR dito mismo sa iyong chat thread.`;
  } else if (lang === 'es') {
    escalationNoticeText = `PolicyBot no puede responder a esta pregunta con base en la información disponible de la empresa. Esta política actualmente no figura en nuestro manual verificado de la empresa.\n\nSe ha registrado y derivado automáticamente un ticket de consulta al **${hrContactBadge}**. Para garantizar la precisión, no se proporcionan respuestas no verificadas. El equipo de RR.HH. responderá directamente en este hilo de chat.`;
  }

  return {
    text: escalationNoticeText,
    isEscalated: true,
    requiresAssistanceNotice: true,
    assistanceNoticeDetails: {
      title: '⚠️ FURTHER ASSISTANCE NEEDED',
      description: 'PolicyBot cannot answer this question based on the available company information.',
      channels: ['HR Direct Messages', 'My HR Tickets'],
      isEscalatedToTicket: true,
    },
  };
}
