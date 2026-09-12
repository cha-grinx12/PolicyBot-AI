import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Code, Sparkles } from 'lucide-react';

interface SingleFileExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFileExportModal: React.FC<SingleFileExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('/index-standalone.html')
        .then((res) => {
          if (res.ok) return res.text();
          return '';
        })
        .then((text) => {
          if (text) setHtmlContent(text);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const standaloneHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PolicyBot AI - B2B SaaS HR Application</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM CDN -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Babel Standalone CDN -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    // ==========================================
    // 1. APPLICATION STATE & DATABASE SCHEMA
    // ==========================================
    const INITIAL_COMPANIES = [
      { id: "acme", name: "Acme Corp", domain: "acmecorp.com", joinCode: "ACME-2026" }
    ];

    const INITIAL_USERS = [
      { id: "u1", companyId: "acme", name: "Claire Admin", email: "claire.admin@acmecorp.com", role: "HR_Admin", accountType: "Company_Account", status: "Active" },
      { id: "u2", companyId: "acme", name: "Alex Test", email: "alex.test@gmail.com", role: "Employee", accountType: "Personal_Account", status: "Pending_Approval" },
      { id: "u3", companyId: "acme", name: "James Wilson", email: "james.wilson@acmecorp.com", role: "Employee", accountType: "Company_Account", status: "Active" }
    ];

    const INITIAL_POLICIES = [
      { id: "p1", companyId: "acme", title: "2026_PTO_Policy.pdf", content: "Employees receive 15 days of paid time off (PTO) per calendar year, plus 5 days of bereavement leave." },
      { id: "p2", companyId: "acme", title: "Remote_Work_Guide.pdf", content: "Acme Corp provides a $50/month internet reimbursement and a $300 home office equipment stipend." }
    ];

    const INITIAL_FLOOR_ZONES = [
      { id: "f1", companyId: "acme", name: "Zone 2B - HR Helpdesk", capacity: "4 desks", category: "HR Desk", description: "In-person HR support, onboarding badge collection, and confidential benefits consultations. Floor 2 East Wing." },
      { id: "f2", companyId: "acme", name: "Executive Boardroom", capacity: "12 people", category: "Meeting Room", description: "High-definition telepresence display, acoustic soundproofing, and dual 4K monitors. Floor 2 West Wing." },
      { id: "f3", companyId: "acme", name: "Acme Central Cafeteria", capacity: "80 seats", category: "Common Area", description: "Floor 1 South Atrium. Hot meals, espresso bar, and casual collaborative seating." }
    ];

    const INITIAL_ESCALATION_LOGS = [
      { id: "e1", companyId: "acme", userEmail: "james.wilson@acmecorp.com", question: "Can we get paid in Bitcoin?", status: "Pending", hrResponse: "", respondedBy: "", respondedAt: "" },
      { id: "e2", companyId: "acme", userEmail: "alex.test@gmail.com", question: "Do we offer pet insurance coverage?", status: "Resolved", hrResponse: "Hi Alex! We offer 15% group rates via Nationwide. Check portal for links.", respondedBy: "Claire Admin", respondedAt: "2026-09-07" }
    ];

    function App() {
      const [companies] = useState(INITIAL_COMPANIES);
      const [users, setUsers] = useState(INITIAL_USERS);
      const [policies, setPolicies] = useState(INITIAL_POLICIES);
      const [floorZones, setFloorZones] = useState(INITIAL_FLOOR_ZONES);
      const [escalationLogs, setEscalationLogs] = useState(INITIAL_ESCALATION_LOGS);

      const [currentUser, setCurrentUser] = useState(null);
      const [activeTab, setActiveTab] = useState("overview"); // HR: overview, knowledge, floormap, escalations, approvals. Emp: chat, floormap, direct_msgs
      const [selectedZoneId, setSelectedZoneId] = useState(null);
      const [highlightedZoneId, setHighlightedZoneId] = useState(null);

      // Floor Map navigation handler passed to EmployeeChat and triggers
      const onNavigateToFloorMap = (targetZoneId) => {
        setActiveTab("floormap");
        setSelectedZoneId(targetZoneId || "f1");
        setHighlightedZoneId(targetZoneId || "f1");
      };

      const onClearSelection = () => {
        setSelectedZoneId(null);
        setHighlightedZoneId(null);
      };

      // Login form states
      const [hrEmail, setHrEmail] = useState("claire.admin@acmecorp.com");
      const [hrPass, setHrPass] = useState("password123");
      const [empMode, setEmpMode] = useState("work");
      const [workEmail, setWorkEmail] = useState("james.wilson@acmecorp.com");
      const [personalEmail, setPersonalEmail] = useState("alex.test@gmail.com");
      const [personalName, setPersonalName] = useState("Alex Test");
      const [joinCode, setJoinCode] = useState("ACME-2026");
      const [otpInput, setOtpInput] = useState("");

      // Chat state
      const [chatMessages, setChatMessages] = useState([
        { id: "1", sender: "bot", text: "Hello! I am PolicyBot AI for Acme Corp. Ask me about PTO, remote work equipment, or office directions." }
      ]);
      const [chatInput, setChatInput] = useState("");

      // Inline escalation reply
      const [replyLogId, setReplyLogId] = useState(null);
      const [replyText, setReplyText] = useState("");

      // Handle HR Login
      const handleLoginHR = (e) => {
        if (e) e.preventDefault();
        let admin = users.find(u => u.email.toLowerCase() === hrEmail.trim().toLowerCase());
        if (!admin) {
          admin = { id: "u-admin", companyId: "acme", name: "Claire Admin", email: hrEmail, role: "HR_Admin", accountType: "Company_Account", status: "Active" };
          setUsers(prev => [...prev, admin]);
        }
        setCurrentUser(admin);
        setActiveTab("overview");
      };

      // Handle Employee Login: Work Email (Auto domain match)
      const handleLoginWorkEmail = (e) => {
        if (e) e.preventDefault();
        if (otpInput.trim() === "123456") {
          handleOtpBypass(workEmail);
          return;
        }
        let user = users.find(u => u.email.toLowerCase() === workEmail.trim().toLowerCase());
        if (!user) {
          user = {
            id: "u-" + Date.now(),
            companyId: "acme",
            name: workEmail.split("@")[0].replace(".", " "),
            email: workEmail.trim(),
            role: "Employee",
            accountType: "Company_Account",
            status: "Active"
          };
          setUsers(prev => [...prev, user]);
        }
        setCurrentUser(user);
        setActiveTab("chat");
      };

      // Handle Employee Login: Personal Email + Join Code
      const handleLoginPersonalEmail = (e) => {
        if (e) e.preventDefault();
        if (otpInput.trim() === "123456") {
          handleOtpBypass(personalEmail);
          return;
        }
        let user = users.find(u => u.email.toLowerCase() === personalEmail.trim().toLowerCase());
        if (!user) {
          user = {
            id: "u-" + Date.now(),
            companyId: "acme",
            name: personalName.trim() || "New Employee",
            email: personalEmail.trim(),
            role: "Employee",
            accountType: "Personal_Account",
            status: "Pending_Approval"
          };
          setUsers(prev => [...prev, user]);
        }
        setCurrentUser(user);
        if (user.status === "Active") setActiveTab("chat");
      };

      // Universal OTP Bypass: "123456"
      const handleOtpBypass = (targetEmail) => {
        const email = targetEmail || (currentUser ? currentUser.email : personalEmail);
        setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, status: "Active" } : u));
        if (currentUser) {
          setCurrentUser(prev => ({ ...prev, status: "Active" }));
          setActiveTab("chat");
        } else {
          let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user) {
            user = { id: "u-" + Date.now(), companyId: "acme", name: email.split("@")[0], email, role: "Employee", accountType: "Personal_Account", status: "Active" };
            setUsers(prev => [...prev, user]);
          } else {
            user = { ...user, status: "Active" };
          }
          setCurrentUser(user);
          setActiveTab("chat");
        }
      };

      // HR Approves User
      const handleApproveUser = (userId) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "Active" } : u));
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => ({ ...prev, status: "Active" }));
        }
      };

      // HR Reply & Resolve Escalation
      const handleSaveReply = (logId) => {
        if (!replyText.trim()) return;
        const resolvedText = replyText.trim();
        const targetLog = escalationLogs.find(l => l.id === logId);

        setEscalationLogs(prev => prev.map(l => l.id === logId ? {
          ...l,
          status: "Resolved",
          hrResponse: resolvedText,
          respondedBy: "Claire Admin",
          respondedAt: "2026-09-07"
        } : l));

        // Inject the highlighted HR Direct Message card into chat feed as well
        setChatMessages(prev => [
          ...prev,
          {
            id: "hr-dm-" + Date.now(),
            sender: "hr_admin",
            text: resolvedText,
            isDirectMessage: true,
            respondedBy: "Claire Admin",
            origQuestion: targetLog ? targetLog.question : ""
          }
        ]);

        setReplyLogId(null);
        setReplyText("");
      };

      // Multilingual Language Detection Helper
      const detectChatLang = (text) => {
        const lower = text.toLowerCase();
        if (/[\\u3040-\\u30ff]/.test(text) || /\\b(konnichiwa|arigato|arigatou|ohayo|doko|itsu)\\b/i.test(lower)) return 'ja';
        if (/[\\u4e00-\\u9fa5]/.test(text) || /\\b(nihao|xiexie|shenme|shihou)\\b/i.test(lower)) return 'zh';
        if (/[\\u0900-\\u097f]/.test(text) || /\\b(namaste|dhanyawad|shukriya|kahan|kitna|kab)\\b/i.test(lower)) return 'hi';
        if (/[¿¡]/.test(text) || /\\b(hola|buenos|buenas|cómo|como|estás|estas|gracias|cuándo|cuando|dónde|donde|cuánto|cuanto|quién|quien|qué|que|vacaciones|permiso|salud|seguro|remoto|tarda|responder|ayuda|días|dias)\\b/i.test(lower)) return 'es';
        if (/\\b(kamusta|kumusta|kailan|kelan|saan|nasaan|ano|sino|paano|magkano|bakasyon|salamat|gaano|katagal|araw|oras|tulong|trabaho|sagot|sagutin|mag-reply|puwede|pwede|po|opo|kalusugan|namin|inyo|ako|ko)\\b/i.test(lower)) return 'tl';
        if (/\\b(bonjour|salut|merci|combien|quand|où|ou|comment|congés|conges|vacances|télétravail|teletravail|santé|sante|qui|délai|delai|répondre|repondre|aide)\\b/i.test(lower)) return 'fr';
        if (/\\b(hallo|guten|morgen|tag|danke|wann|wie|lange|dauert|wo|wer|urlaub|homeoffice|krankenversicherung|gesundheit|antwort|hilfe)\\b/i.test(lower)) return 'de';
        return 'en';
      };

      // Rotation ref to guarantee non-repetitive responses across turns
      const botTurnRef = useRef(0);

      // Chat query processor - Strict 5-Tier Intent Hierarchy with Interactive Floor Map & Dynamic Rotation
      const handleSendChat = (queryText) => {
        const q = (queryText || chatInput).trim();
        if (!q) return;

        const userMsg = { id: "u-" + Date.now(), sender: "user", text: q };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput("");

        setTimeout(() => {
          const lower = q.toLowerCase();
          const lang = detectChatLang(q);
          const currentTurn = botTurnRef.current++;

          // Priority keyword detectors for verified policies and locations (Multilingual)
          const hasHRLocation =
            lower.includes("where is") || lower.includes("location") || lower.includes("find") ||
            lower.includes("floor map") || lower.includes("desk") || lower.includes("boardroom") ||
            lower.includes("cafeteria") || lower.includes("hr helpdesk") ||
            lower.includes("saan") || lower.includes("nasaan") || lower.includes("pwesto") ||
            lower.includes("dónde") || lower.includes("donde") || lower.includes("ubicación") ||
            lower.includes("ubicacion") || lower.includes("où") || lower.includes("ou") ||
            lower.includes("wo ist") || lower.includes("kahan") || lower.includes("どこ") || lower.includes("在哪");

          const hasPto =
            lower.includes("pto") || lower.includes("vacation") || lower.includes("paid time off") ||
            lower.includes("leave") || lower.includes("bereavement") || lower.includes("bakasyon") ||
            lower.includes("araw ng bakasyon") || lower.includes("vacaciones") || lower.includes("días") ||
            lower.includes("congés") || lower.includes("urlaub") || lower.includes("chhutti") ||
            lower.includes("有休") || lower.includes("年假") || lower.includes("休假");

          const hasRemote =
            lower.includes("remote") || lower.includes("stipend") || lower.includes("internet") ||
            lower.includes("home office") || lower.includes("equipment") || lower.includes("wfh") ||
            lower.includes("remoto") || lower.includes("teletrabajo") || lower.includes("télétravail") ||
            lower.includes("equipement") || lower.includes("equipamiento") || lower.includes("homeoffice") ||
            lower.includes("bahay") || lower.includes("kagamitan") || lower.includes("リモート") || lower.includes("远程");

          const hasBenefits =
            lower.includes("health") || lower.includes("insurance") || lower.includes("benefits") ||
            lower.includes("dental") || lower.includes("vision") || lower.includes("open enrollment") ||
            lower.includes("kalusugan") || lower.includes("seguro") || lower.includes("salud") ||
            lower.includes("médical") || lower.includes("santé") || lower.includes("assurance") ||
            lower.includes("krankenversicherung") || lower.includes("gesundheit") || lower.includes("bima") ||
            lower.includes("保険") || lower.includes("保险");

          // =========================================================================
          // TIER 1: MULTI-LANGUAGE CAPABILITY & GREETINGS (NO ESCALATION)
          // Handle language queries and greetings directly WITHOUT repeating intro pitches!
          // =========================================================================
          const isLangCheck =
            lower.includes('speak') || lower.includes('language') || lower.includes('tagalog') ||
            lower.includes('spanish') || lower.includes('french') || lower.includes('german') ||
            lower.includes('japanese') || lower.includes('chinese') || lower.includes('hindi') ||
            lower.includes('marunong ka') || lower.includes('kaya mo mag') ||
            lower.includes('nakakintindi') || lower.includes('nakakaintindi') || lower.includes('naintindihan') ||
            lower.includes('hablas') || lower.includes('idioma') || lower.includes('español') || lower.includes('espanol') ||
            lower.includes('parles') || lower.includes('français') || lower.includes('francais') ||
            lower.includes('sprichst') || lower.includes('deutsch') ||
            lower.includes('話せる') || lower.includes('会说') || lower.includes('bol sakte');

          if (isLangCheck && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            let reply = "Yes, absolutely! I understand and speak English, Tagalog, Spanish, French, German, Japanese, Chinese, and Hindi. Feel free to chat in whatever language you're most comfortable with!";
            if (lang === 'tl' || lower.includes('tagalog')) {
              const tlPool = [
                "Oo naman! Nakakaintindi at nakakapagsalita ako sa Tagalog. Ano ang maipaglilingkod ko sa 'yo ngayon?",
                "Oo, naiintindihan kita! Huwag mag-atubiling magtanong sa Tagalog tungkol sa anumang patakaran o pasilidad ng Acme Corp.",
                "Marunong ako mag-Tagalog! Sabihin mo lang kung ano ang kailangan mong alamin sa Acme Corp."
              ];
              reply = tlPool[currentTurn % tlPool.length];
            } else if (lang === 'es' || lower.includes('español') || lower.includes('espanol') || lower.includes('spanish')) {
              const esPool = [
                "¡Sí, por supuesto! Entiendo y hablo español con total fluidez. ¿En qué te puedo ayudar hoy?",
                "¡Claro que sí! Puedes consultarme en español sobre cualquier política, beneficio o sala de la oficina.",
                "¡Totalmente! Hablo español con gusto. Dime qué información de Acme Corp necesitas."
              ];
              reply = esPool[currentTurn % esPool.length];
            } else if (lang === 'fr' || lower.includes('français') || lower.includes('french')) {
              reply = "Oui, absolument ! Je comprends et réponds couramment en français. Comment puis-je vous aider aujourd'hui ?";
            } else if (lang === 'de' || lower.includes('deutsch') || lower.includes('german')) {
              reply = "Ja, selbstverständlich! Ich verstehe und antworte fließend auf Deutsch. Wie kann ich Ihnen heute helfen?";
            } else if (lang === 'ja' || lower.includes('日本語') || lower.includes('japanese')) {
              reply = "はい、もちろん日本語に対応しております！社内規定やフロアマップ案内など、何でもお気軽にお尋ねください。";
            } else if (lang === 'zh' || lower.includes('中文') || lower.includes('chinese')) {
              reply = "当然可以！我完全支持中文交流。今天在公司政策或办公导航方面有什么我可以协助您的吗？";
            } else if (lang === 'hi' || lower.includes('हिंदी') || lower.includes('hindi')) {
              reply = "हाँ बिल्कुल! मैं हिंदी में पूरी तरह बातचीत कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?";
            }

            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: reply }]);
            return;
          }

          const isGreeting =
            /\\b(hello|hi|hey|howdy|greetings|good morning|good afternoon|good evening|what's up|whats up|sup|yo)\\b/i.test(lower) ||
            /\\b(kamusta|kumusta|magandang araw|magandang umaga|magandang gabi)\\b/i.test(lower) ||
            /\\b(hola|buenos días|buenos dias|buenas tardes|buenas noches|qué tal|que tal)\\b/i.test(lower) ||
            /\\b(bonjour|salut|bonsoir)\\b/i.test(lower) ||
            /\\b(hallo|guten tag|guten morgen|guten abend)\\b/i.test(lower) ||
            /\\b(namaste|pranam)\\b/i.test(lower) ||
            /こんにちは|おはよう|こんばんは/.test(lower) ||
            /你好|早上好|晚上好/.test(lower);

          const isHowAreYou =
            /\\b(how are you|how're you|how are you doing|how is it going|how's it going|how are things|how do you do)\\b/i.test(lower) ||
            /\\b(kamusta ka|ano balita|ayos ka lang)\\b/i.test(lower) ||
            /\\b(cómo estás|como estas|cómo te va|como te va)\\b/i.test(lower) ||
            /\\b(comment ça va|comment ca va|comment vas-tu)\\b/i.test(lower) ||
            /\\b(wie geht's|wie gehts|wie geht es dir)\\b/i.test(lower) ||
            /\\b(aap kaise hain|kaisa hai)\\b/i.test(lower) ||
            /元気ですか|調子はどう/.test(lower) ||
            /你好吗|最近怎么样/.test(lower);

          if ((isGreeting || isHowAreYou) && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            let greetingReply = "";
            if (lang === 'tl') {
              const tlGreetings = [
                "Kamusta! Mabuti naman ako. Ano ang maipaglilingkod ko sa 'yo ngayon?",
                "Magandang araw! Masaya akong makausap ka. Paano kita matutulungan ngayon?",
                "Kamusta ka! Handa akong tumulong sa kahit anong katanungan mo sa Acme Corp."
              ];
              greetingReply = tlGreetings[currentTurn % tlGreetings.length];
            } else if (lang === 'es') {
              const esGreetings = [
                "¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué te puedo colaborar hoy?",
                "¡Buenas! Un gusto saludarte. ¿Qué consulta de Acme Corp tienes hoy?",
                "¡Hola! Todo en orden por aquí. ¿Qué te gustaría revisar hoy?"
              ];
              greetingReply = esGreetings[currentTurn % esGreetings.length];
            } else if (lang === 'fr') {
              greetingReply = "Bonjour ! Tout va très bien, merci. Que puis-je faire pour vous aujourd'hui ?";
            } else if (lang === 'de') {
              greetingReply = "Hallo! Mir geht es blendend, vielen Dank. Wie kann ich Ihnen heute behilflich sein?";
            } else if (lang === 'ja') {
              greetingReply = "こんにちは！元気にしております、ありがとうございます。本日はどのようなご用件でしょうか？";
            } else if (lang === 'zh') {
              greetingReply = "您好！我一切都好，谢谢关心。今天有什么我可以为您效劳的吗？";
            } else if (lang === 'hi') {
              greetingReply = "नमस्ते! मैं बहुत अच्छा हूँ, धन्यवाद। आज मैं आपकी क्या सहायता कर सकता हूँ?";
            } else {
              const enGreetings = [
                "Hello! Great to hear from you. What would you like to explore today?",
                "Hi there! I'm doing well, thank you. How can I assist you today?",
                "Hey! Ready whenever you are. What can I look up for you?",
                "Good day! Hope things are going smoothly. Let me know what you need."
              ];
              greetingReply = enGreetings[currentTurn % enGreetings.length];
            }

            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: greetingReply }]);
            return;
          }

          // =========================================================================
          // TIER 2: CASUAL CONVERSATION, EXCLAMATIONS & FOLLOW-UPS (NO ESCALATION)
          // Dynamic responses, follow-up acknowledgments, off-topic, jokes, math, poems.
          // Never repeats generic intro pitches!
          // =========================================================================

          // 1. Short Follow-ups & Acknowledgments ("ok", "got it", "noted", "sige", etc.)
          const isAcknowledgment =
            /^(ok|okay|k|got it|noted|alright|sure|cool thanks|sige|ayos|sige po|vale|entendido|d'accord|compris|alles klar|verstanden|了解|好的|明白)[\\.\\!\\s]*$/i.test(q) ||
            /\\b(got it|noted|understood|sounds good|all good|naintindihan ko|salamat po)\\b/i.test(lower);

          if (isAcknowledgment && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            let ackReply = "";
            if (lang === 'tl') {
              const tlAcks = [
                "Ayos! Sabihin mo lang kung may iba ka pang katanungan.",
                "Sige po! Narito lang ako palagi kung may kailangan ka pa.",
                "Naintindihan ko! Huwag mag-atubiling magtanong kung may bago kang gustong malaman."
              ];
              ackReply = tlAcks[currentTurn % tlAcks.length];
            } else if (lang === 'es') {
              const esAcks = [
                "¡Entendido! Avísame cuando tengas otra consulta.",
                "¡Perfecto! Aquí estaré si necesitas algo más sobre Acme Corp.",
                "¡De acuerdo! Consulta cuando quieras."
              ];
              ackReply = esAcks[currentTurn % esAcks.length];
            } else if (lang === 'fr') {
              ackReply = "C'est noté ! N'hésitez pas si vous avez une autre question.";
            } else if (lang === 'de') {
              ackReply = "Verstanden! Geben Sie einfach Bescheid, wenn Sie noch etwas wissen möchten.";
            } else if (lang === 'ja') {
              ackReply = "了解いたしました！他にご質問がございましたら、いつでもお声がけください。";
            } else if (lang === 'zh') {
              ackReply = "明白！如果您还有其他疑问，随时告诉我。";
            } else if (lang === 'hi') {
              ackReply = "समझ गया! जब भी आपको किसी अन्य चीज़ की आवश्यकता हो, बेझिझक पूछें।";
            } else {
              const enAcks = [
                "Got it! Let me know whenever you're ready for another topic.",
                "Sounds good! I'm right here if anything else comes up.",
                "Understood! Feel free to ask about any other workplace policy or space.",
                "Noted! Have a productive day, and let me know if you need anything else."
              ];
              ackReply = enAcks[currentTurn % enAcks.length];
            }
            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: ackReply }]);
            return;
          }

          // 2. Follow-up Topic Explorers ("what else", "tell me more", "anything else", "ano pa")
          const isFollowUpTopic =
            /\\b(what else|tell me more|anything else|what next|how about now|what more|ano pa|may iba pa ba|anong iba pa|qué más|que mas|algo más|algo mas|quoi d'autre|was noch|もっと教えて|还有什么)\\b/i.test(lower) ||
            lower === 'more' || lower === 'next';

          if (isFollowUpTopic && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            let exploreReply = "";
            if (lang === 'tl') {
              const tlExplores = [
                "Maaari mong alamin ang tungkol sa aming $50/buwan na internet reimbursement, $300 home office equipment stipend, o tingnan ang cafeteria sa Level 1!",
                "Pwede mo ring itanong ang tungkol sa carryover ng PTO (hanggang 3 araw), open enrollment sa Nobyembre, o lokasyon ng HR helpdesk."
              ];
              exploreReply = tlExplores[currentTurn % tlExplores.length];
            } else if (lang === 'es') {
              const esExplores = [
                "También puedes consultar sobre el reembolso de internet ($50/mes), el estipendio de equipamiento ($300), o ver la cafetería en el mapa.",
                "Tenemos detalles de PTO acumulables (hasta 3 días), período de inscripción médica en noviembre y salas ejecutivas."
              ];
              exploreReply = esExplores[currentTurn % esExplores.length];
            } else if (lang === 'fr') {
              exploreReply = "Vous pouvez également vous renseigner sur l'indemnité télétravail (50 $/mois) ou la prime d'équipement de 300 $.";
            } else if (lang === 'de') {
              exploreReply = "Sie können sich auch über den Internet-Zuschuss (50 $/Monat), die Pauschale für Heimbüro (300 $) oder den Grundriss informieren.";
            } else if (lang === 'ja') {
              exploreReply = "月額50ドルのネット補助や300ドルの在宅備品手当、または1階カフェテリアの場所などもご案内できます！";
            } else if (lang === 'zh') {
              exploreReply = "您还可以了解每月 50 美元的网络补贴、300 美元的办公设备津贴，或在楼层地图中查看餐厅位置！";
            } else if (lang === 'hi') {
              exploreReply = "आप $50/माह इंटरनेट प्रतिपूर्ति, $300 होम ऑफिस उपकरण वजीफा या कैफेटेरिया के स्थान के बारे में भी पूछ सकते हैं!";
            } else {
              const enExplores = [
                "We have verified guidelines on PTO (15 days + rollover), the $50/mo internet stipend + $300 equipment grant, health open enrollment (Nov 1–30), and Level 2 meeting rooms. What interests you?",
                "You can also check the Executive Boardroom or the Level 1 Cafeteria on the floor map, or ask about reimbursement processing times. Which would you like to see?",
                "Beyond standard PTO, we can check equipment allowances, health benefits coverage, or navigate to any desk on the floor map."
              ];
              exploreReply = enExplores[currentTurn % enExplores.length];
            }
            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: exploreReply }]);
            return;
          }

          // 3. Exclamations / Praise ("wow", "cool", "nice", "awesome", "astig", "galing")
          const isExclamation =
            /\\b(cool|wow|nice|awesome|amazing|great|super|neat|solid|sweet|love it|wonderful)\\b/i.test(lower) ||
            /\\b(galing|astig|ayos|ang lupet|bongga)\\b/i.test(lower) ||
            /\\b(genial|excelente|estupendo|maravilloso|guay|chévere|bacano)\\b/i.test(lower) ||
            /\\b(super|chouette|génial|formidable|magnifique)\\b/i.test(lower) ||
            /\\b(toll|klasse|prima|wunderbar|großartig)\\b/i.test(lower) ||
            /(すごい|素晴らしい|いいね)/.test(lower) ||
            /(太棒了|好极了|厉害|酷)/.test(lower) ||
            /(बढ़िया|शानदार|बहुत अच्छा)/.test(lower);

          if (isExclamation && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            let exclReply = "";
            if (lang === 'tl') {
              const tlExcl = [
                "Astig 'di ba! 😊 Sabihin mo lang kung may iba ka pang kailangang alamin.",
                "Salamat! Masaya akong makatulong sa 'yo ngayon.",
                "Ayos! Narito lang ako kung may susunod kang tanong."
              ];
              exclReply = tlExcl[currentTurn % tlExcl.length];
            } else if (lang === 'es') {
              const esExcl = [
                "¡Me alegro de que te sirva! 😊 Avísame si necesitas algo más.",
                "¡Genial! Siempre es un placer hacer las cosas más sencillas.",
                "¡Excelente! Aquí estaré para lo que necesites."
              ];
              exclReply = esExcl[currentTurn % esExcl.length];
            } else if (lang === 'fr') {
              exclReply = "Ravi de l'entendre ! 😊 N'hésitez pas si vous avez d'autres questions.";
            } else if (lang === 'de') {
              exclReply = "Das freut mich sehr! 😊 Lassen Sie mich wissen, wenn Sie weitere Fragen haben.";
            } else if (lang === 'ja') {
              exclReply = "お役に立てて光栄です！😊 他にも気になる点がございましたらどうぞ。";
            } else if (lang === 'zh') {
              exclReply = "太好了，很高兴对您有帮助！😊 如有其他需要请随时告诉我。";
            } else if (lang === 'hi') {
              exclReply = "यह सुनकर बहुत अच्छा लगा! 😊 यदि आपको कुछ और चाहिए तो अवश्य बताएं।";
            } else {
              const enExcl = [
                "Glad you liked that! 😊 Let me know if you need anything else.",
                "Awesome! Always happy to make things clear and straightforward.",
                "Right on! I'm here whenever you want to check another policy or room."
              ];
              exclReply = enExcl[currentTurn % enExcl.length];
            }
            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: exclReply }]);
            return;
          }

          // 4. Emotional / Well-being / Workload ("so tired", "pagod", "exhausted", "need coffee")
          const isEmotionalOrTired =
            /\\b(tired|exhausted|sleepy|busy|stressed|overwhelmed|long day|hard day|drained|need coffee)\\b/i.test(lower) ||
            /\\b(pagod|antok|inaantok|tambak ang trabaho|sobrang busy|hapo|kapagod)\\b/i.test(lower) ||
            /\\b(cansado|agotado|estresado|mucho trabajo|día largo|dia largo|necesito café)\\b/i.test(lower) ||
            /\\b(fatigué|epuisé|stressé|débordé|besoin de café|longue journée)\\b/i.test(lower) ||
            /\\b(müde|erschöpft|gestresst|viel zu tun|langer tag|brauche kaffee)\\b/i.test(lower) ||
            /(疲れた|忙しい|眠い|ストレス|コーヒー飲みたい)/.test(lower) ||
            /(累了|好累|太忙|压力大|想喝咖啡)/.test(lower) ||
            /(थक गया|बहुत काम है|तनाव|कॉफी चाहिए)/.test(lower);

          if (isEmotionalOrTired && !hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            const empatheticMap = {
              en: "Take a deep breath and hang in there! ☕ Don't forget to take a quick breather or grab a warm coffee. The Acme Central Cafeteria on Floor 1 is open right now if you need a refreshing break. Let me know if I can take anything off your plate!",
              tl: "Huminga nang malalim at kapit lang! ☕ Huwag kalimutang magpahinga sandali o kumuha ng mainit na kape. Bukas ang Acme Central Cafeteria sa Floor 1 kung kailangan mo ng break. Sabihin mo lang kung may maitutulong ako para mapadali ang araw mo!",
              es: "¡Tómate un respiro y ánimo! ☕ Recuerda tomar un breve descanso o un buen café. La Cafetería Central en el Piso 1 está abierta si necesitas desconectar un momento. ¡Aquí estoy si puedo facilitarte algo del trabajo!",
              fr: "Prenez une grande respiration et bon courage ! ☕ N'hésitez pas à faire une courte pause et savourer un café. La cafétéria centrale au 1er étage est ouverte si vous avez besoin de recharger vos batteries.",
              de: "Tief durchatmen, Sie schaffen das! ☕ Gönnen Sie sich eine kurze Pause oder einen heißen Kaffee. Die Acme Cafeteria auf Ebene 1 ist geöffnet, falls Sie frische Energie tanken möchten.",
              ja: "深呼吸して、無理をなさらないでくださいね！☕ ぜひ短い休憩をとって、温かいコーヒーでもいかがですか？1階のカフェテリアも営業中です。",
              zh: "深呼吸，放轻松！☕ 别忘了适当休息一下，喝杯热咖啡提提神。1楼的Acme中央餐厅正在营业，欢迎随时去小憩一下。",
              hi: "गहरी सांस लें और अपना ख्याल रखें! ☕ एक छोटा ब्रेक लें और एक कप गर्म कॉफी पिएं। मंजिल 1 पर कैफेटेरिया अभी खुला है।"
            };
            setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: empatheticMap[lang] || empatheticMap.en }]);
            return;
          }

          // 5. Casual math, jokes, poems
          const isJoke =
            /\\b(joke|jokes|tell me a joke|make me laugh|something funny|funny joke)\\b/i.test(lower) ||
            /\\b(biro|magbiro|magpatawa|nakakatawa)\\b/i.test(lower) ||
            /\\b(chiste|broma|cuéntame un chiste|hazme reír)\\b/i.test(lower) ||
            /\\b(blague|raconte une blague)\\b/i.test(lower) ||
            /\\b(witz|erzähl einen witz)\\b/i.test(lower) ||
            /(ジョーク|冗談)/.test(lower) ||
            /(笑话|讲个笑话)/.test(lower) ||
            /(चुटकुला)/.test(lower);

          const isMath =
            /\\b(2\\s*\\+\\s*2|what is 2\\+2|what's 2\\+2|calculate|math)\\b/i.test(lower) ||
            /^\\s*\\d+\\s*[\\+\\-\\*\\/]\\s*\\d+\\s*\\??$/i.test(lower);

          const isPoem =
            /\\b(poem|write a poem|write a short poem|short poem about work|haiku|rhyme|tula|poema|poème|gedicht|kavita)\\b/i.test(lower) ||
            /詩|俳句|诗/.test(lower);

          if (!hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            if (isJoke) {
              const jokeReplies = {
                en: "Here's a quick workplace joke for you: Why did the computer apply for a job? Because it wanted to get a better byte! 💻",
                tl: "Narito ang isang mabilis na biro sa opisina: Bakit nag-apply ng trabaho ang computer? Kasi gusto raw nitong magkaroon ng mas maraming 'byte'! 💻",
                es: "Aquí tienes un chiste laboral: ¿Por qué la computadora solicitó un empleo? ¡Porque quería tener un mejor byte! 💻",
                fr: "Voici une petite blague de bureau : Pourquoi l'ordinateur a-t-il postulé ? Parce qu'il voulait avoir un meilleur octet ! 💻",
                de: "Hier ist ein kleiner Büro-Witz: Warum hat sich der Computer beworben? Weil er mehr Bytes wollte! 💻",
                ja: "職場のジョークをどうぞ：コンピュータが就職活動をしたのはなぜでしょう？より良い「バイト（Byte）」が欲しかったからです！💻",
                zh: "给您讲个职场小笑话：电脑为什么要找工作？因为它想要更多的“字节（Byte）”！💻",
                hi: "यहाँ एक कार्यस्थल चुटकुला है: कंप्यूटर ने नौकरी के लिए आवेदन क्यों किया? क्योंकि उसे और अधिक 'बाइट्स' चाहिए थे! 💻"
              };
              setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: jokeReplies[lang] || jokeReplies.en }]);
              return;
            }

            if (isMath) {
              setChatMessages(prev => [...prev, {
                id: "b-" + Date.now(),
                sender: "bot",
                text: "2 + 2 = 4! 🧮 Let me know if you need to calculate PTO days or check policy numbers!"
              }]);
              return;
            }

            if (isPoem) {
              setChatMessages(prev => [...prev, {
                id: "b-" + Date.now(),
                sender: "bot",
                text: "Lines of code and coffee steam,\\nCollaboration powers the team.\\nFrom morning syncs to goals achieved,\\nGreat things happen when believed! ✨\\n\\nHow can I help you with company policies or benefits today?"
              }]);
              return;
            }
          }

          // =========================================================================
          // TIER 3: PROCESS & TURNAROUND TIME QUERIES (NO ESCALATION)
          // Behavior: Explains 24-48 hour window clearly. DO NOT escalate.
          // =========================================================================
          const isThanks =
            /\\b(thanks|thank you|thx|appreciate it|awesome thanks|thank you so much)\\b/i.test(lower) ||
            /\\b(salamat|maraming salamat|maraming salamat po)\\b/i.test(lower) ||
            /\\b(gracias|muchas gracias|mil gracias)\\b/i.test(lower) ||
            /\\b(merci|merci beaucoup)\\b/i.test(lower) ||
            /\\b(danke|vielen dank|dankeschön)\\b/i.test(lower) ||
            /(ありがとう|感謝)/.test(lower) ||
            /(谢谢|多谢|非常感谢)/.test(lower) ||
            /(धन्यवाद|शुक्रिया)/.test(lower);

          const isTurnaround =
            lower.includes('until when') ||
            lower.includes('how long') ||
            lower.includes('when will') ||
            lower.includes('response time') ||
            lower.includes('turnaround') ||
            lower.includes('wait') ||
            /\\b(wait|sla|status|follow up|follow-up)\\b/i.test(lower) ||
            lower.includes('kailan') ||
            lower.includes('kelan') ||
            lower.includes('gaano katagal') ||
            lower.includes('mag-reply') ||
            lower.includes('magrereply') ||
            lower.includes('sagot') ||
            lower.includes('cuándo responden') ||
            lower.includes('cuando responden') ||
            lower.includes('cuánto tarda') ||
            lower.includes('cuanto tarda') ||
            lower.includes('tiempo de espera') ||
            lower.includes('tiempo de respuesta') ||
            lower.includes('combien de temps') ||
            lower.includes('délai') ||
            lower.includes('delai') ||
            lower.includes('wie lange') ||
            lower.includes('wann antwortet') ||
            lower.includes('bearbeitungszeit') ||
            lower.includes('いつ回答') ||
            lower.includes('返答時間') ||
            lower.includes('多久') ||
            lower.includes('什么时候回复') ||
            lower.includes('kab tak');

          if (!hasHRLocation && !hasPto && !hasRemote && !hasBenefits) {
            if (isThanks) {
              const thanksMap = {
                en: "You're very welcome! Feel free to ask whenever you need information about Acme Corp policies, equipment stipends, or floor maps.",
                tl: "Walang anuman! Masaya akong makatulong. Sabihin mo lang kung kailangan mo pa ng impormasyon sa mga patakaran ng Acme Corp o floor map.",
                es: "¡De nada! Es un placer ayudarte. No dudes en consultar cuando necesites información sobre políticas de Acme Corp o planos de la oficina.",
                fr: "Avec grand plaisir ! Je reste à votre disposition pour toute information sur les politiques d'Acme Corp ou les plans de bureau.",
                de: "Sehr gerne! Ich bin jederzeit für Sie da, wenn Sie Informationen zu Richtlinien oder Raumplänen benötigen.",
                ja: "どういたしまして！社内規定や備品手当、フロアマップについてご不明な点がございましたらどうぞ。",
                zh: "不客气！随时乐意为您效劳。如有政策、津贴或办公室地图疑问，欢迎随时提问。",
                hi: "आपका बहुत-बहुत स्वागत है! मैं हमेशा आपकी सहायता के लिए उपस्थित हूँ।"
              };
              setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: thanksMap[lang] || thanksMap.en }]);
              return;
            }

            if (isTurnaround) {
              const turnaroundMap = {
                en: "HR typically reviews and responds to escalated queries within 24 to 48 business hours. As soon as HR posts a reply, it will appear directly in your chat feed as a highlighted HR Direct Message card.",
                tl: "Karaniwang sinusuri at binabalikan ng HR ang mga tanong sa loob ng 24 hanggang 48 oras ng negosyo. Lalabas ang tugon nila dito mismo sa iyong chat feed bilang isang highlighted na HR Direct Message card.",
                es: "Recursos Humanos suele revisar y responder a las consultas escaladas en un plazo de 24 a 48 horas hábiles. Tan pronto como RRHH responda, aparecerá directamente en tu chat como una tarjeta destacada de Mensaje Directo.",
                fr: "Les RH examinent et répondent généralement aux demandes escaladées dans un délai de 24 à 48 heures ouvrables. Dès que la réponse est publiée, elle apparaîtra directement dans votre fil de discussion sous forme de carte mise en valeur.",
                de: "Die Personalabteilung prüft und beantwortet eskalierte Anfragen in der Regel innerhalb von 24 bis 48 Geschäftsstunden. Sobald eine Antwort vorliegt, erscheint diese direkt in Ihrem Chat-Feed als hervorgehobene Direktnachricht.",
                ja: "人事部（HR）は通常、24〜48営業時間以内にエスカレーションされたご質問を確認し回答いたします。回答が送信され次第、チャット画面にハイライトされた個別メッセージカードとして即座に表示されます。",
                zh: "HR团队通常会在24至48个工作小时内审核并答复上报的问题。HR一旦回复，将直接作为高亮提示卡片显示在此聊天窗口中。",
                hi: "HR आमतौर पर 24 से 48 व्यावसायिक घंटों के भीतर एस्केलेट किए गए प्रश्नों की समीक्षा और उत्तर देता है। जैसे ही HR उत्तर देगा, यह सीधे आपके चैट में हाइलाइट किए गए संदेश के रूप में दिखाई देगा।"
              };
              setChatMessages(prev => [...prev, { id: "b-" + Date.now(), sender: "bot", text: turnaroundMap[lang] || turnaroundMap.en }]);
              return;
            }
          }

          // =========================================================================
          // TIER 4: VERIFIED POLICIES & FLOOR MAP (Grounded in Verified HR Data)
          // Behavior: Inline citation badge or floor map highlight in user's language. DO NOT escalate.
          // =========================================================================
          if (hasPto) {
            const ptoReplies = {
              en: "Acme Corp provides 15 days of paid time off (PTO) per calendar year, along with 5 days of bereavement leave. Up to 3 unused PTO days can roll over to the next year.",
              tl: "Ang Acme Corp ay nagkakaloob ng 15 araw ng paid time off (PTO) bawat taon ng kalendaryo, kasama ang 5 araw ng bereavement leave. Hanggang 3 hindi nagamit na araw ng PTO ay maaaring mai-roll over sa susunod na taon.",
              es: "Acme Corp otorga 15 días de tiempo libre pagado (PTO) por año calendario, además de 5 días de permiso por duelo. Se pueden acumular hasta 3 días no utilizados para el año siguiente.",
              fr: "Acme Corp accorde 15 jours de congés payés (PTO) par année civile, ainsi que 5 jours de congé de deuil. Jusqu'à 3 jours non pris peuvent être reportés sur l'année suivante.",
              de: "Acme Corp gewährt 15 bezahlte Urlaubstage (PTO) pro Kalenderjahr sowie 5 Tage Sonderurlaub im Trauerfall. Bis zu 3 ungenutzte Tage können ins Folgejahr übertragen werden.",
              ja: "Acme Corpでは、年次有給休暇（PTO）として年間15日付与され、5日間の慶弔休暇があります。未使用の有給休暇は最大3日まで翌年に繰り越せます。",
              zh: "Acme Corp 每年提供 15 天带薪休假（PTO），另附 5 天丧假。最多可结转 3 天未使用的带薪假至下一年。",
              hi: "Acme Corp प्रति कैलेंडर वर्ष 15 दिन का सवेतन अवकाश (PTO) और 5 दिन का शोक अवकाश प्रदान करता है। 3 अप्रयुक्त दिन अगले वर्ष के लिए आगे बढ़ाए जा सकते हैं।"
            };
            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: ptoReplies[lang] || ptoReplies.en,
              citation: "2026_PTO_Policy.pdf"
            }]);
            return;
          }

          if (hasRemote) {
            const remoteReplies = {
              en: "Under our Remote Work Policy, Acme Corp provides a $50/month internet reimbursement and a one-time $300 home office equipment stipend.",
              tl: "Sa ilalim ng aming Patakaran sa Remote Work, nagbibigay ang Acme Corp ng $50/buwan na bayad sa internet at isang beses na $300 na stipend para sa mga kagamitan sa opisina sa bahay.",
              es: "Según la Política de Trabajo Remoto, Acme Corp proporciona un reembolso de internet de $50/mes y un estipendio único de $300 para equipamiento de oficina en casa.",
              fr: "Selon notre guide du télétravail, Acme Corp propose un remboursement internet de 50 $/mois et une prime unique de 300 $ pour l'équipement du bureau à domicile.",
              de: "Gemäß unserer Home-Office-Richtlinie erstattet Acme Corp 50 $/Monat für Internet sowie eine einmalige Pauschale von 300 $ für die Heimbüro-Ausstattung.",
              ja: "リモートワーク規定に基づき、Acme Corpは月額50ドルのインターネット補助と、1回限りの在宅オフィス設備手当300ドルを支給します。",
              zh: "根据远程办公指南，Acme Corp 每月提供 50 美元的网络费用报销，以及一次性 300 美元的居家办公设备津贴。",
              hi: "रिमोट वर्क गाइड के तहत, Acme Corp $50/माह इंटरनेट प्रतिपूर्ति और $300 होम ऑफिस उपकरण वजीफा प्रदान करता है।"
            };
            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: remoteReplies[lang] || remoteReplies.en,
              citation: "Remote_Work_Guide.pdf"
            }]);
            return;
          }

          if (hasBenefits) {
            const benefitsReplies = {
              en: "Annual open enrollment runs from November 1 to November 30. Medical, dental, and vision coverage details are available in the benefits portal.",
              tl: "Ang taunang open enrollment para sa kalusugan ay bukas mula Nobyembre 1 hanggang Nobyembre 30. Ang mga detalye ng medical, dental, at vision coverage ay makikita sa benefits portal.",
              es: "El período de inscripción abierta anual es del 1 al 30 de noviembre. Los detalles de cobertura médica, dental y de visión están disponibles en el portal de beneficios.",
              fr: "La période d'adhésion annuelle se déroule du 1er au 30 novembre. Les détails concernant l'assurance médicale, dentaire et optique sont consultables sur le portail des avantages.",
              de: "Die jährliche Einschreibung für Krankenversicherungen läuft vom 1. bis 30. November. Vollständige Informationen zu Kranken-, Zahn- und Sehhilfen finden Sie im Mitarbeiterportal.",
              ja: "年次の保険加入手続き期間は11月1日から11月30日までです。医療・歯科・眼科保険の詳細は福利厚生ポータルにて確認いただけます。",
              zh: "年度福利公开选享期为 11 月 1 日至 11 月 30 日。医疗、牙科和眼科保险计划详情可在员工福利门户中查阅。",
              hi: "वार्षिक खुला नामांकन 1 नवंबर से 30 नवंबर तक चलता है। चिकित्सा, दंत और दृष्टि बीमा विवरण पोर्टल में उपलब्ध हैं।"
            };
            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: benefitsReplies[lang] || benefitsReplies.en,
              citation: "Health_Benefits_2026.pdf"
            }]);
            return;
          }

          // Interactive Floor Map queries
          if (hasHRLocation) {
            let locReply = "The HR Helpdesk is located at Zone 2B (East Wing) on Floor 2. It has 4 desks and operates from 9:00 AM to 5:00 PM for badge pickups, paperwork, and confidential consultations.";
            let trigger = { zoneId: "f1", zoneName: "Zone 2B - HR Helpdesk", actionLabel: "📍 Highlight on Floor Map" };

            if (lang === 'tl') locReply = "Ang HR Helpdesk ay matatagpuan sa Zone 2B (East Wing) sa Floor 2. Bukas ito mula 9:00 AM hanggang 5:00 PM para sa pagkuha ng badge at konsultasyon.";
            else if (lang === 'es') locReply = "El mostrador de RRHH se encuentra en la Zona 2B (Ala Este) del Piso 2. Opera de 9:00 AM a 5:00 PM para credenciales y consultas.";
            else if (lang === 'fr') locReply = "Le bureau des RH se trouve dans la Zone 2B (Aile Est) au 2ème étage. Il est ouvert de 9h00 à 17h00.";
            else if (lang === 'de') locReply = "Der HR-Helpdesk befindet sich in Zone 2B (Ostflügel) auf Etage 2. Geöffnet von 9:00 bis 17:00 Uhr.";
            else if (lang === 'ja') locReply = "人事ヘルプデスクは2階のゾーン2B（東ウイング）にあります。バッジの受取や相談のため9:00〜17:00まで営業しています。";
            else if (lang === 'zh') locReply = "HR 服务台位于 2 楼 2B 区域（东翼），服务时间为上午 9:00 至下午 5:00。";
            else if (lang === 'hi') locReply = "HR हेल्पडेस्क फ्लोर 2 पर जोन 2B (ईस्ट विंग) में स्थित है।";

            if (lower.includes("boardroom") || lower.includes("meeting room") || lower.includes("sala de reuniones") || lower.includes("konferenz") || lower.includes("役員") || lower.includes("会议室")) {
              locReply = "The Executive Boardroom is situated on Floor 2 (West Wing), featuring a 12-person conference table, acoustic soundproofing, and dual 4K screens.";
              trigger = { zoneId: "f2", zoneName: "Executive Boardroom", actionLabel: "📍 Highlight on Floor Map" };
            } else if (lower.includes("cafeteria") || lower.includes("canteen") || lower.includes("kainan") || lower.includes("lunch") || lower.includes("cafetería") || lower.includes("cantine") || lower.includes("カフェテリア") || lower.includes("餐厅")) {
              locReply = "The Acme Central Cafeteria is located on Floor 1 (South Atrium), open daily with lunch service from 11:30 AM to 2:00 PM.";
              trigger = { zoneId: "f3", zoneName: "Acme Central Cafeteria", actionLabel: "📍 Highlight on Floor Map" };
            }

            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: locReply,
              floorMapTrigger: trigger
            }]);
            return;
          }

          // Dynamic Custom Policy Matching with Stop-word Filtering
          const STOP_WORDS = new Set([
            "what", "where", "from", "with", "that", "have", "this", "would", "could", "about",
            "when", "will", "does", "take", "your", "help", "please", "know", "tell", "much",
            "many", "some", "time", "days", "work", "acme", "corp", "there", "their", "they",
            "them", "then", "than", "into", "just", "more", "also", "been", "were", "which",
            "each", "make", "like", "need", "want", "look", "find", "give", "good", "policy", "policies",
            "saan", "ano", "paano", "kailan", "namin", "inyo", "tulong", "donde", "cuando", "como"
          ]);

          const meaningfulWords = lower
            .replace(/[^a-z0-9\\s]/g, " ")
            .split(/\\s+/)
            .filter(w => w.length > 3 && !STOP_WORDS.has(w));

          let customMatched = null;
          if (meaningfulWords.length > 0) {
            customMatched = policies.find(p => {
              const t = p.title.toLowerCase();
              const c = p.content.toLowerCase();
              return meaningfulWords.some(w => t.includes(w) || c.includes(w));
            });
          }

          if (customMatched) {
            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: \`According to \${customMatched.title}: \${customMatched.content.slice(0, 200)}...\`,
              citation: customMatched.title
            }]);
            return;
          }

          // =========================================================================
          // TIER 5: EXPLICIT MISSING POLICY REQUESTS ONLY (TRIGGER ESCALATION)
          // ONLY escalate if the query contains explicit unlisted policy keywords AND
          // was not found in the indexed policies above.
          // =========================================================================
          const isExplicitPolicySeeking =
            /\\b(policy|policies|stipend|reimbursement|insurance|allowance|benefit|benefits|401k|401\\(k\\)|paternity|maternity|parental leave|crypto pay|crypto|bitcoin|pet policy|pet insurance|tuition|claim|coverage|bonus|severance|relocation|gym|wellness stipend|commuter|pension|perk|perks|handbook|fsa|hsa|stock options|equity)\\b/i.test(lower) ||
            /\\b(patakaran|polisiya|benepisyo|reimbursement|stipend|seguro|allowance|paternity|maternity|sahod|pensyon|pautang|bawas)\\b/i.test(lower) ||
            /\\b(política|politica|políticas|politicas|beneficio|beneficios|seguro|estipendio|reembolso|subsidio|jubilación|jubilacion|maternidad|paternidad|cobertura)\\b/i.test(lower) ||
            /\\b(politique|politiques|avantage|avantages|assurance|remboursement|indemnité|indemnite|allocation|retraite|maternité|maternite|paternité|paternite)\\b/i.test(lower) ||
            /\\b(richtlinie|richtlinien|versicherung|zuschuss|erstattung|vorteil|vorteile|rente|altersvorsorge|elternzeit|gehalt)\\b/i.test(lower) ||
            /(規定|方針|手当|保険|補償|福利厚生|退職金|育休|補助|ビットコイン)/.test(lower) ||
            /(政策|规章|津贴|报销|保险|福利|退休金|产假|补贴|比特币)/.test(lower) ||
            /(नीति|नियम|बीमा|भत्ता|प्रतिपूर्ति|पेंशन|अवकाश)/.test(lower);

          if (isExplicitPolicySeeking) {
            const newLog = {
              id: "e-" + Date.now(),
              companyId: "acme",
              userEmail: currentUser?.email || "james.wilson@acmecorp.com",
              question: q,
              status: "Pending",
              hrResponse: "",
              respondedBy: "",
              respondedAt: ""
            };
            setEscalationLogs(prev => [newLog, ...prev]);

            const fallbackReplies = {
              en: "I cannot find an official answer in our current policy manual for this topic. I have logged this question and forwarded it directly to HR at hr@acmecorp.com for review.",
              tl: "Hindi ko mahanap ang opisyal na sagot sa aming kasalukuyang handbook ng polisiya para sa paksang ito. Inirehistro ko na ang tanong na ito at ipinasa diretso sa HR sa hr@acmecorp.com para suriin.",
              es: "No encuentro una respuesta oficial en nuestro manual actual de políticas sobre este tema. He registrado esta consulta y la he reenviado directamente a Recursos Humanos a hr@acmecorp.com para su revisión.",
              fr: "Je ne trouve pas de réponse officielle dans notre manuel de politiques actuel sur ce sujet. J'ai consigné cette question et l'ai transmise directement aux RH à hr@acmecorp.com pour examen.",
              de: "Ich kann in unserem aktuellen Richtlinien-Handbuch keine offizielle Antwort zu diesem Thema finden. Ich habe diese Frage erfasst und direkt an die Personalabteilung unter hr@acmecorp.com zur Prüfung weitergeleitet.",
              ja: "現在の社内規定マニュアルにこのトピックに関する公式な回答が見つかりませんでした。この質問を記録し、確認のため人事部（hr@acmecorp.com）へ直接転送いたしました。",
              zh: "在目前的政策手册中未找到关于此议题的官方说明。我已记录此问题并直接转发至 HR（hr@acmecorp.com）进行核实。",
              hi: "मुझे इस विषय पर हमारे वर्तमान नीति नियमावली में आधिकारिक उत्तर नहीं मिला। मैंने इस प्रश्न को दर्ज कर समीक्षा के लिए सीधे HR (hr@acmecorp.com) को भेज दिया है।"
            };

            setChatMessages(prev => [...prev, {
              id: "b-" + Date.now(),
              sender: "bot",
              text: fallbackReplies[lang] || fallbackReplies.en,
              isEscalated: true
            }]);
            return;
          }

          // =========================================================================
          // DYNAMIC CONVERSATIONAL FALLBACK (Polite, helpful AI coworker - NO ESCALATION)
          // Dynamic pool rotating so 2 consecutive fallback replies are NEVER the same!
          // Does NOT repeat the boilerplate intro pitch!
          // =========================================================================
          let fallbackText = "";
          if (lang === 'tl') {
            const tlFallbacks = [
              "Interesanteng paksa 'yan! Sabihin mo lang kung may partikular kang gustong malaman tungkol sa PTO, kagamitan sa trabaho, o floor map.",
              "Nakuha ko! Handa akong tumulong kung may gusto kang i-check sa handbook ng Acme Corp o maghanap ng mesa sa opisina.",
              "Salamat sa pagbabahagi! Narito lang ako kung may katanungan ka tungkol sa mga benepisyo, allowance, o mga kwarto sa Level 2.",
              "Ayos! Huwag mag-atubiling magtanong kung may kailangan kang hanapin sa aming mga opisyal na patakaran."
            ];
            fallbackText = tlFallbacks[currentTurn % tlFallbacks.length];
          } else if (lang === 'es') {
            const esFallbacks = [
              "¡Es un tema interesante! Dime si hay algo específico sobre días libres, estipendios o el mapa de la oficina en lo que te pueda colaborar.",
              "¡Entendido! Estoy a tu disposición para revisar cualquier política de Acme Corp o ubicar una sala en el piso 2.",
              "¡De acuerdo! Siempre que quieras consultar beneficios de salud, teletrabajo o trámites de RRHH, aquí me tienes.",
              "¡Perfecto! Avísame si deseas buscar alguna sección del manual de empleados o ver las instalaciones."
            ];
            fallbackText = esFallbacks[currentTurn % esFallbacks.length];
          } else if (lang === 'fr') {
            const frFallbacks = [
              "C'est un sujet intéressant ! Y a-t-il une question précise concernant les congés, indemnités ou le plan d'étage que je peux vérifier pour vous ?",
              "Entendu ! Je reste à votre écoute pour toute recherche dans le guide de l'employé ou pour trouver un bureau."
            ];
            fallbackText = frFallbacks[currentTurn % frFallbacks.length];
          } else if (lang === 'de') {
            const deFallbacks = [
              "Ein interessantes Thema! Kann ich Ihnen bei Urlaubsregelungen, Zuschüssen oder dem Gebäudeplan behilflich sein?",
              "Verstanden! Geben Sie einfach Bescheid, wenn Sie Details zu Richtlinien oder Räumlichkeiten nachschlagen möchten."
            ];
            fallbackText = deFallbacks[currentTurn % deFallbacks.length];
          } else if (lang === 'ja') {
            fallbackText = "興味深い話題ですね！有給休暇（PTO）や手当、フロアマップなどについてお手伝いできることはございますか？";
          } else if (lang === 'zh') {
            fallbackText = "这是一个很有趣的话题！今天在年假政策、设备津贴或工位地图方面有什么我可以协助您的吗？";
          } else if (lang === 'hi') {
            fallbackText = "यह एक दिलचस्प विषय है! क्या आज छुट्टियों, भत्ते या फ्लोर मैप के बारे में कोई सवाल है?";
          } else {
            const enFallbacks = [
              "Sounds interesting! Feel free to ask if there's any specific company policy, benefit, or office room you'd like to check.",
              "Got it! I'm here anytime you need to look up official handbook guidelines, benefits, or locate a desk on the floor map.",
              "I hear you! Whenever you're ready, we can explore PTO allowances, remote equipment stipends, or open floor spaces.",
              "Understood! Let me know if you want to look up anything in the Acme Corp employee handbook or Level 2 directory."
            ];
            fallbackText = enFallbacks[currentTurn % enFallbacks.length];
          }

          setChatMessages(prev => [...prev, {
            id: "b-" + Date.now(),
            sender: "bot",
            text: fallbackText
          }]);
        }, 400);
      };
      // SCREEN 1: LANDING PAGE & TWO DISTINCT LOGIN BOXES
      // ----------------------------------------------------
      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
            <header className="p-4 border-b border-slate-900 bg-slate-900/60 flex justify-between items-center">
              <span className="font-bold text-lg text-white">PolicyBot AI &bull; Acme Corp</span>
              <span className="text-xs text-slate-400">Join Code: <strong className="text-amber-400 font-mono">ACME-2026</strong></span>
            </header>

            <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 my-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Acme Corp Workplace Portal</h1>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">Select your portal below to access company policies, interactive desk maps, and HR operations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* BOX 1: HR Admin Portal */}
                <div id="box-hr-admin-portal" className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">Portal 1</span>
                    <h2 className="text-xl font-bold text-white mt-2 mb-1">Log in as HR / Workspace Owner</h2>
                    <p className="text-xs text-slate-400 mb-5">Full administrative dashboard with Knowledge Base, Floor Map Manager, Escalations, and Approvals.</p>

                    <form onSubmit={handleLoginHR} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">HR Email</label>
                        <input
                          type="email"
                          value={hrEmail}
                          onChange={e => setHrEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                        <input
                          type="password"
                          value={hrPass}
                          onChange={e => setHrPass(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition mt-2"
                      >
                        Log In as HR
                      </button>
                    </form>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                    <span>Default: claire.admin@acmecorp.com</span>
                    <span className="text-indigo-400">Role: HR_Admin</span>
                  </div>
                </div>

                {/* BOX 2: Employee Portal */}
                <div id="box-employee-portal" className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">Portal 2</span>
                    <h2 className="text-xl font-bold text-white mt-2 mb-1">Log in as Employee</h2>
                    <p className="text-xs text-slate-400 mb-4">Access policy queries, instant floor map directions, and direct messaging with your company&apos;s HR team.</p>

                    {/* Dual option tab */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-4 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setEmpMode("work")}
                        className={"py-2 rounded-lg transition " + (empMode === "work" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white")}
                      >
                        1. Work Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmpMode("personal")}
                        className={"py-2 rounded-lg transition " + (empMode === "personal" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white")}
                      >
                        2. Personal Email
                      </button>
                    </div>

                    {empMode === "work" ? (
                      <form onSubmit={handleLoginWorkEmail} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Email (@acmecorp.com)</label>
                          <input
                            type="email"
                            value={workEmail}
                            onChange={e => setWorkEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-cyan-400">Auto-matches @acmecorp.com domain & sets status to Active.</p>
                        <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition">
                          Open Employee Chat Assistant
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleLoginPersonalEmail} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            value={personalName}
                            onChange={e => setPersonalName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Personal Email</label>
                          <input
                            type="email"
                            value={personalEmail}
                            onChange={e => setPersonalEmail(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Join Code</label>
                          <input
                            type="text"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-amber-400">Sets status: Pending_Approval & unlocks via HR Admin or OTP 123456.</p>
                        <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition">
                          Submit for HR Approval
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Universal OTP Bypass */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Universal Bypass Code:</span>
                    <button
                      type="button"
                      onClick={() => handleOtpBypass(empMode === "work" ? workEmail : personalEmail)}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold rounded hover:bg-amber-500/30"
                    >
                      Bypass: 123456
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
              PolicyBot AI &bull; B2B SaaS HR Platform &bull; Acme Corp Tenant
            </footer>
          </div>
        );
      }

      // ----------------------------------------------------
      // SCREEN 2: LOCKED HOLDING SCREEN FOR PENDING EMPLOYEES
      // ----------------------------------------------------
      if (currentUser.status === "Pending_Approval") {
        return (
          <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🔒
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold font-mono">
                Status: Pending_Approval
              </span>
              <h2 className="text-2xl font-bold text-white mt-3 mb-2">Access Pending</h2>
              <p className="text-sm text-slate-300 mb-6">
                Your request has been sent to your company&apos;s HR team to verify your employment.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left mb-6 space-y-1">
                <p className="text-slate-400">Applicant: <strong className="text-white">{currentUser.name}</strong></p>
                <p className="text-slate-400">Email: <strong className="text-white font-mono">{currentUser.email}</strong></p>
                <p className="text-slate-400">Company: <strong className="text-cyan-400">Acme Corp</strong></p>
                <p className="text-slate-400">Code: <strong className="text-amber-400 font-mono">ACME-2026</strong></p>
              </div>

              {/* Universal OTP Bypass */}
              <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl mb-6 text-left text-xs">
                <p className="font-bold text-amber-300 mb-1">Universal OTP Bypass (123456)</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    placeholder="123456"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-center font-mono text-amber-300"
                  />
                  <button
                    onClick={() => handleOtpBypass()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs"
                  >
                    Verify Immediately
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    const fresh = users.find(u => u.id === currentUser.id);
                    if (fresh) setCurrentUser(fresh);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                >
                  Refresh Approval Status
                </button>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ----------------------------------------------------
      // SCREEN 3: ROLE-BASED DASHBOARDS
      // ----------------------------------------------------
      const isHR = currentUser.role === "HR_Admin";
      const pendingUsersCount = users.filter(u => u.status === "Pending_Approval").length;
      const pendingLogsCount = escalationLogs.filter(e => e.status === "Pending").length;

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          {/* Header */}
          <header className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white">
                PB
              </div>
              <span className="font-bold text-base text-white">PolicyBot AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                {isHR ? "HR Admin Portal" : "Employee Portal"}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-300 font-semibold">{currentUser.name} ({currentUser.email})</span>
              <button
                onClick={() => setCurrentUser(null)}
                className="px-3 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg font-medium"
              >
                Sign Out
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-60 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-2">Navigation</span>

                {isHR ? (
                  // HR Admin Sidebar: [Overview Dashboard, Knowledge Base, Floor Map Manager, Escalation Logs, Employee Approvals, Sign Out]
                  <>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>Overview Dashboard</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("knowledge")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "knowledge" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>Knowledge Base</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800">{policies.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("floormap")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "floormap" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>Floor Map Manager</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800">{floorZones.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("escalations")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "escalations" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>Escalation Logs</span>
                      {pendingLogsCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingLogsCount}</span>}
                    </button>
                    <button
                      onClick={() => setActiveTab("approvals")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "approvals" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>Employee Approvals</span>
                      {pendingUsersCount > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingUsersCount}</span>}
                    </button>
                  </>
                ) : (
                  // Employee Sidebar: ONLY [Chat Assistant, Interactive Floor Map, HR Direct Messages, Sign Out]
                  <>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold " + (activeTab === "chat" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      Chat Assistant
                    </button>
                    <button
                      onClick={() => { setActiveTab("floormap"); setSelectedZoneId(null); setHighlightedZoneId(null); }}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold " + ((activeTab === "floormap" || activeTab === "floormap_emp") ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      Interactive Floor Map
                    </button>
                    <button
                      onClick={() => setActiveTab("direct_msgs")}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between " + (activeTab === "direct_msgs" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
                    >
                      <span>HR Direct Messages</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800">{escalationLogs.filter(e => e.status === "Resolved").length}</span>
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentUser(null)}
                className="w-full py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                Sign Out
              </button>
            </aside>

            {/* Main Tab Views */}
            <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
              {/* HR: OVERVIEW */}
              {isHR && activeTab === "overview" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h2 className="text-2xl font-bold text-white">HR Admin Operations Center</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage verified policy documents, level 2 office zones, pending applicant verifications, and AI escalations.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div onClick={() => setActiveTab("knowledge")} className="bg-slate-900 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                      <span className="text-xs text-slate-400">Policies</span>
                      <p className="text-2xl font-bold text-white">{policies.length}</p>
                    </div>
                    <div onClick={() => setActiveTab("floormap")} className="bg-slate-900 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                      <span className="text-xs text-slate-400">Floor Zones</span>
                      <p className="text-2xl font-bold text-white">{floorZones.length}</p>
                    </div>
                    <div onClick={() => setActiveTab("escalations")} className="bg-slate-900 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-rose-500">
                      <span className="text-xs text-slate-400">Pending Escalations</span>
                      <p className="text-2xl font-bold text-rose-400">{pendingLogsCount}</p>
                    </div>
                    <div onClick={() => setActiveTab("approvals")} className="bg-slate-900 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500">
                      <span className="text-xs text-slate-400">Pending Approvals</span>
                      <p className="text-2xl font-bold text-amber-400">{pendingUsersCount}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* HR: KNOWLEDGE BASE */}
              {isHR && activeTab === "knowledge" && (
                <div className="space-y-4 max-w-4xl">
                  <h2 className="text-xl font-bold text-white">Knowledge Base (AI Grounding Documents)</h2>
                  <div className="space-y-3">
                    {policies.map(p => (
                      <div key={p.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-indigo-300">[📄 {p.title}]</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Active</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{p.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR: FLOOR MAP MANAGER */}
              {isHR && activeTab === "floormap" && (
                <div className="space-y-4 max-w-4xl">
                  <h2 className="text-xl font-bold text-white">Floor Map Manager</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {floorZones.map(z => (
                      <div key={z.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{z.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{z.category}</span>
                        </div>
                        <p className="text-xs text-slate-400">Capacity: <strong className="text-slate-200">{z.capacity}</strong></p>
                        <p className="text-xs text-slate-400 mt-1">{z.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR: ESCALATION LOGS & REPLY & RESOLVE */}
              {isHR && activeTab === "escalations" && (
                <div className="space-y-4 max-w-4xl">
                  <h2 className="text-xl font-bold text-white">Escalation Logs (Unanswered AI Queries)</h2>
                  <div className="space-y-3">
                    {escalationLogs.map(log => (
                      <div key={log.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-slate-400">{log.userEmail}</span>
                          <span className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase " + (log.status === "Pending" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300")}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-3">&ldquo;{log.question}&rdquo;</p>

                        {log.status === "Pending" ? (
                          replyLogId === log.id ? (
                            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-indigo-500 space-y-2">
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Type resolution from Claire Admin..."
                                className="w-full p-2 bg-slate-900 rounded text-xs text-white"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setReplyLogId(null)} className="px-3 py-1 bg-slate-800 text-xs rounded">Cancel</button>
                                <button onClick={() => handleSaveReply(log.id)} className="px-3 py-1 bg-emerald-600 text-xs font-bold rounded">Save & Mark Resolved</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyLogId(log.id); setReplyText(""); }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Reply & Resolve
                            </button>
                          )
                        ) : (
                          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold">{log.respondedBy || "Claire Admin"} (Date: {log.respondedAt || "2026-09-07"}):</span>
                            <p className="mt-1">{log.hrResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR: EMPLOYEE APPROVALS TAB */}
              {isHR && activeTab === "approvals" && (
                <div className="space-y-4 max-w-4xl">
                  <h2 className="text-xl font-bold text-white">Employee Approvals Queue</h2>
                  <div className="space-y-3">
                    {users.filter(u => u.status === "Pending_Approval").map(user => (
                      <div key={user.id} className="p-4 bg-slate-900 rounded-xl border border-amber-500/40 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{user.email} &bull; Code: ACME-2026</p>
                          <span className="text-[10px] text-amber-400">Status: Pending_Approval</span>
                        </div>
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                    {users.filter(u => u.status === "Pending_Approval").length === 0 && (
                      <p className="text-xs text-slate-500 p-8 bg-slate-900 rounded-xl text-center">No pending applicants waiting for approval.</p>
                    )}
                  </div>
                </div>
              )}

              {/* EMPLOYEE: CHAT ASSISTANT */}
              {!isHR && activeTab === "chat" && (
                <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-xl">
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">PolicyBot Assistant</span>
                    <span className="text-[10px] text-emerald-400">● Live Handbook AI</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(m => (
                      <div key={m.id} className={"flex flex-col " + (m.sender === "user" ? "items-end" : "items-start")}>
                        {m.isDirectMessage ? (
                          <div className="p-4 rounded-xl text-xs max-w-[90%] bg-indigo-950/70 border-2 border-indigo-500 text-slate-100 shadow-lg">
                            <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1.5">
                              <span>👤 Direct Message from HR ({m.respondedBy || "Claire Admin"}):</span>
                            </div>
                            {m.origQuestion && (
                              <p className="text-[11px] text-slate-400 italic mb-2">Re: &ldquo;{m.origQuestion}&rdquo;</p>
                            )}
                            <p className="text-white leading-relaxed">{m.text}</p>
                          </div>
                        ) : (
                          <div className={"p-3 rounded-xl text-xs max-w-[85%] leading-relaxed " + (m.sender === "user" ? "bg-cyan-600 text-white" : m.isEscalated ? "bg-rose-950/40 border border-rose-800 text-slate-200" : "bg-slate-950 border border-slate-800 text-slate-200")}>
                            <p>{m.text}</p>
                            {m.citation && (
                              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-indigo-300">
                                [📄 {m.citation}]
                              </div>
                            )}
                            {m.floorMapTrigger && (
                              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                                <button
                                  onClick={() => onNavigateToFloorMap(m.floorMapTrigger.zoneId)}
                                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition active:scale-[0.98]"
                                >
                                  <span>{m.floorMapTrigger.actionLabel || '📍 Highlight on Floor Map'}</span>
                                  <span>&rarr;</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pre-loaded Suggested Questions */}
                  <div className="p-2.5 bg-slate-950/70 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
                    <span className="text-slate-500 text-[11px] self-center shrink-0">Try:</span>
                    <button onClick={() => handleSendChat("Hello, how are you?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded shrink-0">"Hello, how are you?"</button>
                    <button onClick={() => handleSendChat("What can you do?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded shrink-0">"What can you do?"</button>
                    <button onClick={() => handleSendChat("How long until HR responds?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded shrink-0">"HR wait time?"</button>
                    <button onClick={() => handleSendChat("How many PTO days do I get?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0">"PTO policy?"</button>
                    <button onClick={() => handleSendChat("Where is the HR helpdesk?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded shrink-0">"Where is HR?"</button>
                    <button onClick={() => handleSendChat("Can we get paid in Bitcoin?")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded shrink-0">"Pay in Bitcoin?"</button>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); handleSendChat(); }} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask policy question..."
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">Send</button>
                  </form>
                </div>
              )}

              {/* EMPLOYEE: INTERACTIVE FLOOR MAP */}
              {!isHR && (activeTab === "floormap" || activeTab === "floormap_emp") && (
                <div className="space-y-4 max-w-4xl">
                  {/* Top banner when selectedZoneId is active */}
                  {selectedZoneId && (() => {
                    const activeZone = floorZones.find(z => z.id === selectedZoneId);
                    if (!activeZone) return null;
                    return (
                      <div className="p-4 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/40 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold animate-pulse text-base">
                            📍
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                              <span>Showing location from Chat:</span>
                              <span className="text-cyan-300">{activeZone.name}</span>
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {activeZone.category} &bull; Capacity: {activeZone.capacity} &bull; {activeZone.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={onClearSelection}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-705 transition active:scale-95 shrink-0"
                        >
                          Clear Selection
                        </button>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Level 2 Interactive Floor Map</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time facility locations with direct AI chat navigation</p>
                    </div>
                    <span className="text-xs text-slate-400">Click any zone to inspect amenities</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {floorZones.map(zone => {
                      const isHighlighted = (selectedZoneId === zone.id) || (highlightedZoneId === zone.id);
                      return (
                        <div
                          key={zone.id}
                          onClick={() => {
                            setSelectedZoneId(zone.id);
                            setHighlightedZoneId(zone.id);
                          }}
                          className={"p-6 rounded-2xl border-2 transition cursor-pointer " + (isHighlighted ? "border-cyan-400 ring-4 ring-cyan-400 animate-pulse bg-cyan-500/30 shadow-2xl shadow-cyan-400/40 scale-[1.02]" : "border-slate-800 bg-slate-900 hover:border-slate-700")}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-white">{zone.name}</span>
                            <span className={"text-xs px-2 py-0.5 rounded " + (zone.category === 'HR Desk' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300')}>{zone.category}</span>
                          </div>
                          <p className="text-xs text-slate-400">Capacity: <strong className="text-slate-200">{zone.capacity}</strong></p>
                          <p className="text-xs text-slate-400 mt-2">{zone.description}</p>
                          {isHighlighted && <p className="text-xs text-cyan-300 font-bold mt-3">📍 Active Selection / Pulsing Zone</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EMPLOYEE: HR DIRECT MESSAGES */}
              {!isHR && activeTab === "direct_msgs" && (
                <div className="space-y-4 max-w-3xl">
                  <h2 className="text-xl font-bold text-white">HR Direct Messages</h2>
                  <div className="space-y-3">
                    {escalationLogs.filter(l => l.status === "Resolved").map(msg => (
                      <div key={msg.id} className="p-5 bg-slate-900 border border-indigo-500/40 rounded-2xl">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                          <span className="text-indigo-300 font-bold">👤 Direct Message from HR ({msg.respondedBy || "Claire Admin"}):</span>
                          <span>{msg.respondedAt || "2026-09-07"}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic mb-2">&ldquo;{msg.question}&rdquo;</p>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white">
                          {msg.hrResponse}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById("root"));
  </script>
</body>
</html>
`;

  const contentToUse = htmlContent || standaloneHtmlContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToUse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([contentToUse], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'policybot-ai-standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Standalone Single-File index.html</h3>
              <p className="text-xs text-slate-400">Self-contained React 18, Babel & Tailwind CDN bundle</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700/80 active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .html</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-xs text-slate-300 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">100% Zero-Install Compatibility:</span>
              <p className="text-slate-400 mt-0.5">
                Save as <code className="text-cyan-300 font-mono">index.html</code> anywhere and double click to open directly in any browser. It embeds React 18, Babel standalone, Tailwind CDN, and simulated state out of the box.
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              HTML Preview
            </span>
            <pre className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              {contentToUse}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
