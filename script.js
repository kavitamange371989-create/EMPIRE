
// ==========================================
//              EMPIRE SIMULATOR
//             COMPLETE SCRIPT
// ==========================================


// ---------- GAME DATA ----------

let cash = 1500;
let xp = 0;
let researchPoints = 0;
let reputation = 0;

let owned = [];
let boosts = [];

let totalEarned = 0;
let upgradesPurchased = 0;

const businesses = [
  { id: 1, name: "Neon Cafe", icon: "☕", cost: 450, income: 32 },
  { id: 2, name: "Pixel Studio", icon: "🎨", cost: 850, income: 62 },
  { id: 3, name: "Street Sole", icon: "👟", cost: 1400, income: 105 },
  { id: 4, name: "Nova Tech", icon: "💻", cost: 2600, income: 205 },
  { id: 5, name: "Luma Cinema", icon: "🎬", cost: 5200, income: 390 },
  { id: 6, name: "Apex Robotics", icon: "🤖", cost: 10500, income: 780 }
];

const researchItems = [
  { id: 1, name: "Smart Marketing", cost: 5, description: "+20% business income" },
  { id: 2, name: "AI Management", cost: 10, description: "+35% business income" },
  { id: 3, name: "Global Expansion", cost: 20, description: "+60% business income" },
  { id: 4, name: "Quantum Systems", cost: 35, description: "+100% business income" }
];

const achievements = [
  { name: "First Steps", description: "Buy your first business", check: () => owned.length >= 1 },
  { name: "Business Tycoon", description: "Own 3 businesses", check: () => owned.length >= 3 },
  { name: "Big Player", description: "Earn ₹10,000 total", check: () => totalEarned >= 10000 },
  { name: "Researcher", description: "Unlock your first research", check: () => boosts.length >= 1 },
  { name: "Empire Builder", description: "Own 6 businesses", check: () => owned.length >= 6 },
  { name: "Upgrade Master", description: "Purchase 5 upgrades", check: () => upgradesPurchased >= 5 }
];


// ---------- CALCULATIONS ----------

function getMultiplier() {
  let multiplier = 1;

  if (boosts.includes(1)) multiplier += 0.2;
  if (boosts.includes(2)) multiplier += 0.35;
  if (boosts.includes(3)) multiplier += 0.6;
  if (boosts.includes(4)) multiplier += 1;

  return multiplier;
}

function getHourlyIncome() {
  return owned.reduce((sum, b) => sum + b.income * b.level, 0) * getMultiplier();
}

function getEmpireValue() {
  return owned.reduce((sum, b) => sum + b.cost * b.level, 0);
}

function formatMoney(amount) {
  return "₹" + Math.floor(amount).toLocaleString("en-IN");
}


// ---------- DISPLAY UPDATE ----------

function setText(ids, value) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function update() {
  setText(["cash", "cashValue", "totalCash"], formatMoney(cash));
  setText(["income", "incomeValue", "hourlyIncome"], formatMoney(getHourlyIncome()) + "/hr");
  setText(["value", "empireValue"], formatMoney(getEmpireValue()));
  setText(["xp"], xp + " XP");
  setText(["xpValue"], xp);
  setText(["reputation", "reputationValue"], reputation);
  setText(["researchPoints", "researchValue"], researchPoints);

  renderHome();
  renderMarket();
  renderBusinesses();
  renderResearch();
  renderAchievements();
}


// ---------- HOME DASHBOARD ----------

function renderHome() {
  const container = document.getElementById("homeBusinesses");
  if (!container) return;

  if (owned.length === 0) {
    container.textContent = "No businesses yet. Start your journey!";
    return;
  }

  container.innerHTML = owned.map(b => `
    <div style="padding:12px 0;border-bottom:1px solid #233750;">
      <strong>${b.icon} ${b.name}</strong>
      <p style="color:#91a5bf;margin-top:6px;">
        Level ${b.level} · ${formatMoney(b.income * b.level)}/hr
      </p>
    </div>
  `).join("");
}


// ---------- MARKET ----------

function renderMarket() {
  const container = document.getElementById("marketCards");
  if (!container) return;

  container.innerHTML = "";

  businesses.forEach(b => {
    const alreadyOwned = owned.some(item => item.id === b.id);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${b.icon} ${b.name}</h2>
      <p>Price: ${formatMoney(b.cost)}</p>
      <p>Income: ${formatMoney(b.income)}/hr</p>
      <button ${alreadyOwned || cash < b.cost ? "disabled" : ""}>
        ${alreadyOwned ? "OWNED" : cash < b.cost ? "NOT ENOUGH CASH" : "BUY BUSINESS"}
      </button>
    `;

    card.querySelector("button").onclick = () => buyBusiness(b.id);
    container.appendChild(card);
  });
}

function buyBusiness(id) {
  const b = businesses.find(item => item.id === id);

  if (!b || owned.some(item => item.id === id)) return;

  if (cash < b.cost) {
    secretMessage("Not enough cash!");
    return;
  }

  cash -= b.cost;
  owned.push({ ...b, level: 1 });

  xp += 50;
  reputation += 5;

  secretMessage("🎉 Business acquired: " + b.name);
  update();
}


// ---------- MY BUSINESSES ----------

function renderBusinesses() {
  const container = document.getElementById("ownedCards");
  if (!container) return;

  container.innerHTML = "";

  if (owned.length === 0) {
    container.innerHTML = "<p>You don't own any businesses yet. Visit the Market!</p>";
    return;
  }

  owned.forEach(b => {
    const cost = Math.floor(b.cost * b.level * 0.65);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${b.icon} ${b.name}</h2>
      <p>Level: ${b.level}</p>
      <p>Income: ${formatMoney(b.income * b.level)}/hr</p>
      <p>Upgrade cost: ${formatMoney(cost)}</p>
      <button ${cash < cost ? "disabled" : ""}>
        ${cash < cost ? "NOT ENOUGH CASH" : "UPGRADE BUSINESS"}
      </button>
    `;

    card.querySelector("button").onclick = () => upgradeBusiness(b.id);
    container.appendChild(card);
  });
}

function upgradeBusiness(id) {
  const b = owned.find(item => item.id === id);
  if (!b) return;

  const cost = Math.floor(b.cost * b.level * 0.65);

  if (cash < cost) {
    secretMessage("Not enough cash for upgrade!");
    return;
  }

  cash -= cost;
  b.level++;

  xp += 25;
  reputation += 2;
  upgradesPurchased++;

  secretMessage("⬆ Business upgraded!");
  update();
}


// ---------- RESEARCH ----------

function renderResearch() {
  const container = document.getElementById("researchCards");
  if (!container) return;

  container.innerHTML = "";

  researchItems.forEach(item => {
    const unlocked = boosts.includes(item.id);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>🧪 ${item.name}</h2>
      <p>${item.description}</p>
      <p>Cost: ${item.cost} Research Points</p>
      <button ${unlocked || researchPoints < item.cost ? "disabled" : ""}>
        ${unlocked ? "UNLOCKED" : researchPoints < item.cost ? "NOT ENOUGH POINTS" : "RESEARCH"}
      </button>
    `;

    card.querySelector("button").onclick = () => unlockResearch(item.id);
    container.appendChild(card);
  });
}

function unlockResearch(id) {
  const item = researchItems.find(r => r.id === id);

  if (!item || boosts.includes(id)) return;

  if (researchPoints < item.cost) {
    secretMessage("Not enough research points!");
    return;
  }

  researchPoints -= item.cost;
  boosts.push(id);
  xp += 100;

  secretMessage("🧪 Research unlocked: " + item.name);
  update();
}


// ---------- ACHIEVEMENTS ----------

function renderAchievements() {
  const container = document.getElementById("achievementCards");
  if (!container) return;

  container.innerHTML = "";

  achievements.forEach(item => {
    const completed = item.check();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${completed ? "🏆" : "🔒"} ${item.name}</h3>
      <p>${item.description}</p>
      <p>${completed ? "COMPLETED" : "LOCKED"}</p>
    `;

    container.appendChild(card);
  });
}


// ---------- AUTOMATIC INCOME ----------

setInterval(() => {
  const income = getHourlyIncome();

  if (income > 0) {
    cash += income;
    totalEarned += income;
    update();
  }
}, 10000);

setInterval(() => {
  if (owned.length > 0) {
    researchPoints++;
    update();
  }
}, 60000);


// ---------- NAVIGATION ----------

function showPage(pageName) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
    page.style.display = "none";
  });

  const selected = document.getElementById(pageName);

  if (selected) {
    selected.classList.add("active");
    selected.style.display = "block";
  }

  const titles = {
    home: "Command Center",
    market: "Market District",
    business: "My Businesses",
    research: "Research & Development",
    achievements: "Achievements"
  };

  setText(["pageTitle"], titles[pageName] || "Command Center");

  update();
}


// ---------- POPUP ----------

function secretMessage(message) {
  const popup = document.createElement("div");

  popup.style.cssText = `
    position:fixed;
    bottom:25px;
    right:25px;
    z-index:999999;
    background:#101b2d;
    color:#00e5ff;
    border:1px solid #00e5ff;
    padding:16px 22px;
    border-radius:12px;
    font-weight:bold;
    box-shadow:0 0 20px #00e5ff44;
  `;

  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 3500);
}


// ==========================================
//             EASTER EGG SYSTEM
// ==========================================

// NINE ORIGINAL SECRET CODES

const secretCodes = [
  "PREM",
  "KRISHNA",
  "SHIV",
  "BILLIONAIRE",
  "GODMODE",
  "ELON",
  "EXPENSIVE",
  "MATRIX",
  "RESET"
];

let discoveredEggs = new Set();
let secretCode = "";
let infinityUnlocked = false;


// ---------- DISCOVERY TRACKER ----------

function discoverEgg(code) {
  if (!discoveredEggs.has(code)) {
    discoveredEggs.add(code);

    secretMessage(
      "🔍 Easter Eggs discovered: " +
      discoveredEggs.size + "/9"
    );
  }

  if (discoveredEggs.size === 9 && !infinityUnlocked) {
    infinityUnlocked = true;

    setTimeout(() => {
      projectInfinity();
    }, 1800);
  }
}


// ---------- BEST BROTHER MESSAGE ----------

function bestBrotherMessage() {
  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:999999;
    background:rgba(3,8,20,.97);
    display:grid;
    place-items:center;
    padding:25px;
    color:#fff;
    font-family:monospace;
    text-align:center;
  `;

  overlay.innerHTML = `
    <div style="max-width:600px">
      <p style="color:#00e5ff;letter-spacing:4px">
        CLASSIFIED FOUNDER MESSAGE
      </p>

      <h1 style="color:#f6c96b;font-size:34px">
        TO KRISHNA
      </h1>

      <p style="font-size:17px;line-height:1.9">
        Every great empire starts with an idea.<br>
        This one was built by Prem.<br><br>

        You inspired the journey.<br>
        Now witness what he created.
      </p>

      <h3 style="color:#00e5ff">
        — PREM, FOUNDER OF EMPIRE
      </h3>

      <button id="bestBrotherClose"
        style="padding:12px 25px;cursor:pointer">
        CLOSE MESSAGE
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("bestBrotherClose").onclick = () => {
    overlay.remove();
  };
}


// ---------- FINAL SECRET ENDING ----------

function projectInfinity() {
  const ending = document.createElement("div");

  ending.style.cssText = `
    position:fixed;
    inset:0;
    z-index:1000000;
    background:#02040a;
    display:grid;
    place-items:center;
    padding:25px;
    color:#00e5ff;
    font-family:monospace;
    text-align:center;
  `;

  ending.innerHTML = `
    <div style="max-width:700px">
      <p style="letter-spacing:7px;color:#aaa">
        ALL SECRETS DISCOVERED
      </p>

      <h1 style="font-size:clamp(35px,8vw,75px);
        text-shadow:0 0 25px #00e5ff">
        PROJECT INFINITY
      </h1>

      <p style="font-size:18px;line-height:1.9;color:white">
        You were never just building a business.<br>
        You were building an empire.
      </p>

      <h2 style="color:#f6c96b;letter-spacing:3px">
        FOUNDER OF INFINITY
      </h2>

      <p style="color:#888">
        SYSTEM STATUS: LEGENDARY
      </p>

      <button id="infinityClose"
        style="padding:14px 30px;cursor:pointer">
        RETURN TO EMPIRE
      </button>
    </div>
  `;

  document.body.appendChild(ending);

  document.getElementById("infinityClose").onclick = () => {
    ending.remove();
  };
}


// ---------- KEYBOARD COMMANDS ----------

document.addEventListener("keydown", function(event) {
  if (event.key.length !== 1) return;

  if (
    event.target &&
    ["INPUT", "TEXTAREA"].includes(event.target.tagName)
  ) return;

  secretCode += event.key.toUpperCase();
  secretCode = secretCode.slice(-20);

  const secrets = {

    "PREM": () => {
      cash += 5000;
      xp += 100;
      update();
      secretMessage("👑 PREM FOUNDER BONUS!");
    },

    "KRISHNA": () => {
      cash += 10000;
      xp += 200;
      update();
      secretMessage("🧠 KRISHNA LEGEND BONUS!");
    },

    "SHIV": () => {
      cash += 3000;
      researchPoints += 5;
      update();
      secretMessage("🔬 SHIV SCIENTIST BONUS!");
    },

    "BILLIONAIRE": () => {
      cash += 1000000;
      xp += 1000;
      update();
      secretMessage("💎 BILLIONAIRE MODE!");
    },

    "GODMODE": () => {
      cash += 5000000;
      xp += 5000;
      researchPoints += 100;
      update();
      secretMessage("⚡ EMPIRE GOD MODE!");
    },

    "ELON": () => {
      cash += 250000;
      researchPoints += 25;
      update();
      secretMessage("🚀 FUTURE TECHNOLOGY UNLOCKED!");
    },

    "EXPENSIVE": () => {
      cash += 50000;
      xp += 500;
      update();
      secretMessage("💎 EXPENSIVE FOUNDER BONUS!");
    },

    "MATRIX": () => {
      document.body.classList.toggle("matrix-mode");
      secretMessage("🟢 MATRIX MODE ACTIVATED!");
    },

    "RESET": () => {
      secretMessage("🕵️ NICE TRY, FOUNDER!");
    },

    // Special message only.
    // Does not count toward the nine original eggs.

    "BESTBROTHER": () => {
      bestBrotherMessage();
      secretMessage("💌 SPECIAL MESSAGE UNLOCKED!");
    }
  };

  for (const code in secrets) {
    if (secretCode.endsWith(code)) {
      secrets[code]();

      if (secretCodes.includes(code)) {
        discoverEgg(code);
      }

      secretCode = "";
      break;
    }
  }
});


// ---------- SECRET FOUNDER VAULT ----------

function secretVault() {
  const vault = document.createElement("div");

  vault.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.97);
    z-index:999999;
    display:grid;
    place-items:center;
    color:#00ffcc;
    font-family:monospace;
    text-align:center;
    padding:20px;
  `;

  vault.innerHTML = `
    <div>
      <h1>⚠ PROJECT INFINITY</h1>
      <h2>TOP SECRET FOUNDER FILE</h2>
      <p>FOUNDER: PREM</p>
      <p>ACCESS LEVEL: LEGENDARY</p>
      <p>EMPIRE STATUS: UNLIMITED POTENTIAL</p>
      <p>MISSION: BUILD THE FUTURE.</p>
      <button id="closeVault">CLOSE VAULT</button>
    </div>
  `;

  document.body.appendChild(vault);

  document.getElementById("closeVault").onclick = () => {
    vault.remove();
  };
}


// Seven clicks on EMPIRE title.

let vaultClicks = 0;
let vaultTimer;

const sidebarTitle = document.querySelector(".sidebar h1");

if (sidebarTitle) {
  sidebarTitle.addEventListener("click", () => {
    vaultClicks++;
    clearTimeout(vaultTimer);

    vaultTimer = setTimeout(() => {
      vaultClicks = 0;
    }, 2000);

    if (vaultClicks >= 7) {
      vaultClicks = 0;
      secretVault();
    }
  });
}


// ---------- START GAME ----------

update();

console.log("EMPIRE SYSTEM ONLINE.");
console.log("9 secret codes are hidden in the system.");
console.log("BESTBROTHER: A special founder message.");
console.log("Some messages are meant for special people.");
