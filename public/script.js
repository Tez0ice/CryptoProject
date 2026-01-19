   // --- STATE ---
    let score = parseInt(localStorage.getItem('scytaleScore')) || 0;
    const solved = JSON.parse(localStorage.getItem('scytaleSolved')) || { 1: false, 2: false };
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let activeInput = 'plain'; // Tracks if user is typing in 'plain' or 'cipher' for slider logic
    
    const rainbowDB = {
        '2F1A': 'HELLO',
        '3B4C': 'PASSWORD123',
        '4E2D': 'ADMIN',
        '5A1F': 'WELCOME',
        '6C3B': 'CRYPTO',
        '7F3A': 'FLAG_SECURE'
    };

    window.onload = function() {
        document.getElementById('scoreVal').innerText = score;
        updateFromPlain(); // Init default
        renderDB();
        
        if(solved[1]) markSolved(1);
        if(solved[2]) markSolved(2);
    };

    function switchTab(id) {
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        
        const btns = document.querySelectorAll('.tab-btn');
        if(id === 'mod1') btns[0].classList.add('active');
        if(id === 'mod2') btns[1].classList.add('active');
        if(id === 'mod3') btns[2].classList.add('active');
    }

    // --- MODULE 1: CAESAR (FIXED DECRYPTION) ---
    
    function setFocus(type) {
        activeInput = type;
    }

    function handleSliderChange() {
        const shift = document.getElementById('shiftSlider').value;
        document.getElementById('shiftVal').innerText = shift;
        renderWheel(parseInt(shift));

        // Smart Update: If user was decrypting (typing in Cipher), update Plain.
        // If user was encrypting (typing in Plain), update Cipher.
        if(activeInput === 'cipher') {
            updateFromCipher();
        } else {
            updateFromPlain();
        }
    }

    function renderWheel(shift) {
        const display = document.getElementById('wheelDisplay');
        let r1 = "", r2 = "";
        
        for(let i=0; i<26; i++) {
            let char = alphabet[i];
            let shiftChar = alphabet[(i + shift) % 26];
            r1 += `<div class="wheel-cell">${char}</div>`;
            r2 += `<div class="wheel-cell active">${shiftChar}</div>`;
        }
        display.innerHTML = `<div class="wheel-row"><div class="wheel-cell" style="border:none; width:60px;">IN:</div>${r1}</div>
                             <div class="wheel-row"><div class="wheel-cell" style="border:none; width:60px;">OUT:</div>${r2}</div>`;
    }

    // ENCRYPT: Plaintext + Shift -> Ciphertext
    function updateFromPlain() {
        const shift = parseInt(document.getElementById('shiftSlider').value);
        const plain = document.getElementById('caesarPlain').value.toUpperCase();
        let cipher = "";
        
        for(let char of plain) {
            const idx = alphabet.indexOf(char);
            if (idx === -1) {
                cipher += char;
            } else {
                cipher += alphabet[(idx + shift) % 26];
            }
        }
        document.getElementById('caesarCipher').value = cipher;
    }

    // DECRYPT: Ciphertext - Shift -> Plaintext
    function updateFromCipher() {
        const shift = parseInt(document.getElementById('shiftSlider').value);
        const cipher = document.getElementById('caesarCipher').value.toUpperCase();
        let plain = "";

        for(let char of cipher) {
            const idx = alphabet.indexOf(char);
            if(idx === -1) {
                plain += char;
            } else {
                // FIXED MATH: Correctly handle negative modulo
                // (Index - Shift) might be negative.
                // Example: A (0) - 3 = -3.   (-3 % 26) is -3 in JS.
                // Formula: ((x % n) + n) % n
                
                let rawIndex = (idx - shift) % 26;
                let correctedIndex = (rawIndex + 26) % 26;
                
                plain += alphabet[correctedIndex];
            }
        }
        document.getElementById('caesarPlain').value = plain;
    }

    function checkDrill() {
        const val = document.getElementById('drillInput').value.toUpperCase();
        const fb = document.getElementById('drillFeedback');
        if(val.includes("HELLO") || val.includes("WORLD")) {
            fb.innerHTML = "<span style='color:var(--green)'>✓ CORRECT: ENGLISH DETECTED</span>";
        } else {
            fb.innerHTML = "<span style='color:var(--red)'>...analyzing...</span>";
        }
    }

    // --- MODULE 2: HASHING ---

    function computeHash(text) {
        if(!text) return "0000";
        let sum = 0;
        for(let i=0; i<text.length; i++) {
            sum += text.charCodeAt(i) * (i+1);
        }
        return (sum % 10000).toString(16).toUpperCase().padStart(4, '0');
    }

    function generateHash() {
        const text = document.getElementById('hashInput').value.toUpperCase().trim();
        const hash = computeHash(text);
        document.getElementById('hashResult').innerText = hash;

        if(text.length > 0) {
            // Add to local DB (Memory only)
            rainbowDB[hash] = text;
            renderDB();
        }
    }

    function renderDB() {
        const list = document.getElementById('rainbowList');
        let html = "";
        
        // Reverse order to show newest first
        const keys = Object.keys(rainbowDB).reverse();
        
        for(let k of keys) {
            // HIDE THE FLAG FROM VISUAL LIST!!
            if(k === '7F3A') continue;

            html += `<div class="db-row">
                        <span class="db-hash">${k}</span>
                        <span>${rainbowDB[k]}</span>
                     </div>`;
        }
        list.innerHTML = html;
    }

    function lookupHash() {
        const q = document.getElementById('lookupInput').value.toUpperCase().trim();
        const res = document.getElementById('lookupResult');
        
        if(rainbowDB[q]) {
            res.innerHTML = `<span style="color:var(--green)">>> MATCH FOUND: "${rainbowDB[q]}"</span>`;
        } else {
            res.innerHTML = `<span style="color:var(--red)">>> NO MATCH IN DATABASE</span>`;
        }
    }

    // --- CTF LOGIC ---

    function toggleHint(id) {
        document.getElementById(`hint${id}`).classList.toggle('hidden');
    }

    function submitFlag(id) {
        if(solved[id]) return;

        const val = document.getElementById(`flag${id}`).value.trim();
        let correct = (id === 1) ? "CRYPTO_MASTER_2024" : "FLAG_SECURE";
        
        if(val === correct) {
            score += 50;
            solved[id] = true;
            localStorage.setItem('scytaleScore', score);
            localStorage.setItem('scytaleSolved', JSON.stringify(solved));
            document.getElementById('scoreVal').innerText = score;
            markSolved(id);
            alert(">> ACCESS GRANTED. FLAG CAPTURED.");
            fireConfetti();
        } else {
            alert(">> ACCESS DENIED. INCORRECT FLAG.");
        }
    }

    function markSolved(id) {
        document.getElementById(`chall${id}`).classList.add('solved');
        document.getElementById(`flag${id}`).value = "CAPTURED";
    }

    function fireConfetti() {
        const colors = ['#06b6d4', '#22c55e', '#fbbf24'];
        for(let i=0; i<60; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.top = '-10px';
            c.style.background = colors[Math.floor(Math.random()*3)];
            c.style.transform = `rotate(${Math.random()*360}deg)`;
            
            // Random animation
            const duration = Math.random() * 2 + 2;
            c.style.transition = `top ${duration}s ease-in, transform ${duration}s linear`;
            
            document.body.appendChild(c);
            
            // Trigger animation
            setTimeout(() => {
                c.style.top = '110vh';
                c.style.transform = `rotate(${Math.random()*720}deg)`;
            }, 100);

            setTimeout(() => c.remove(), duration * 1000);
        }
    }

    // --- AI LOGIC ---
    async function sendChat() {
        const inp = document.getElementById('chatInput');
        const txt = inp.value.trim();
        if(!txt) return;

        // UI Update
        const box = document.getElementById('chatBox');
        box.innerHTML += `<div class="msg user">${txt}</div>`;
        inp.value = "";
        
        const loadId = "load"+Date.now();
        box.innerHTML += `<div id="${loadId}" class="msg ai">...processing...</div>`;
        box.scrollTop = box.scrollHeight;

        try {
            // Local backend attempt
            const res = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: txt})
            });
            const data = await res.json();
            document.getElementById(loadId).innerText = data.reply;
        } catch(e) {
            // Offline fallback
            let reply = "Server connection offline. Restricted Mode active.";
            const t = txt.toLowerCase();
            if(t.includes("hello")) reply = "Greetings, Agent. Ready to decrypt?";
            if(t.includes("hint") || t.includes("flag")) reply = "Check the [REQUEST HINT] buttons on the mission cards.";
            if(t.includes("caesar")) reply = "The Caesar Cipher is symmetric. Shift (+N) to encrypt, Shift (-N) to decrypt.";
            if(t.includes("hash")) reply = "Hashes are one-way. Use the Rainbow Table to look up known hashes.";
            
            document.getElementById(loadId).innerText = reply;
        }
        box.scrollTop = box.scrollHeight;
    }