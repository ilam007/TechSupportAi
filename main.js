/* ==============================
   TechSupAI — main.js
   Complete support logic, ticket
   generation, history management
============================== */

// ---- NAV TOGGLE ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ---- SMOOTH NAV SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ---- NAVBAR SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.background =
    window.scrollY > 60 ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.85)';
});

// =============================================
//   ISSUE KNOWLEDGE BASE
// =============================================
const RISKY_KEYWORDS = [
  'burning smell', 'smoke', 'spark', 'sparks', 'battery swelling', 'swollen battery',
  'electric shock', 'exposed wire', 'overheating badly', 'liquid damage', 'water damage',
  'caught fire', 'on fire', 'melting', 'explosion', 'burst'
];

const knowledgeBase = {
  'not_charging': {
    match: (category, issue, desc) =>
      issue === 'Not charging' ||
      (desc.toLowerCase().includes('not charging') || desc.toLowerCase().includes('won\'t charge') || desc.toLowerCase().includes('doesnt charge')),
    cause: 'The charging issue could be caused by a faulty power adapter, damaged charging cable, dirty charging port, or a software/battery management problem.',
    steps: [
      'Check that the power socket is working by testing with another device.',
      'Inspect the charging cable and adapter for visible damage, fraying, or bent pins.',
      'Clean the charging port gently with a dry toothbrush or compressed air to remove dust/lint.',
      'Try using a different compatible charger or cable if available.',
      'Perform a soft restart of the device.',
      'Check the charging indicator — if it shows "plugged in, not charging", try updating your battery driver (Laptop) or check battery health.',
      'If none of the above work, the charging port or battery may need hardware inspection.'
    ],
    safetyWarning: null,
    confidence: 'High',
    escalation: 'No',
    nextAction: 'Follow the troubleshooting steps. If the issue persists after all steps, schedule a hardware inspection with an authorized service center.'
  },

  'wifi_not_working': {
    match: (category, issue, desc) =>
      issue === 'Wi-Fi not working' || category === 'Wi-Fi Router' ||
      desc.toLowerCase().includes('wifi') || desc.toLowerCase().includes('wi-fi') || desc.toLowerCase().includes('internet not working'),
    cause: 'Wi-Fi issues are commonly caused by router/modem problems, incorrect network settings, IP conflicts, or ISP outages.',
    steps: [
      'Restart your router and modem — unplug for 30 seconds, then plug back in.',
      'Check if other devices can connect to the same Wi-Fi network.',
      'On your device, forget the Wi-Fi network and reconnect by entering the password again.',
      'Check the router indicator lights — a red or off "Internet" light usually means an ISP issue.',
      'Move closer to the router to rule out signal distance problems.',
      'Disable and re-enable Wi-Fi on your device.',
      'If other devices work but yours doesn\'t, try restarting your device or resetting network settings.',
      'If no devices work, contact your Internet Service Provider (ISP).'
    ],
    safetyWarning: null,
    confidence: 'High',
    escalation: 'Maybe',
    nextAction: 'Follow troubleshooting steps. If the ISP indicator is red/off, contact your ISP directly. If only your device is affected, consider a network settings reset.'
  },

  'printer_not_printing': {
    match: (category, issue, desc) =>
      issue === 'Printer not printing' || category === 'Printer' ||
      desc.toLowerCase().includes('printer') || desc.toLowerCase().includes('not printing'),
    cause: 'Printer issues are often due to empty ink/toner, paper jam, stuck print queue, or a lost connection between the printer and computer.',
    steps: [
      'Check the paper tray — ensure it is loaded correctly and the paper is not jammed.',
      'Check ink or toner levels from the printer settings or companion app.',
      'Open your computer\'s print queue and cancel all pending/stuck jobs, then try again.',
      'Restart the printer — power it off completely, wait 30 seconds, then power back on.',
      'If using USB, unplug and re-plug the cable. If using Wi-Fi, ensure both printer and computer are on the same network.',
      'Print a test page from the printer\'s control panel to check if it works independently.',
      'Update or reinstall the printer driver from the manufacturer\'s website.',
      'Ensure your device is set to use the correct default printer.'
    ],
    safetyWarning: null,
    confidence: 'High',
    escalation: 'No',
    nextAction: 'Follow the troubleshooting steps. If the printer still fails after a test page attempt, contact the manufacturer\'s support or an authorized printer technician.'
  },

  'overheating': {
    match: (category, issue, desc) =>
      issue === 'Overheating' ||
      (desc.toLowerCase().includes('overheat') || desc.toLowerCase().includes('too hot') || desc.toLowerCase().includes('getting hot') || desc.toLowerCase().includes('heating up')),
    cause: 'Overheating is often caused by blocked ventilation, heavy background processes, outdated software, or a failing cooling system.',
    steps: [
      'Close all unnecessary background apps and processes.',
      'Remove the phone case or ensure the laptop has adequate ventilation.',
      'Do not use the device on soft surfaces (bed, couch) that block air vents.',
      'Check for and install any available software or firmware updates.',
      'Avoid charging the device while running heavy tasks or apps.',
      'Run a malware scan — malicious software can cause unusual CPU/GPU load.',
      'For laptops, clean the fan vents with compressed air (do not open the device yourself).',
      'Allow the device to cool down before using it again.'
    ],
    safetyWarning: null,
    confidence: 'Medium',
    escalation: 'Maybe',
    nextAction: 'If overheating continues after following these steps, have the cooling system inspected by an authorized technician. Do not ignore persistent overheating.'
  },

  'software_install': {
    match: (category, issue, desc) =>
      issue === 'Software installation issue' || category === 'Software' ||
      desc.toLowerCase().includes('install') || desc.toLowerCase().includes('setup failed') || desc.toLowerCase().includes('installation error'),
    cause: 'Software installation failures are typically caused by insufficient storage, incompatible system requirements, administrator permission issues, or corrupted installer files.',
    steps: [
      'Check the software\'s official system requirements and confirm your device meets them.',
      'Free up storage space — ensure you have at least 2x the installer file size available.',
      'Right-click the installer and select "Run as Administrator" (Windows).',
      'Temporarily disable your antivirus — only if the software is from a trusted/official source — then retry.',
      'Restart your device and try the installation again.',
      'If the download may be corrupted, delete it and re-download from the official source only.',
      'Check your system\'s date and time are correct — incorrect time can cause certificate errors.',
      'Look up the specific error code if shown, on the software\'s official support page.'
    ],
    safetyWarning: null,
    confidence: 'High',
    escalation: 'No',
    nextAction: 'Follow the steps above. If you receive a specific error code, search the official support documentation. If installing enterprise software, contact your IT department.'
  },

  'not_turning_on': {
    match: (category, issue, desc) =>
      issue === 'Not turning on' ||
      desc.toLowerCase().includes('not turning on') || desc.toLowerCase().includes('won\'t turn on') || desc.toLowerCase().includes('wont turn on') || desc.toLowerCase().includes('dead') || desc.toLowerCase().includes('black screen') && !desc.toLowerCase().includes('display'),
    cause: 'A device that won\'t turn on could have a completely drained battery, a failed power button, a software crash, or a hardware fault.',
    steps: [
      'Connect the device to a power source and charge it for at least 30 minutes before trying to turn it on.',
      'For laptops: remove the battery (if removable), hold the power button for 15 seconds, reinsert battery, then try again.',
      'Try a force/hard restart: hold the power button for 10–15 seconds.',
      'Check that the power adapter and cable are working correctly.',
      'If the device has an LED indicator, check if it lights up when plugged in.',
      'For desktops: check that the power cable is firmly connected to the outlet and the PSU.',
      'Try connecting an external monitor if the device may be on but screen is dead.',
      'If none of the above work, the device likely has a hardware fault.'
    ],
    safetyWarning: null,
    confidence: 'Medium',
    escalation: 'Maybe',
    nextAction: 'If charging and hard reset don\'t help, the device requires professional hardware diagnosis. Contact the manufacturer or an authorized service center.'
  },

  'login_issue': {
    match: (category, issue, desc) =>
      issue === 'Login issue' ||
      desc.toLowerCase().includes('login') || desc.toLowerCase().includes('password') || desc.toLowerCase().includes('locked out') || desc.toLowerCase().includes('cannot sign in'),
    cause: 'Login issues are usually caused by forgotten credentials, account lockout due to multiple failed attempts, two-factor authentication problems, or browser/app cache issues.',
    steps: [
      'Use the "Forgot Password" or "Reset Password" link on the login page.',
      'Check if your Caps Lock key is on — passwords are case-sensitive.',
      'Clear your browser cache and cookies, then try again.',
      'Try a different browser or an incognito/private window.',
      'Check if you are using the correct email address for the account.',
      'If using two-factor authentication (2FA) and not receiving the code, check spam folder or verify phone number.',
      'If the account is locked, wait 15–30 minutes before trying again.',
      'Contact the service\'s official customer support if you cannot recover access.'
    ],
    safetyWarning: null,
    confidence: 'High',
    escalation: 'No',
    nextAction: 'Use official password reset options. If account is compromised or you cannot recover it, contact the platform\'s support team directly.'
  },

  'error_code': {
    match: (category, issue, desc) =>
      issue === 'Error code issue' ||
      desc.toLowerCase().includes('error code') || /\b(0x[0-9a-f]{4,}|error\s*\d+)\b/i.test(desc),
    cause: 'Error codes indicate specific system, software, or hardware faults. The meaning varies by product and manufacturer.',
    steps: [
      'Note down the exact error code shown on screen.',
      'Restart the device and check if the error reappears.',
      'Search the official manufacturer\'s website or support documentation for the specific error code.',
      'Check if there are any pending system or software updates.',
      'Try reinstalling the related software or driver if applicable.',
      'If the error appeared after a recent update, consider rolling back the update.',
      'Contact official support with the exact error code for targeted help.'
    ],
    safetyWarning: null,
    confidence: 'Medium',
    escalation: 'Maybe',
    nextAction: 'Look up the exact error code on the official manufacturer\'s support page. If the error relates to hardware or persists after all steps, escalate to official support.'
  }
};

// ---- SAFETY CHECK ----
function checkRiskyKeywords(text) {
  const lower = text.toLowerCase();
  return RISKY_KEYWORDS.find(kw => lower.includes(kw)) || null;
}

// ---- FIND MATCH ----
function analyzeIssue(data) {
  const { productCategory, issueType, problemDescription } = data;
  const desc = problemDescription;

  // 1. Check for risky/safety keywords first
  const riskyWord = checkRiskyKeywords(desc + ' ' + issueType);
  if (riskyWord) {
    return {
      type: 'safety',
      confidence: 'Low',
      escalation: 'Yes',
      riskyWord
    };
  }

  // 2. Match against knowledge base
  for (const [key, entry] of Object.entries(knowledgeBase)) {
    if (entry.match(productCategory, issueType, desc)) {
      return {
        type: 'known',
        key,
        ...entry,
        escalation: entry.escalation
      };
    }
  }

  // 3. Unknown / low confidence
  return {
    type: 'unknown',
    confidence: 'Low',
    escalation: 'Yes'
  };
}

// ---- GENERATE TICKET ID ----
function generateTicketId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TSA-${ts}-${rand}`;
}

// ---- FORM VALIDATION ----
function validateForm(data) {
  let valid = true;
  const fields = {
    productName: { el: document.getElementById('productName'), errId: 'err-productName', msg: 'Product name is required.' },
    issueType: { el: document.getElementById('issueType'), errId: 'err-issueType', msg: 'Please select an issue type.' },
    problemDescription: { el: document.getElementById('problemDescription'), errId: 'err-problemDescription', msg: 'Problem description is required.' },
    userEmail: { el: document.getElementById('userEmail'), errId: 'err-userEmail', msg: 'A valid email address is required.' }
  };

  // Clear all
  Object.values(fields).forEach(f => {
    document.getElementById(f.errId).textContent = '';
    f.el.classList.remove('input-error');
  });

  for (const [key, f] of Object.entries(fields)) {
    let val = f.el.value.trim();
    if (!val) {
      document.getElementById(f.errId).textContent = f.msg;
      f.el.classList.add('input-error');
      valid = false;
    } else if (key === 'userEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      document.getElementById(f.errId).textContent = f.msg;
      f.el.classList.add('input-error');
      valid = false;
    }
  }

  if (!valid) {
    document.getElementById('supportForm').querySelector('.input-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

// ---- BUILD RESULT HTML ----
function buildResultHTML(result, data) {
  if (result.type === 'safety') {
    return `
      <div class="result-header">
        <div class="result-title">⚠️ Safety Risk Detected</div>
        <span class="confidence-badge conf-low">Confidence: Low</span>
      </div>
      <div class="result-meta">
        <span class="meta-pill">Product: ${data.productName}</span>
        <span class="meta-pill">Issue: ${data.issueType}</span>
        <span class="meta-pill" style="color:var(--danger)">Escalation: Required</span>
      </div>
      <div class="safety-alert">
        <div class="alert-icon">🚨</div>
        <p><strong>Safety Warning:</strong> Your description mentions a potentially dangerous condition (<em>"${result.riskyWord}"</em>). This issue may involve a serious safety risk. <strong>Stop using the product immediately</strong> and do not attempt any repair steps. Contact an authorized technician or the manufacturer's emergency support line right away.</p>
      </div>
      <div class="result-section-block" style="margin-top:1.5rem;">
        <h4>Recommended Next Action</h4>
        <p class="result-cause">Disconnect the device from power if safe to do so. Store it in a safe, ventilated area away from flammable materials. Contact the manufacturer or a certified repair center immediately.</p>
      </div>
    `;
  }

  if (result.type === 'unknown') {
    return `
      <div class="result-header">
        <div class="result-title">Additional Information Needed</div>
        <span class="confidence-badge conf-low">Confidence: Low</span>
      </div>
      <div class="result-meta">
        <span class="meta-pill">Product: ${data.productName}</span>
        <span class="meta-pill">Issue: ${data.issueType || 'Not specified'}</span>
        <span class="meta-pill" style="color:var(--warning)">Escalation: Yes</span>
      </div>
      <div class="low-conf-msg">
        <p>I don't have enough verified information to answer this confidently. Please provide more details or contact support.</p>
        <p>To help us diagnose this issue accurately, please provide:</p>
        <ul style="margin-left:1.25rem; color:var(--text2); font-size:0.88rem; line-height:2;">
          <li>The <strong>exact model number</strong> of your device</li>
          <li>Any <strong>error codes</strong> shown on screen</li>
          <li><strong>When the issue first started</strong> and whether it happened suddenly or gradually</li>
          <li><strong>Steps you've already tried</strong> to fix it</li>
          <li>Whether any <strong>recent changes</strong> were made (updates, new software, drops, etc.)</li>
        </ul>
      </div>
    `;
  }

  // Known issue
  const confClass = result.confidence === 'High' ? 'conf-high' : 'conf-medium';
  const steps = result.steps.map((s, i) => `
    <li><span class="step-num">${i + 1}</span><span>${s}</span></li>
  `).join('');

  const escalationBlock = result.escalation === 'Yes' || result.escalation === 'Maybe' ? `
    <div class="result-section-block">
      <h4>Escalation Notice</h4>
      <div class="escalation-notice">
        <span style="font-size:1.1rem;">⚠️</span>
        <p><strong>Escalation: ${result.escalation}.</strong> If the steps above do not resolve the issue, please generate a support ticket and contact an authorized technician or the manufacturer.</p>
      </div>
    </div>
  ` : '';

  const nextAction = result.nextAction ? `
    <div class="result-section-block">
      <h4>Recommended Next Action</h4>
      <p class="result-cause">${result.nextAction}</p>
    </div>
  ` : '';

  return `
    <div class="result-header">
      <div class="result-title">Troubleshooting Guide Found</div>
      <span class="confidence-badge ${confClass}">Confidence: ${result.confidence}</span>
    </div>
    <div class="result-meta">
      <span class="meta-pill">Product: ${data.productName}</span>
      ${data.productCategory ? `<span class="meta-pill">Category: ${data.productCategory}</span>` : ''}
      <span class="meta-pill">Issue: ${data.issueType}</span>
      <span class="meta-pill" style="color:${result.escalation === 'No' ? 'var(--success)' : 'var(--warning)'}">Escalation: ${result.escalation}</span>
    </div>
    <div class="result-section-block">
      <h4>Possible Cause</h4>
      <p class="result-cause">${result.cause}</p>
    </div>
    <div class="result-section-block">
      <h4>Step-by-Step Troubleshooting</h4>
      <ul class="steps-list">${steps}</ul>
    </div>
    ${result.safetyWarning ? `<div class="safety-alert"><div class="alert-icon">⚠️</div><p>${result.safetyWarning}</p></div>` : ''}
    ${escalationBlock}
    ${nextAction}
  `;
}

// ---- CURRENT TICKET DATA (global) ----
let currentTicket = null;

// ---- BUILD TICKET ----
function buildTicketHTML(data, result) {
  const ticketId = generateTicketId();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const confClass = result.confidence === 'High' ? 'conf-high' : result.confidence === 'Medium' ? 'conf-medium' : 'conf-low';
  const escalClass = result.escalation === 'No' ? 'conf-high' : result.escalation === 'Maybe' ? 'conf-medium' : 'conf-low';
  const escalBg = result.escalation === 'No' ? 'var(--success-bg)' : 'var(--warning-bg)';
  const escalColor = result.escalation === 'No' ? 'var(--success)' : 'var(--warning)';

  const nextAction = result.type === 'safety'
    ? 'Stop using the device. Contact authorized technician immediately.'
    : result.type === 'unknown'
    ? 'Provide more details or contact support directly.'
    : (result.nextAction || 'Follow troubleshooting steps. Escalate if unresolved.');

  // Save ticket data for actions
  currentTicket = {
    ticketId, dateStr, timeStr, data, result,
    nextAction,
    plainText: buildTicketPlainText(ticketId, dateStr, timeStr, data, result, nextAction)
  };

  return `
    <div class="ticket-header">
      <div class="ticket-id">${ticketId}</div>
      <div class="ticket-date">Generated on ${dateStr} at ${timeStr}</div>
    </div>
    <div class="ticket-grid">
      <div class="ticket-row"><div class="t-label">Product Name</div><div class="t-value">${data.productName || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Brand</div><div class="t-value">${data.brand || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Model Number</div><div class="t-value">${data.modelNumber || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Category</div><div class="t-value">${data.productCategory || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Warranty Status</div><div class="t-value">${data.warrantyStatus || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Urgency Level</div><div class="t-value">${data.urgencyLevel || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Issue Type</div><div class="t-value">${data.issueType || '—'}</div></div>
      <div class="ticket-row"><div class="t-label">Error Code</div><div class="t-value">${data.errorCode || '—'}</div></div>
      <div class="ticket-row ticket-full"><div class="t-label">Problem Description</div><div class="t-value">${data.problemDescription}</div></div>
      <div class="ticket-row ticket-full"><div class="t-label">Recommended Next Action</div><div class="t-value">${nextAction}</div></div>
      <div class="ticket-row"><div class="t-label">User Email</div><div class="t-value">${data.userEmail}</div></div>
    </div>
    <div class="ticket-status-row">
      <span class="ticket-status-pill ${confClass}" style="background: ${result.confidence === 'High' ? 'var(--success-bg)' : result.confidence === 'Medium' ? 'var(--warning-bg)' : 'var(--danger-bg)'}; color: ${result.confidence === 'High' ? 'var(--success)' : result.confidence === 'Medium' ? 'var(--warning)' : 'var(--danger)'};">Confidence: ${result.confidence}</span>
      <span class="ticket-status-pill" style="background:${escalBg}; color:${escalColor};">Escalation: ${result.escalation}</span>
    </div>
  `;
}

function buildTicketPlainText(ticketId, dateStr, timeStr, data, result, nextAction) {
  return `TechSupAI — Support Ticket
========================================
Ticket ID    : ${ticketId}
Date & Time  : ${dateStr} at ${timeStr}
========================================
Product Name : ${data.productName || '—'}
Brand        : ${data.brand || '—'}
Model Number : ${data.modelNumber || '—'}
Category     : ${data.productCategory || '—'}
Warranty     : ${data.warrantyStatus || '—'}
Urgency      : ${data.urgencyLevel || '—'}
Issue Type   : ${data.issueType || '—'}
Error Code   : ${data.errorCode || '—'}

Problem Description:
${data.problemDescription}

Confidence Level   : ${result.confidence}
Escalation Required: ${result.escalation}

Recommended Next Action:
${nextAction}

User Email   : ${data.userEmail}
========================================
TechSupassistantai@gmail.com`;
}

// ---- SAVE TO HISTORY ----
function saveToHistory(data, result, ticketId) {
  let history = JSON.parse(localStorage.getItem('techsupai_history') || '[]');
  history.unshift({
    ticketId,
    date: new Date().toISOString(),
    productName: data.productName,
    brand: data.brand,
    issueType: data.issueType,
    confidence: result.confidence,
    escalation: result.escalation
  });
  history = history.slice(0, 5);
  localStorage.setItem('techsupai_history', JSON.stringify(history));
  renderHistory();
}

// ---- RENDER HISTORY ----
function renderHistory() {
  const list = document.getElementById('historyList');
  const history = JSON.parse(localStorage.getItem('techsupai_history') || '[]');
  if (!history.length) {
    list.innerHTML = '<p class="empty-state">No support history yet. Submit your first issue to get started.</p>';
    return;
  }
  list.innerHTML = history.map(item => {
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const confClass = item.confidence === 'High' ? 'h-high' : item.confidence === 'Medium' ? 'h-medium' : 'h-low';
    return `
      <div class="history-item">
        <div class="history-left">
          <span class="h-ticket-id">${item.ticketId}</span>
          <span class="h-product">${item.productName}${item.brand ? ' — ' + item.brand : ''}</span>
          <span class="h-issue">${item.issueType || 'Issue not specified'}</span>
        </div>
        <div class="h-meta">
          <span class="h-date">${dateStr}</span>
          <span class="h-badge ${confClass}">Confidence: ${item.confidence}</span>
          <span class="h-badge" style="${item.escalation === 'No' ? 'background:var(--success-bg);color:var(--success)' : 'background:var(--warning-bg);color:var(--warning)'}">Escalation: ${item.escalation}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ---- TOAST ----
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' toast-' + type : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.add('hidden'); }, 3500);
}

// ---- GET FORM DATA ----
function getFormData() {
  return {
    productName: document.getElementById('productName').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    modelNumber: document.getElementById('modelNumber').value.trim(),
    productCategory: document.getElementById('productCategory').value,
    warrantyStatus: document.getElementById('warrantyStatus').value,
    issueType: document.getElementById('issueType').value,
    errorCode: document.getElementById('errorCode').value.trim(),
    problemDescription: document.getElementById('problemDescription').value.trim(),
    urgencyLevel: document.getElementById('urgencyLevel').value,
    userEmail: document.getElementById('userEmail').value.trim()
  };
}

// ---- FORM SUBMIT ----
document.getElementById('supportForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = getFormData();
  if (!validateForm(data)) return;

  const btn = document.getElementById('analyzeBtn');
  btn.textContent = 'Analyzing…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Analyze Issue →';
    btn.disabled = false;

    const result = analyzeIssue(data);

    // Render result
    const resultSection = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = buildResultHTML(result, data);
    resultSection.classList.remove('hidden');

    // Result actions
    const resultActions = document.getElementById('resultActions');
    resultActions.innerHTML = `<button class="btn btn-primary" id="generateTicketBtn">Generate Support Ticket &rarr;</button>`;
    document.getElementById('generateTicketBtn').addEventListener('click', () => {
      const ticketId = currentTicket ? currentTicket.ticketId : '';
      renderTicket(data, result);
    });

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 600);
});

// ---- RENDER TICKET ----
function renderTicket(data, result) {
  const ticketSection = document.getElementById('ticket');
  const ticketContent = document.getElementById('ticketContent');
  ticketContent.innerHTML = buildTicketHTML(data, result);
  ticketSection.classList.remove('hidden');
  ticketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  saveToHistory(data, result, currentTicket.ticketId);
  showToast('Support ticket generated!', 'success');
}

// ---- CLEAR FORM ----
document.getElementById('clearFormBtn').addEventListener('click', () => {
  document.getElementById('supportForm').reset();
  document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
  document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
  document.getElementById('result').classList.add('hidden');
  document.getElementById('ticket').classList.add('hidden');
  currentTicket = null;
  showToast('Form cleared.');
});

// ---- COPY TICKET ----
document.getElementById('copyTicketBtn').addEventListener('click', () => {
  if (!currentTicket) return;
  navigator.clipboard.writeText(currentTicket.plainText).then(() => {
    showToast('Ticket copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Could not copy. Please copy manually.', 'error');
  });
});

// ---- DOWNLOAD PDF (pure jsPDF — 100% reliable, no html2canvas) ----
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  if (!currentTicket) return;
  showToast('Generating PDF…');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const t = currentTicket;
  const d = t.data;
  const r = t.result;

  const PW = 210, PH = 297, ML = 18, MR = 18;
  const CW = PW - ML - MR;
  let Y = 0;

  const C = {
    navy:[15,23,42], accent:[79,142,247], accentL:[224,235,255],
    white:[255,255,255], black:[17,17,17], dark:[44,51,73],
    mid:[100,110,130], light:[240,244,252], border:[220,225,238],
    green:[22,163,74], greenL:[220,252,231],
    orange:[217,119,6], orangeL:[254,243,199],
    red:[220,38,38], redL:[254,226,226],
    warnBdr:[234,179,8]
  };

  const sf = (style,size,color) => {
    doc.setFont('helvetica', style||'normal');
    doc.setFontSize(size||10);
    doc.setTextColor(...(color||C.black));
  };
  const fr = (x,y,w,h,color) => { doc.setFillColor(...color); doc.rect(x,y,w,h,'F'); };
  const dl = (x1,y1,x2,y2,color,lw) => {
    doc.setDrawColor(...(color||C.border));
    doc.setLineWidth(lw||0.3);
    doc.line(x1,y1,x2,y2);
  };
  const wt = (text,x,y,maxW,lh) => {
    const lines = doc.splitTextToSize(String(text||'—'), maxW||CW);
    doc.text(lines, x, y);
    return y + lines.length*(lh||5);
  };
  const secHead = (label, y) => {
    fr(ML, y, CW, 7.5, C.light);
    dl(ML, y, ML, y+7.5, C.accent, 1.3);
    sf('bold', 8, C.accent);
    doc.text(label.toUpperCase(), ML+4, y+5);
    return y+11;
  };
  const kv = (label, value, x, y, lw) => {
    sf('normal',9,C.mid); doc.text(label, x, y);
    sf('normal',9,C.black);
    const lines = doc.splitTextToSize(String(value||'—'), CW-(lw||40)-2);
    doc.text(lines, x+(lw||40), y);
    return y + Math.max(lines.length,1)*5.5;
  };
  const bdg = (text,x,y,bg,tc) => {
    const w = doc.getTextWidth(text)+6;
    doc.setFillColor(...bg); doc.setDrawColor(...bg);
    doc.roundedRect(x,y-3.5,w,5.5,2,2,'F');
    sf('bold',8,tc); doc.text(text,x+3,y);
    return x+w+3;
  };
  const blt = (text,x,y,maxW) => {
    doc.setFillColor(...C.accent); doc.circle(x+1.5,y-1.2,0.9,'F');
    sf('normal',9,C.dark);
    const lines = doc.splitTextToSize(text, (maxW||CW)-6);
    doc.text(lines, x+4.5, y);
    return y+lines.length*5+1;
  };
  const stp = (num,text,x,y,maxW) => {
    doc.setFillColor(...C.accentL); doc.circle(x+2.5,y-1.5,3,'F');
    sf('bold',7.5,C.accent); doc.text(String(num), x+(num<10?1.7:0.9), y-0.2);
    sf('normal',9,C.dark);
    const lines = doc.splitTextToSize(text,(maxW||CW)-8);
    doc.text(lines,x+7,y);
    return y+lines.length*5+1.5;
  };
  const ibox = (lines,x,y,w,bg,lc,tc) => {
    const h = lines.length*5.2+8;
    fr(x,y,w,h,bg); dl(x,y,x,y+h,lc,1.5);
    sf('normal',9,tc||C.dark);
    lines.forEach((ln,i) => doc.text(ln,x+5,y+6+i*5.2));
    return y+h+3;
  };
  const chkPage = (need) => {
    if (Y+(need||30) > PH-18) { doc.addPage(); Y=18; }
  };

  // ── HEADER ──
  fr(0,0,PW,36,C.navy);
  sf('bold',20,C.white); doc.text('TechSupAI',ML,16);
  sf('normal',7.5,[136,153,187]); doc.text('SMART TECHNICAL SUPPORT ASSISTANT',ML,22);
  sf('bold',9,C.accent); doc.text(t.ticketId,PW-MR,14,{align:'right'});
  sf('normal',7.5,[136,153,187]); doc.text(t.dateStr+'  ·  '+t.timeStr,PW-MR,20,{align:'right'});

  // ── STATUS BAR ──
  fr(0,36,PW,14,C.accentL); dl(0,36,PW,36,C.accent,0.5);
  Y=44;
  const cBg = r.confidence==='High'?C.greenL:r.confidence==='Medium'?C.orangeL:C.redL;
  const cCl = r.confidence==='High'?C.green:r.confidence==='Medium'?C.orange:C.red;
  const eBg = r.escalation==='No'?C.greenL:C.orangeL;
  const eCl = r.escalation==='No'?C.green:C.orange;
  sf('bold',7.5,C.mid); doc.text('CONFIDENCE:',ML,Y);
  let bx = bdg(r.confidence,ML+26,Y,cBg,cCl);
  doc.text('ESCALATION:',bx+2,Y);
  bdg(r.escalation,bx+28,Y,eBg,eCl);
  Y=56;

  // ── PRODUCT INFO ──
  Y=secHead('Product Information',Y);
  Y=kv('Product Name',d.productName,ML,Y);
  Y=kv('Brand',d.brand,ML,Y);
  Y=kv('Model Number',d.modelNumber,ML,Y);
  Y=kv('Category',d.productCategory,ML,Y);
  Y=kv('Warranty Status',d.warrantyStatus,ML,Y);
  Y=kv('Urgency Level',d.urgencyLevel,ML,Y);
  Y+=3;

  // ── ISSUE DETAILS ──
  chkPage(55);
  Y=secHead('Issue Details',Y);
  Y=kv('Issue Type',d.issueType,ML,Y);
  Y=kv('Error Code',d.errorCode||'None',ML,Y);
  Y+=2;
  sf('bold',8,C.mid); doc.text('Problem Description',ML,Y); Y+=4;
  const descLines=doc.splitTextToSize(d.problemDescription,CW-4);
  const dh=descLines.length*5+6;
  fr(ML,Y-3,CW,dh,C.light);
  sf('normal',9,C.dark); doc.text(descLines,ML+3,Y+1);
  Y+=dh+4;

  // ── TROUBLESHOOTING STEPS ──
  chkPage(40);
  Y=secHead('Troubleshooting Steps',Y);
  if(r.type==='known'&&r.steps&&r.steps.length){
    r.steps.forEach((s,i)=>{ chkPage(14); Y=stp(i+1,s,ML,Y,CW); });
  } else if(r.type==='safety'){
    chkPage(20);
    Y=ibox(doc.splitTextToSize('SAFETY RISK: Stop using the device immediately. Do not attempt repairs. Disconnect from power and contact an authorized technician.',CW-6),ML,Y,CW,C.redL,C.red,C.red);
  } else {
    chkPage(20);
    Y=ibox(doc.splitTextToSize('Insufficient verified information. Provide more details: error codes, model number, when the issue started, steps already tried.',CW-6),ML,Y,CW,C.orangeL,C.warnBdr,C.dark);
  }
  Y+=3;

  // ── NEXT ACTION ──
  chkPage(25);
  Y=secHead('Recommended Next Action',Y);
  Y=ibox(doc.splitTextToSize(t.nextAction,CW-6),ML,Y,CW,C.accentL,C.accent);

  // ── POSSIBLE CAUSE ──
  if(r.cause){ chkPage(25); Y=secHead('Possible Cause',Y); Y=ibox(doc.splitTextToSize(r.cause,CW-6),ML,Y,CW,C.light,C.mid); }

  // ══ CONCLUSION ══
  chkPage(60);
  Y=secHead('Conclusion',Y);
  buildConclusion(d,r,t).forEach(pt=>{ chkPage(14); Y=blt(pt,ML,Y,CW); });
  Y+=4;

  // ══ PRECAUTIONS ══
  chkPage(60);
  Y=secHead('Precautions & Safety Guidelines',Y);
  buildPrecautions(d,r).forEach(pt=>{ chkPage(14); Y=blt(pt,ML,Y,CW); });
  Y+=4;

  // ── CONTACT ──
  chkPage(30);
  Y=secHead('Contact Information',Y);
  Y=kv('User Email',d.userEmail,ML,Y,45);
  Y=kv('Support Email','TechSupassistantai@gmail.com',ML,Y,45);

  // ── FOOTER (all pages) ──
  const total=doc.internal.getNumberOfPages();
  for(let p=1;p<=total;p++){
    doc.setPage(p);
    fr(0,PH-13,PW,13,C.light); dl(0,PH-13,PW,PH-13,C.border,0.3);
    sf('normal',7.5,C.mid);
    doc.text('Generated by TechSupAI  ·  Smart Technical Support Without Guesswork',ML,PH-5);
    doc.text('Page '+p+' of '+total,PW-MR,PH-5,{align:'right'});
  }

  doc.save('TechSupAI_'+t.ticketId+'.pdf');
  showToast('PDF downloaded!','success');
});

// ── CONCLUSION builder ──
function buildConclusion(d,r,t){
  const prod = d.productName+(d.brand?' ('+d.brand+')':'');
  const base=[
    'This support ticket covers: '+prod+' — Issue: "'+( d.issueType||'Technical Problem')+'".',
    'Ticket '+t.ticketId+' generated on '+t.dateStr+' at '+t.timeStr+'. Urgency: '+d.urgencyLevel+'.',
  ];
  if(r.type==='safety') return [...base,
    'A safety risk was detected. No repair steps were provided to prevent harm.',
    'The device must remain powered off and isolated until inspected by a certified technician.',
    'Escalation is REQUIRED immediately. Warranty status: '+(d.warrantyStatus||'Unknown')+'.',
  ];
  if(r.type==='unknown') return [...base,
    'The issue did not match any verified knowledge base entry — confidence is Low.',
    'No guessed steps were provided. More details (error code, model, steps tried) are needed.',
    'Escalation to an authorized technician or manufacturer support is recommended.',
  ];
  return [...base,
    'Issue matched in knowledge base with Confidence Level: '+r.confidence+'.',
    (r.steps?r.steps.length:0)+' verified troubleshooting steps were provided.',
    r.escalation==='No'
      ? 'This issue is expected to be resolvable through the self-service steps provided.'
      : 'If steps do not resolve the issue, escalation to an authorized service center is advised.',
    'Warranty: '+(d.warrantyStatus||'Unknown')+'. '+(d.warrantyStatus==='Under Warranty'?'User may be eligible for free repair/replacement — verify with manufacturer.':'Out-of-warranty repairs may incur service charges.')+' ',
    'This ticket is saved in Support History and can be used for any follow-up communication.',
  ];
}

// ── PRECAUTIONS builder ──
function buildPrecautions(d,r){
  const gen=[
    'Power off the device before any physical inspection, cleaning, or port access.',
    'Do not disassemble the device yourself — internal repairs require certified technicians.',
    'Keep the device away from moisture, direct sunlight, and extreme heat or cold.',
    'Back up all important data before performing resets or reinstallations.',
    'Use only manufacturer-approved chargers, cables, and accessories.',
  ];
  const cat={
    Laptop:['Place on hard flat surfaces — never on beds or carpets that block air vents.','Remove power adapter before cleaning keyboard or ports.','Do not leave plugged in at 100% for extended periods — damages battery health.'],
    Mobile:['Remove phone case during heavy use or charging for heat dissipation.','Do not charge overnight — unplug at 100% to preserve battery longevity.','Use the original or certified charger — third-party chargers can damage the battery.'],
    Printer:['Always use the power button to turn off — never unplug directly from the wall.','Keep covered when not in use to prevent dust on print heads.','Use manufacturer-recommended ink/toner cartridges only.'],
    'Wi-Fi Router':['Place router in a central, elevated, open location for best signal.','Keep away from microwaves and other wireless devices.','Change the Wi-Fi password regularly and enable WPA2/WPA3 encryption.'],
    Software:['Download software from official or verified sources only.','Create a system restore point before installing new software or updates.','Keep OS and antivirus up to date at all times.'],
    'Home Appliance':['Ensure proper earthing/grounding before use.','Do not use with damaged cords, plugs, or exposed wiring.','Schedule annual servicing by a certified electrician.'],
  };
  if(r.type==='safety') return [
    'CRITICAL: Do not power on the device — keep it off at all times.',
    'Isolate in a ventilated area away from flammable materials.',
    'Do not charge a swollen, smoking, or sparking battery under any circumstances.',
    'Contact an authorized service center or manufacturer emergency support immediately.',
    'If fire or smoke is visible — evacuate the area and call emergency services.',
    ...(cat[d.productCategory]||[]),
  ];
  return [...gen,...(cat[d.productCategory]||['Refer to the product manual for category-specific safety guidelines.','Register your product with the manufacturer to receive safety alerts.'])];
}

// ---- CONTACT SUPPORT ----
document.getElementById('contactSupportBtn').addEventListener('click', () => {
  if (!currentTicket) return;
  const subject = encodeURIComponent(`Support Ticket: ${currentTicket.ticketId} — ${currentTicket.data.issueType}`);
  const body = encodeURIComponent(currentTicket.plainText);
  window.location.href = `mailto:TechSupassistantai@gmail.com?subject=${subject}&body=${body}`;
});

// ---- CLEAR HISTORY ----
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  if (!confirm('Clear all support history? This cannot be undone.')) return;
  localStorage.removeItem('techsupai_history');
  renderHistory();
  showToast('History cleared.');
});

// ---- SAMPLE RECORDS ----
const SAMPLE_RECORDS = [
  {
    productName: 'HP Pavilion 15',
    brand: 'HP',
    modelNumber: '15-da2061TU',
    productCategory: 'Laptop',
    warrantyStatus: 'Under Warranty',
    issueType: 'Not charging',
    errorCode: '',
    problemDescription: 'My HP Pavilion laptop stopped charging yesterday. The charging LED does not light up when I plug it in. I have tried two different power sockets. The laptop works fine on battery but the battery is draining fast. I have not dropped the laptop or spilled anything on it.',
    urgencyLevel: 'High',
    userEmail: 'user.test1@gmail.com'
  },
  {
    productName: 'TP-Link Archer C6',
    brand: 'TP-Link',
    modelNumber: 'Archer C6 V3.2',
    productCategory: 'Wi-Fi Router',
    warrantyStatus: 'Out of Warranty',
    issueType: 'Wi-Fi not working',
    errorCode: '',
    problemDescription: 'My Wi-Fi router keeps disconnecting every 10-15 minutes. All devices in the house lose internet at the same time. The Internet light on the router turns orange and then comes back on after a few minutes. This started 3 days ago after a power cut. I have restarted the router twice already.',
    urgencyLevel: 'Medium',
    userEmail: 'user.test2@gmail.com'
  },
  {
    productName: 'Canon PIXMA MG2570S',
    brand: 'Canon',
    modelNumber: 'MG2570S',
    productCategory: 'Printer',
    warrantyStatus: 'Out of Warranty',
    issueType: 'Printer not printing',
    errorCode: 'B200',
    problemDescription: 'My Canon PIXMA printer is showing as Offline on my Windows 11 PC even though it is connected via USB and powered on. When I try to print a document it gets stuck in the print queue. I have restarted both the printer and the PC but it is still showing offline. The printer lights seem normal.',
    urgencyLevel: 'Medium',
    userEmail: 'user.test3@gmail.com'
  },
  {
    productName: 'Samsung Galaxy M32',
    brand: 'Samsung',
    modelNumber: 'SM-M325FV',
    productCategory: 'Mobile',
    warrantyStatus: 'Under Warranty',
    issueType: 'Overheating',
    errorCode: '',
    problemDescription: 'My Samsung Galaxy M32 gets extremely hot while charging, especially when I am using it at the same time. The phone has become uncomfortably warm to hold. Battery is draining faster than before. I noticed this started after the last Android update about a week ago. No burning smell but it is very hot.',
    urgencyLevel: 'High',
    userEmail: 'user.test4@gmail.com'
  },
  {
    productName: 'Microsoft Office 2021',
    brand: 'Microsoft',
    modelNumber: 'Office Home & Student 2021',
    productCategory: 'Software',
    warrantyStatus: 'Unknown',
    issueType: 'Software installation issue',
    errorCode: '0x80070005',
    problemDescription: 'I am trying to install Microsoft Office 2021 on my Windows 10 laptop but the installation keeps failing at 64% with error code 0x80070005. I have tried running the installer as administrator but it still fails. My laptop has 8GB RAM and 50GB free storage. My antivirus is Avast and it is currently active.',
    urgencyLevel: 'Critical',
    userEmail: 'user.test5@gmail.com'
  }
];

// ---- SAMPLE DROPDOWN LOGIC ----
const sampleDropBtn = document.getElementById('sampleDropBtn');
const sampleDropdown = document.getElementById('sampleDropdown');

sampleDropBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sampleDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => sampleDropdown.classList.add('hidden'));

document.querySelectorAll('.sample-item').forEach(item => {
  item.addEventListener('click', () => {
    const idx = parseInt(item.dataset.idx);
    const rec = SAMPLE_RECORDS[idx];
    // Fill all form fields
    document.getElementById('productName').value = rec.productName;
    document.getElementById('brand').value = rec.brand;
    document.getElementById('modelNumber').value = rec.modelNumber;
    document.getElementById('productCategory').value = rec.productCategory;
    document.getElementById('warrantyStatus').value = rec.warrantyStatus;
    document.getElementById('issueType').value = rec.issueType;
    document.getElementById('errorCode').value = rec.errorCode;
    document.getElementById('problemDescription').value = rec.problemDescription;
    document.getElementById('urgencyLevel').value = rec.urgencyLevel;
    document.getElementById('userEmail').value = rec.userEmail;
    // Clear any validation errors
    document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
    document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
    sampleDropdown.classList.add('hidden');
    showToast(`Sample loaded: ${rec.productName}`, 'success');
    // Scroll to form top
    document.getElementById('support').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---- INIT ----
renderHistory();

/* =====================================================
   RAG-INTEGRATED AI ASSISTANT
   Architecture:
   1. User query → local retriever finds best KB chunks
   2. Retrieved chunks injected as context into prompt
   3. Claude claude-sonnet-4-20250514 answers ONLY from context
   4. Safety layer runs before every API call
===================================================== */

// ── RAG DOCUMENT STORE ──────────────────────────────
// Each document is a chunk of the knowledge base.
// In a real system these would be embedded vectors;
// here we do lightweight keyword-cosine similarity.
const RAG_DOCUMENTS = [
  {
    id: 'charging',
    tags: ['charging','not charging','battery','charger','adapter','port','plugged in'],
    content: `ISSUE: Device not charging.
CAUSE: Faulty power adapter, damaged cable, dirty charging port, or battery management issue.
STEPS:
1. Check the power socket works with another device.
2. Inspect cable & adapter for damage, fraying, or bent pins.
3. Clean the charging port with a dry toothbrush or compressed air.
4. Try a different compatible charger or cable.
5. Perform a soft restart.
6. On laptops — update battery driver or check battery health settings.
7. If still failing, port or battery needs hardware inspection.
SAFETY: If swollen battery or burning smell — STOP immediately, do not charge.
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'wifi',
    tags: ['wifi','wi-fi','internet','router','network','disconnecting','no internet','connection'],
    content: `ISSUE: Wi-Fi not working or keeps disconnecting.
CAUSE: Router/modem fault, incorrect network settings, IP conflict, or ISP outage.
STEPS:
1. Restart the router & modem — unplug 30 seconds, plug back in.
2. Check if other devices can connect to the same network.
3. Forget the Wi-Fi network and reconnect with the password.
4. Check router indicator lights — red/off Internet light = ISP issue.
5. Move closer to the router to rule out distance issues.
6. Disable and re-enable Wi-Fi on the device.
7. If only your device fails — restart it or reset network settings.
8. If no device works — contact ISP.
CONFIDENCE: High | ESCALATION: Maybe`
  },
  {
    id: 'printer',
    tags: ['printer','printing','print','ink','toner','paper jam','offline','queue'],
    content: `ISSUE: Printer not printing or showing offline.
CAUSE: Empty ink/toner, paper jam, stuck print queue, or lost connection.
STEPS:
1. Check the paper tray is loaded correctly and not jammed.
2. Check ink or toner levels from settings or companion app.
3. Open print queue, cancel all pending/stuck jobs, retry.
4. Restart the printer — off 30 seconds, then on.
5. USB: unplug & re-plug. Wi-Fi: ensure both devices are on same network.
6. Print a test page from the printer control panel.
7. Update/reinstall the printer driver from manufacturer website.
8. Ensure correct default printer is selected.
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'overheating',
    tags: ['overheating','hot','overheat','temperature','heating','warm','fan','thermal'],
    content: `ISSUE: Device overheating.
CAUSE: Blocked vents, heavy background processes, outdated firmware, or failing cooling system.
STEPS:
1. Close all unnecessary background apps.
2. Remove phone case / ensure laptop has ventilation clearance.
3. Do not use on soft surfaces (bed, couch) that block vents.
4. Check for and install software or firmware updates.
5. Avoid charging while running heavy tasks.
6. Run a malware scan — malware can spike CPU load.
7. For laptops, clean fan vents with compressed air (don't open device).
8. Let the device cool down before resuming use.
SAFETY: Battery swelling, burning smell, or smoke → STOP using immediately.
CONFIDENCE: Medium | ESCALATION: Maybe`
  },
  {
    id: 'software_install',
    tags: ['install','installation','setup','software','error code','administrator','antivirus','driver'],
    content: `ISSUE: Software installation failing or setup errors.
CAUSE: Insufficient storage, incompatible system requirements, permission issues, or corrupted installer.
STEPS:
1. Verify system requirements match your device specs.
2. Free up storage — need at least 2x installer file size available.
3. Right-click installer → Run as Administrator (Windows).
4. Temporarily disable antivirus (trusted software only), retry install.
5. Restart device and retry installation.
6. Delete installer and re-download from official source only.
7. Ensure system date & time are correct — wrong time causes cert errors.
8. Search the specific error code on the official support page.
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'not_turning_on',
    tags: ['wont turn on','not turning on','dead','black screen','no power','power button','boot'],
    content: `ISSUE: Device won't turn on.
CAUSE: Drained battery, failed power button, software crash, or hardware fault.
STEPS:
1. Connect to power source, charge for at least 30 minutes before trying again.
2. Laptop: remove battery (if removable), hold power button 15 sec, reinsert, retry.
3. Force/hard restart — hold power button 10-15 seconds.
4. Verify power adapter and cable are working.
5. Check LED indicator lights up when plugged in.
6. Desktop: confirm power cable firmly connected at outlet and PSU.
7. Connect external monitor — device may be on but screen is dead.
CONFIDENCE: Medium | ESCALATION: Maybe`
  },
  {
    id: 'login',
    tags: ['login','password','sign in','locked out','account','2fa','authentication','forgot password'],
    content: `ISSUE: Can't log in / account access problem.
CAUSE: Forgotten credentials, account lockout, 2FA issues, or browser cache problems.
STEPS:
1. Use "Forgot Password" / "Reset Password" on the login page.
2. Check Caps Lock is off — passwords are case-sensitive.
3. Clear browser cache and cookies, retry.
4. Try a different browser or incognito/private window.
5. Confirm you're using the correct email address for the account.
6. 2FA not arriving — check spam folder, verify phone number is correct.
7. Account locked — wait 15-30 minutes before trying again.
8. Contact the platform's official support if all else fails.
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'error_codes',
    tags: ['error code','0x','error number','bsod','blue screen','crash','error message'],
    content: `ISSUE: Specific error code or crash message shown.
CAUSE: Error codes indicate system, software, or hardware faults specific to the product.
STEPS:
1. Note the exact error code shown on screen.
2. Restart device and check if error reappears.
3. Search the error code on the official manufacturer support site.
4. Check for pending system or software updates.
5. Reinstall related software or driver if applicable.
6. If error appeared after an update, consider rolling it back.
7. Contact official support with the exact error code.
CONFIDENCE: Medium | ESCALATION: Maybe`
  },
  {
    id: 'bluetooth',
    tags: ['bluetooth','pairing','headphones','speaker','earbuds','airpods','not connecting','bt'],
    content: `ISSUE: Bluetooth device not connecting or pairing.
CAUSE: Device not in pairing mode, interference, outdated drivers, or too many saved devices.
STEPS:
1. Turn Bluetooth OFF and ON again on both devices.
2. Put the accessory in pairing mode (usually hold power button 5-10 sec until LED flashes).
3. Remove/forget the device from Bluetooth settings and pair fresh.
4. Ensure devices are within 10 metres with no obstacles.
5. Check for interference from other devices (microwaves, other Bluetooth).
6. Update Bluetooth driver (Windows Device Manager) or firmware.
7. Clear paired device list on the accessory (factory reset the accessory).
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'slow_performance',
    tags: ['slow','lagging','sluggish','freeze','freezing','hanging','performance','speed','ram'],
    content: `ISSUE: Device running slow, lagging, or freezing.
CAUSE: Insufficient RAM, too many startup programs, full storage, malware, or thermal throttling.
STEPS:
1. Restart the device — this clears RAM and temp files.
2. Check storage space — keep at least 15% free on the drive.
3. Open Task Manager / Activity Monitor — close high CPU or RAM processes.
4. Disable unnecessary startup programs.
5. Run a malware/virus scan with up-to-date definitions.
6. Check for and install OS updates.
7. For laptops — clean vents (overheating causes thermal throttling and slowdowns).
8. Consider adding more RAM or upgrading to SSD if hardware is old.
CONFIDENCE: High | ESCALATION: No`
  },
  {
    id: 'display',
    tags: ['display','screen','monitor','flickering','black screen','brightness','resolution','pixels'],
    content: `ISSUE: Display/screen problems — flickering, black screen, resolution issues.
CAUSE: Loose cable, driver fault, refresh rate mismatch, or hardware damage.
STEPS:
1. Check all display cables (HDMI/DisplayPort/VGA) are firmly connected.
2. Restart the device — a fresh boot often resolves driver glitches.
3. Update or roll back display/graphics drivers.
4. Check display refresh rate settings — match to monitor's native rate.
5. Test with a different cable or a different monitor/display.
6. Adjust brightness and color settings in display preferences.
7. Boot into Safe Mode — if issue is absent, it's a software/driver problem.
SAFETY: Do not open the display panel yourself — contains fragile components and high voltage (CFL backlights).
CONFIDENCE: Medium | ESCALATION: Maybe`
  },
  {
    id: 'audio',
    tags: ['audio','sound','speakers','microphone','no sound','headphone','muted','volume'],
    content: `ISSUE: No sound, distorted audio, or microphone not working.
CAUSE: Wrong output device selected, muted system, driver fault, or hardware damage.
STEPS:
1. Check volume is not muted at system level, app level, and physical knob/button.
2. Right-click sound icon → check correct output device is selected.
3. Unplug and re-plug headphones or speakers.
4. Update or reinstall audio drivers from Device Manager or manufacturer site.
5. Run the Windows Audio Troubleshooter (Settings → Troubleshoot → Audio).
6. Test with a different audio app to isolate the issue.
7. For microphone: check app permissions (Settings → Privacy → Microphone).
CONFIDENCE: High | ESCALATION: No`
  }
];

// ── SAFETY KEYWORDS (same as form, reused for chat) ─
const CHAT_RISKY_KEYWORDS = [
  'burning smell','smoke','spark','sparks','battery swelling','swollen battery',
  'electric shock','exposed wire','overheating badly','liquid damage','water damage',
  'caught fire','on fire','melting','explosion','burst','fire hazard'
];

// ── RAG RETRIEVER ────────────────────────────────────
// Simple TF-IID keyword overlap — returns top-N chunks
function ragRetrieve(query, topN = 3) {
  const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const scored = RAG_DOCUMENTS.map(doc => {
    // Score: tag matches × 3  +  content word matches × 1
    const tagScore = doc.tags.reduce((s, t) => {
      return s + (qWords.some(w => t.includes(w) || w.includes(t)) ? 3 : 0);
    }, 0);
    const contentWords = doc.content.toLowerCase().split(/\W+/);
    const contentScore = qWords.reduce((s, w) => {
      return s + (contentWords.filter(cw => cw === w).length);
    }, 0);
    return { doc, score: tagScore + contentScore };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(s => s.doc);
}

// ── SESSION STORAGE FOR API KEY ──────────────────────
function getApiKey() { return sessionStorage.getItem('tsai_api_key') || ''; }
function setApiKey(k) { sessionStorage.setItem('tsai_api_key', k); }
function clearApiKey() { sessionStorage.removeItem('tsai_api_key'); }

// ── CHAT STATE ───────────────────────────────────────
let chatHistory = []; // [{role, content}]

// ── API KEY CONNECT ──────────────────────────────────
document.getElementById('saveApiKey').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key.startsWith('sk-ant-')) {
    showToast('Invalid key format. Must start with sk-ant-', 'error'); return;
  }
  setApiKey(key);
  showChatUI();
  showToast('Connected! AI assistant is ready.', 'success');
});

document.getElementById('apiKeyInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('saveApiKey').click();
});

function showChatUI() {
  document.getElementById('apiKeyBar').classList.add('hidden');
  document.getElementById('chatContainer').classList.remove('hidden');
}

// Auto-restore key on load
if (getApiKey()) showChatUI();

// ── DISCONNECT ───────────────────────────────────────
document.getElementById('disconnectBtn').addEventListener('click', () => {
  clearApiKey();
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatContainer').classList.add('hidden');
  document.getElementById('apiKeyBar').classList.remove('hidden');
  document.getElementById('apiKeyInput').value = '';
  showToast('API key removed from session.');
});

// ── CLEAR CHAT ───────────────────────────────────────
document.getElementById('clearChatBtn').addEventListener('click', () => {
  chatHistory = [];
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = `
    <div class="chat-msg ai-msg">
      <div class="msg-avatar">✦</div>
      <div class="msg-bubble">
        <p>Chat cleared. Ask me anything about your tech issue!</p>
      </div>
    </div>`;
  showToast('Chat cleared.');
});

// ── SUGGESTED QUERIES ────────────────────────────────
document.querySelectorAll('.sq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('chatInput').value = btn.dataset.q;
    sendChatMessage();
    document.getElementById('suggestedQueries').style.display = 'none';
  });
});

// ── SEND BUTTON ──────────────────────────────────────
document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});

// Auto-resize textarea
document.getElementById('chatInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 140) + 'px';
});

// ── MAIN SEND FUNCTION ───────────────────────────────
async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;
  if (!getApiKey()) { showToast('Please connect your API key first.', 'error'); return; }

  input.value = '';
  input.style.height = 'auto';
  document.getElementById('suggestedQueries').style.display = 'none';

  // Append user message
  appendChatMsg('user', query);
  chatHistory.push({ role: 'user', content: query });

  // Safety check FIRST
  const lowerQ = query.toLowerCase();
  const riskWord = CHAT_RISKY_KEYWORDS.find(kw => lowerQ.includes(kw));
  if (riskWord) {
    const safetyReply = `⚠️ **Safety Alert**: Your message contains a potentially dangerous situation ("${riskWord}"). **Stop using the device immediately.** Do not attempt any repairs. Disconnect from power if safe to do so and contact an authorized technician or emergency support right away.`;
    appendChatMsg('ai', safetyReply);
    chatHistory.push({ role: 'assistant', content: safetyReply });
    return;
  }

  // ── STEP 1: RAG Retrieval ─────────────────────────
  showRagIndicator(true);
  const retrieved = ragRetrieve(query, 3);

  // ── STEP 2: Build context from retrieved docs ──────
  const ragContext = retrieved.length > 0
    ? retrieved.map((d, i) => `[Knowledge Base Entry ${i+1}]\n${d.content}`).join('\n\n---\n\n')
    : null;

  // ── STEP 3: Build system prompt with RAG context ───
  const systemPrompt = `You are TechSupAI, a technical support assistant. You MUST follow these rules strictly:

RULE 1 — RAG-GROUNDED ONLY: Answer ONLY using the knowledge base context provided below. Do not use outside knowledge or make up troubleshooting steps.

RULE 2 — NO HALLUCINATION: If the user's issue does not match any context provided, say exactly: "I don't have verified information for this specific issue. Please use the Support Form to generate a ticket or contact support directly."

RULE 3 — SAFETY FIRST: If ANY message mentions burning smell, smoke, sparks, swollen battery, electric shock, exposed wires, liquid damage, or fire — immediately respond with a safety warning and do not provide repair steps.

RULE 4 — STRUCTURED RESPONSE: When you have matching context, format your answer with:
• **Possible Cause** — brief explanation
• **Step-by-Step Fix** — numbered steps from the knowledge base
• **Escalation** — Yes/No/Maybe with a reason

RULE 5 — HONEST CONFIDENCE: End every answer with a confidence line: "Confidence: High / Medium / Low" based on how well the context matched the question.

${ragContext ? `=== RETRIEVED KNOWLEDGE BASE CONTEXT ===\n\n${ragContext}\n\n=== END CONTEXT ===` : '=== NO MATCHING CONTEXT FOUND ===\nNo relevant knowledge base entries were retrieved for this query. Apply Rule 2.'}`;

  // Build messages array for API
  const messages = [
    ...chatHistory.slice(0, -1), // all except the just-added user msg
    { role: 'user', content: query }
  ];

  // ── STEP 4: Call Claude API ────────────────────────
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    showRagIndicator(false);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.error?.message || `API error ${response.status}`;
      appendChatMsg('ai', `⚠️ API Error: ${msg}`, true);
      chatHistory.push({ role: 'assistant', content: `Error: ${msg}` });
      return;
    }

    const data = await response.json();
    const aiText = data.content?.[0]?.text || 'No response received.';

    // Format markdown-like bold and bullets
    const formatted = formatAIResponse(aiText);
    appendChatMsg('ai', formatted, false, retrieved.length > 0 ? retrieved.map(d => d.id) : []);
    chatHistory.push({ role: 'assistant', content: aiText });

    // Keep chat history to last 10 turns
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  } catch (err) {
    showRagIndicator(false);
    appendChatMsg('ai', `⚠️ Network error: ${err.message}. Check your API key and internet connection.`, true);
  }
}

// ── FORMAT AI RESPONSE ───────────────────────────────
function formatAIResponse(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="ai-step"><span class="ai-step-num">$1</span><span>$2</span></div>')
    .replace(/^• (.+)$/gm, '<div class="ai-bullet">• $1</div>')
    .replace(/^— (.+)$/gm, '<div class="ai-bullet">— $1</div>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// ── APPEND CHAT MESSAGE ──────────────────────────────
function appendChatMsg(role, content, isError = false, retrievedIds = []) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'user' ? 'user-msg' : 'ai-msg'}${isError ? ' error-msg-chat' : ''}`;

  const ragTag = (role === 'ai' && retrievedIds.length > 0)
    ? `<div class="rag-source-tag">📚 RAG: ${retrievedIds.join(', ')}</div>`
    : '';

  if (role === 'user') {
    div.innerHTML = `<div class="msg-bubble user-bubble">${escapeHTML(content)}</div><div class="msg-avatar user-avatar">You</div>`;
  } else {
    div.innerHTML = `
      <div class="msg-avatar">✦</div>
      <div class="msg-bubble">
        <p>${content}</p>
        ${ragTag}
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="prefillForm('${escapeHTML(content).replace(/'/g, '&apos;')}')">📋 Fill Support Form</button>
        </div>
      </div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── RAG INDICATOR ────────────────────────────────────
function showRagIndicator(show) {
  const ind = document.getElementById('ragIndicator');
  if (show) {
    ind.classList.remove('hidden');
    // Also add typing indicator bubble
    const msgs = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.id = 'typingIndicator';
    typing.className = 'chat-msg ai-msg';
    typing.innerHTML = `<div class="msg-avatar">✦</div><div class="msg-bubble typing-bubble"><span></span><span></span><span></span></div>`;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  } else {
    ind.classList.add('hidden');
    document.getElementById('typingIndicator')?.remove();
  }
}

// ── PREFILL FORM ─────────────────────────────────────
function prefillForm(aiContent) {
  document.getElementById('support').scrollIntoView({ behavior: 'smooth' });
  // Extract issue type hint from content
  const lower = aiContent.toLowerCase();
  const issueMap = {
    'charging': 'Not charging',
    'wifi': 'Wi-Fi not working',
    'wi-fi': 'Wi-Fi not working',
    'printer': 'Printer not printing',
    'overheat': 'Overheating',
    'install': 'Software installation issue',
    'turn on': 'Not turning on',
    'login': 'Login issue',
    'error code': 'Error code issue'
  };
  for (const [kw, val] of Object.entries(issueMap)) {
    if (lower.includes(kw)) {
      const sel = document.getElementById('issueType');
      if (sel) { for (const opt of sel.options) { if (opt.value === val) { sel.value = val; break; } } }
      break;
    }
  }
  showToast('Scrolled to Support Form. Fill in your details.', 'success');
}

// ── ESCAPE HTML ──────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
