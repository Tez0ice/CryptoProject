// --- STATE MANAGEMENT ---
// Loads previous score and solved missions from browser memory
let score = parseInt(localStorage.getItem('scytaleScore')) || 0;
const solved = JSON.parse(localStorage.getItem('scytaleSolved')) || { 1: false, 2: false };
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let activeInput = 'plain'; 

// "Rainbow Table" Database for Module 2
const rainbowDB = {
    '2F1A': 'HELLO',
    '3B4C': 'PASSWORD123',
    '4E2D': 'ADMIN',
    '5A1F': 'WELCOME',
    '6C3B': 'CRYPTO',
    '7F3A': 'FLAG_SECURE'
};

// --- INITIALIZATION ---
window.onload = function() {
    // Restore score
    document.getElementById('scoreVal').innerText = score;
    
    // Initialize Caesar Wheel and inputs
    updateFromPlain();
    
    // Populate Hash Database
    renderDB();
    
    // Disable solved missions visually
    if(solved[1]) markSolved(1);
    if(solved[2]) markSolved(2);
};

// --- NAVIGATION SYSTEM ---
function switchTab(id) {
    // 1. Hide all module content
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    
    // 2. Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // 3. Show the selected module
    document.getElementById(id).classList.add('active');
    
    // 4. Highlight the correct tab button
    const btns = document.querySelectorAll('.tab-btn');
    if(id === 'mod1') btns[0].classList.add('active'); // Caesar
    if(id === 'mod2') btns[1].classList.add('active'); // Hashing
    if(id === 'mod3') btns[2].classList.add('active'); // Missions
}

// ==========================================
// MODULE 1: CAESAR CIPHER LOGIC
// ==========================================

function setFocus(type) { activeInput = type; }

function handleSliderChange() {
    const shift = document.getElementById('shiftSlider').value;
    document.getElementById('shiftVal').innerText = shift;
    
    // Update the visual wheel
    renderWheel(parseInt(shift));
    
    // Update the text boxes based on which one the user was last typing in
    if(activeInput === 'cipher') updateFromCipher();
    else updateFromPlain();
}

function renderWheel(shift) {
    const display = document.getElementById('wheelDisplay');
    let r1 = "", r2 = "";
    
    for(let i=0; i<26; i++) {
        let char = alphabet[i];
        let shiftChar = alphabet[(i + shift) % 26]; // The math behind the shift
        r1 += `<div class="wheel-cell">${char}</div>`;
        r2 += `<div class="wheel-cell active">${shiftChar}</div>`;
    }
    
    display.innerHTML = `
        <div class="wheel-row"><div class="wheel-cell" style="width:60px; border:none;">IN:</div>${r1}</div>
        <div class="wheel-row"><div class="wheel-cell" style="width:60px; border:none;">OUT:</div>${r2}</div>
    `;
}

// Encrypt: Real Text -> Scrambled
function updateFromPlain() {
    const shift = parseInt(document.getElementById('shiftSlider').value);
    const plain = document.getElementById('caesarPlain').value.toUpperCase();
    let cipher = "";
    
    for(let char of plain) {
        const idx = alphabet.indexOf(char);
        if(idx === -1) {
            cipher += char; // Keep symbols/spaces as is
        } else {
            cipher += alphabet[(idx + shift) % 26];
        }
    }
    document.getElementById('caesarCipher').value = cipher;
}

// Decrypt: Scrambled -> Real Text
function updateFromCipher() {
    const shift = parseInt(document.getElementById('shiftSlider').value);
    const cipher = document.getElementById('caesarCipher').value.toUpperCase();
    let plain = "";

    for(let char of cipher) {
        const idx = alphabet.indexOf(char);
        if(idx === -1) { 
            plain += char; 
        } else {
            // Handle wrapping backwards (A minus 1 = Z)
            let rawIndex = (idx - shift) % 26;
            let correctedIndex = (rawIndex + 26) % 26;
            plain += alphabet[correctedIndex];
        }
    }
    document.getElementById('caesarPlain').value = plain;
}

// *** STUDENT DRILL CHECKER ***
// Provides instant visual feedback (Green/Red)
function checkDrill() {
    const inputEl = document.getElementById('drillInput');
    const val = inputEl.value.toUpperCase().trim();
    const fb = document.getElementById('drillFeedback');
    
    // Clear previous states
    inputEl.classList.remove('success', 'error');

    if(val === "HELLO WORLD") {
        inputEl.classList.add('success');
        fb.innerHTML = "<span style='color:var(--green)'>✓ CORRECT! You cracked the code.</span>";
    } else if(val.length > 5 && val !== "HELLO WORLD") {
        inputEl.classList.add('error');
        fb.innerHTML = "<span style='color:var(--red)'>❌ INCORRECT. Check your Shift Key (Should be 3).</span>";
    } else {
        fb.innerHTML = ""; // Clear if user deletes text
    }
}

// ==========================================
// MODULE 2: HASHING LOGIC
// ==========================================

// Simple simulation of a hash algorithm (Not real security, just for education)
function computeHash(text) {
    if(!text) return "0000";
    let sum = 0;
    for(let i=0; i<text.length; i++) sum += text.charCodeAt(i) * (i+1);
    return (sum % 10000).toString(16).toUpperCase().padStart(4, '0');
}

function generateHash() {
    const text = document.getElementById('hashInput').value.toUpperCase().trim();
    const hash = computeHash(text);
    document.getElementById('hashResult').innerText = hash;
    
    // Add to the "Rainbow Table" automatically to show how hackers build databases
    if(text.length > 0) {
        rainbowDB[hash] = text;
        renderDB();
    }
}

function renderDB() {
    const list = document.getElementById('rainbowList');
    let html = "";
    const keys = Object.keys(rainbowDB).reverse(); // Show newest first
    
    for(let k of keys) {
        if(k === '7F3A') continue; // Hide the secret flag from the list!
        html += `<div class="db-row"><span style="color:var(--gold)">${k}</span><span>${rainbowDB[k]}</span></div>`;
    }
    list.innerHTML = html;
}

function lookupHash() {
    const q = document.getElementById('lookupInput').value.toUpperCase().trim();
    const res = document.getElementById('lookupResult');
    
    if(rainbowDB[q]) {
        res.innerHTML = `<span style="color:var(--green)">✓ MATCH FOUND: "${rainbowDB[q]}"</span>`;
    } else {
        res.innerHTML = `<span style="color:var(--red)">❌ NO MATCH IN DATABASE</span>`;
    }
}

// ==========================================
// MODULE 3: CTF MISSIONS
// ==========================================

function toggleHint(id) {
    document.getElementById(`hint${id}`).classList.toggle('hidden');
}

function submitFlag(id) {
    if(solved[id]) return; // Stop if already solved
    
    const val = document.getElementById(`flag${id}`).value.trim();
    const inputEl = document.getElementById(`flag${id}`);
    
    // The correct answers
    let correct = (id === 1) ? "CRYPTO_MASTER_2024" : "FLAG_SECURE";
    
    if(val === correct) {
        // --- SUCCESS SEQUENCE ---
        score += 50;
        solved[id] = true;
        
        // Save progress
        localStorage.setItem('scytaleScore', score);
        localStorage.setItem('scytaleSolved', JSON.stringify(solved));
        
        // Update UI
        document.getElementById('scoreVal').innerText = score;
        markSolved(id);
        
        alert("🎉 MISSION ACCOMPLISHED! +50 XP ADDED");
        fireConfetti(); // Reward animation
        
    } else {
        // --- FAILURE SEQUENCE ---
        alert("⛔ ACCESS DENIED. Incorrect Flag.");
        
        // Shake animation for feedback
        inputEl.classList.add('error');
        setTimeout(() => inputEl.classList.remove('error'), 500);
    }
}

function markSolved(id) {
    document.getElementById(`chall${id}`).classList.add('solved');
    const input = document.getElementById(`flag${id}`);
    input.value = "MISSION COMPLETE";
    input.disabled = true;
    input.classList.add('success');
}

// ==========================================
// SYSTEM & UI EXTRAS
// ==========================================

// Reset Button Logic (Connected to the Danger Zone button)
function resetGame() {
    if(confirm("⚠ WARNING AGENT ⚠\n\nAre you sure you want to reset your mission progress? All XP will be lost.")) {
        localStorage.removeItem('scytaleScore');
        localStorage.removeItem('scytaleSolved');
        location.reload();
    }
}

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.classList.toggle('open');
    
    if(widget.classList.contains('open')) {
        setTimeout(() => document.getElementById('chatInput').focus(), 100);
    }
}

// Confetti Animation for Success
function fireConfetti() {
    const colors = ['#06b6d4', '#22c55e', '#fbbf24'];
    for(let i=0; i<60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.top = '-10px';
        c.style.background = colors[Math.floor(Math.random()*3)];
        c.style.transform = `rotate(${Math.random()*360}deg)`;
        
        const duration = Math.random() * 2 + 2;
        c.style.transition = `top ${duration}s ease-in, transform ${duration}s linear`;
        
        document.body.appendChild(c);
        setTimeout(() => { 
            c.style.top = '110vh'; 
            c.style.transform = `rotate(${Math.random()*720}deg)`; 
        }, 100);
        setTimeout(() => c.remove(), duration * 1000);
    }
}

// ==========================================
// AI CHATBOT (MENTOR MODE)
// ==========================================
async function sendChat() {
    const inp = document.getElementById('chatInput');
    const txt = inp.value.trim();
    if(!txt) return;

    // Display user message
    const box = document.getElementById('chatBox');
    box.innerHTML += `<div class="msg user">${txt}</div>`;
    inp.value = "";
    
    // Loading indicator
    const loadId = "load"+Date.now();
    box.innerHTML += `<div id="${loadId}" class="msg ai">...analyzing...</div>`;
    box.scrollTop = box.scrollHeight;

    try {
        // 1. Try to fetch from real backend
        const res = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: txt})
        });
        const data = await res.json();
        document.getElementById(loadId).innerText = data.reply;
    } catch(e) {
        // 2. Offline Fallback (Educational Responses)
        let reply = "I'm having trouble connecting to HQ. Try asking basic questions.";
        const t = txt.toLowerCase();
        
        if(t.includes("hello") || t.includes("hi")) {
            reply = "Greetings, Agent! Ready to learn about secret codes?";
        }
        else if(t.includes("caesar") || t.includes("shift")) {
            reply = "The Caesar Cipher is like a secret decoder ring. If you shift by 1, A becomes B!";
        }
        else if(t.includes("hash")) {
            reply = "A Hash is a digital fingerprint. It proves who you are without revealing your secrets.";
        }
        else if(t.includes("hint") || t.includes("help") || t.includes("flag")) {
            reply = "Stuck? Look for the 'NEED A HINT?' button on the mission cards in Tab 3.";
        }
        else if(t.includes("drill")) {
            reply = "For the drill, try setting the Shift Slider to 3. Then see what happens to the letters.";
        }
        
        document.getElementById(loadId).innerText = reply;
    }
    box.scrollTop = box.scrollHeight;
}