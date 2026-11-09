/* Scratch Quest — avatar catalog + SVG renderer (original character art).
 * Items unlock by level ({level:n}) or by badge ({badge:id}). Works in browser + Apps Script.
 */
var SQ_AVATAR = (function () {
  var uid = 0;
  var SKIN = ['#ffe0c4', '#f8cfa6', '#eab88a', '#d39a6a', '#b07a4f', '#8a5a36', '#6a4128', '#4a2c1a'];
  // Fantasy skins: aliens, robots, monsters, whatever they want to be
  var FUN_SKIN = ['#8ee59a', '#3fbf7f', '#8fd3ff', '#4a90e2', '#c4a8ff', '#8b5cf6', '#ff9ecb', '#ff6b6b', '#ffb86b', '#ffe066', '#9be7e1', '#b8c2cc', '#6b7280', '#f5f5f5'];
  var HAIR_COLORS = ['#2b1d14', '#5a3a22', '#8b5a2b', '#c58a3e', '#e8c26a', '#f2ead3', '#9aa0a6', '#d2483a', '#ef7fb0', '#7b5cd6', '#2f8fe0', '#3fae5a'];
  var CLOTH_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#111827', '#f5f5f4', '#78716c'];
  var BG_COLORS = ['#fde68a', '#bbf7d0', '#bae6fd', '#ddd6fe', '#fecdd3', '#fed7aa', '#e5e7eb', '#a7f3d0'];

  // category -> list of {id, name, unlock?}
  var CATALOG = {
    hair: [
      { id: 'short', name: 'Short' }, { id: 'spiky', name: 'Spiky' }, { id: 'long', name: 'Long' },
      { id: 'curly', name: 'Curly' }, { id: 'bun', name: 'Bun' }, { id: 'none', name: 'None' },
      { id: 'ponytail', name: 'Ponytail', unlock: { level: 2 } }, { id: 'braids', name: 'Braids', unlock: { level: 3 } },
      { id: 'mohawk', name: 'Mohawk', unlock: { level: 4 } }
    ],
    eyes: [
      { id: 'round', name: 'Round' }, { id: 'happy', name: 'Happy' }, { id: 'big', name: 'Sparkly' }, { id: 'sleepy', name: 'Chill' },
      { id: 'wink', name: 'Wink', unlock: { level: 2 } }, { id: 'star', name: 'Star Eyes', unlock: { badge: 'sharp_mind' } },
      { id: 'pixel', name: 'Pixel', unlock: { level: 6 } }
    ],
    mouth: [
      { id: 'smile', name: 'Smile' }, { id: 'grin', name: 'Grin' }, { id: 'open', name: 'Excited' }, { id: 'oh', name: 'Whoa' },
      { id: 'tongue', name: 'Silly', unlock: { level: 3 } }, { id: 'fangs', name: 'Vampire', unlock: { level: 8 } }
    ],
    outfit: [
      { id: 'tee', name: 'T-Shirt' }, { id: 'stripes', name: 'Stripes' },
      { id: 'hoodie', name: 'Hoodie', unlock: { level: 2 } }, { id: 'jersey', name: 'Coder Jersey', unlock: { badge: 'root_master' } },
      { id: 'knight', name: 'Knight Armor', unlock: { level: 7 } }, { id: 'robe', name: 'Wizard Robe', unlock: { level: 11 } },
      { id: 'space', name: 'Space Suit', unlock: { badge: 'capstone' } }
    ],
    hat: [
      { id: 'none', name: 'None' }, { id: 'cap', name: 'Cap' },
      { id: 'beanie', name: 'Beanie', unlock: { level: 2 } }, { id: 'headphones', name: 'Headphones', unlock: { level: 3 } },
      { id: 'catears', name: 'Cat Ears', unlock: { badge: 'loop_legend' } }, { id: 'antenna', name: 'Bug Antennae', unlock: { badge: 'bug_squasher' } },
      { id: 'propeller', name: 'Propeller Cap', unlock: { level: 5 } }, { id: 'wizard', name: 'Wizard Hat', unlock: { level: 11 } },
      { id: 'crown', name: 'Crown', unlock: { badge: 'showcase' } }
    ],
    extra: [
      { id: 'none', name: 'None' }, { id: 'glasses', name: 'Glasses' }, { id: 'bowtie', name: 'Bow Tie' },
      { id: 'scarf', name: 'Scarf', unlock: { level: 3 } }, { id: 'shades', name: 'Shades', unlock: { level: 4 } },
      { id: 'cape', name: 'Hero Cape', unlock: { badge: 'root_master' } }, { id: 'medal', name: 'Gold Medal', unlock: { badge: 'champion' } }
    ],
    pet: [
      { id: 'none', name: 'None' }, { id: 'cat', name: 'Kitten', unlock: { level: 3 } },
      { id: 'bug', name: 'Ladybug', unlock: { badge: 'bug_squasher' } }, { id: 'robot', name: 'Robo Buddy', unlock: { badge: 'block_smith' } },
      { id: 'slime', name: 'Slime', unlock: { level: 6 } }, { id: 'dragon', name: 'Baby Dragon', unlock: { level: 10 } }
    ],
    bg: [
      { id: 'solid', name: 'Color' }, { id: 'sunset', name: 'Sunset', unlock: { level: 2 } },
      { id: 'arcade', name: 'Arcade Grid', unlock: { badge: 'game_dev' } }, { id: 'forest', name: 'Enchanted Forest', unlock: { badge: 'storyteller' } },
      { id: 'circuit', name: 'Circuit Board', unlock: { badge: 'app_maker' } }, { id: 'space', name: 'Outer Space', unlock: { level: 8 } }
    ],
    frame: [
      { id: 'none', name: 'None' }, { id: 'silver', name: 'Silver', unlock: { level: 5 } },
      { id: 'gold', name: 'Gold', unlock: { level: 10 } }, { id: 'rainbow', name: 'Rainbow', unlock: { badge: 'triple' } }
    ]
  };
  var COLORS = {
    skin: SKIN.concat(FUN_SKIN), hairColor: HAIR_COLORS.concat(['neon']), outfitColor: CLOTH_COLORS, bgColor: BG_COLORS
  };
  var COLOR_UNLOCK = { neon: { level: 6 } };

  var DEFAULT = { skin: SKIN[2], hair: 'short', hairColor: HAIR_COLORS[1], eyes: 'round', mouth: 'smile',
    outfit: 'tee', outfitColor: CLOTH_COLORS[5], hat: 'none', extra: 'none', pet: 'none', bg: 'solid', bgColor: BG_COLORS[2], frame: 'none' };

  function randomAvatar(seed) {
    var s = seed || Math.floor(Math.random() * 1e9);
    function pick(arr) { s = (s * 9301 + 49297) % 233280; return arr[Math.floor((s / 233280) * arr.length)]; }
    function free(cat) { return pick(CATALOG[cat].filter(function (i) { return !i.unlock; })).id; }
    return { skin: pick(SKIN), hair: free('hair'), hairColor: pick(HAIR_COLORS), eyes: free('eyes'), mouth: free('mouth'),
      outfit: free('outfit'), outfitColor: pick(CLOTH_COLORS), hat: free('hat'), extra: free('extra'), pet: 'none',
      bg: 'solid', bgColor: pick(BG_COLORS), frame: 'none' };
  }

  function isUnlocked(unlock, prof) {
    if (!unlock) return true;
    if (!prof) return false;
    if (unlock.level) return prof.level >= unlock.level;
    if (unlock.badge) return prof.badges.indexOf(unlock.badge) >= 0;
    return false;
  }
  function unlockText(unlock) {
    if (!unlock) return '';
    if (unlock.level) return 'Reach level ' + unlock.level;
    if (unlock.badge && typeof SQ_RULES !== 'undefined' && SQ_RULES.BADGE[unlock.badge]) return 'Earn the "' + SQ_RULES.BADGE[unlock.badge].name + '" badge';
    return 'Locked';
  }
  // Remove anything the student hasn't unlocked (server uses this to stop cheating).
  function sanitize(av, prof) {
    var out = {}, k;
    av = av || {};
    for (k in DEFAULT) out[k] = DEFAULT[k];
    Object.keys(CATALOG).forEach(function (cat) {
      var item = CATALOG[cat].filter(function (i) { return i.id === av[cat]; })[0];
      if (item && isUnlocked(item.unlock, prof)) out[cat] = item.id;
    });
    Object.keys(COLORS).forEach(function (c) {
      var v = av[c];
      if (COLORS[c].indexOf(v) >= 0 && isUnlocked(COLOR_UNLOCK[v], prof)) out[c] = v;
    });
    return out;
  }
  // Every unlockable item, for "what you unlocked" notifications
  function allUnlockables() {
    var list = [];
    Object.keys(CATALOG).forEach(function (cat) {
      CATALOG[cat].forEach(function (i) { if (i.unlock) list.push({ cat: cat, id: i.id, name: i.name, unlock: i.unlock }); });
    });
    list.push({ cat: 'hairColor', id: 'neon', name: 'Neon Hair', unlock: COLOR_UNLOCK.neon });
    return list;
  }

  function shade(hex, amt) {
    if (!/^#/.test(hex)) return hex;
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // ---------------- drawing -----------------
  function svg(av, size, opts) {
    av = av || DEFAULT;
    opts = opts || {};
    var id = 'av' + (++uid);
    var d = [], defs = [];
    var skin = av.skin || DEFAULT.skin, skinD = shade(skin, -28);
    var hc = av.hairColor || DEFAULT.hairColor, hairFill = hc;
    if (hc === 'neon') {
      defs.push('<linearGradient id="' + id + 'n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3cac"/><stop offset=".5" stop-color="#784ba0"/><stop offset="1" stop-color="#2b86c5"/></linearGradient>');
      hairFill = 'url(#' + id + 'n)';
    }
    var oc = av.outfitColor || DEFAULT.outfitColor, ocD = shade(oc, -35);
    var ink = '#2b2235';

    // background
    defs.push('<clipPath id="' + id + 'c"><rect width="200" height="200" rx="34"/></clipPath>');
    d.push('<g clip-path="url(#' + id + 'c)">');
    var bg = av.bg || 'solid';
    if (bg === 'sunset') {
      defs.push('<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#ff6f91"/><stop offset="1" stop-color="#845ec2"/></linearGradient>');
      d.push('<rect width="200" height="200" fill="url(#' + id + 'b)"/><circle cx="150" cy="60" r="22" fill="#ffe8a3" opacity=".8"/>');
    } else if (bg === 'space') {
      d.push('<rect width="200" height="200" fill="#141a3a"/>');
      var stars = [[20, 20], [60, 40], [170, 30], [140, 90], [30, 120], [180, 150], [90, 15], [110, 60], [15, 175], [175, 110]];
      stars.forEach(function (p, i) { d.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i % 3 ? 1.5 : 2.5) + '" fill="#fff"/>'); });
      d.push('<circle cx="165" cy="45" r="14" fill="#f4a261"/><ellipse cx="165" cy="45" rx="24" ry="5" fill="none" stroke="#e9c46a" stroke-width="2.5"/>');
    } else if (bg === 'arcade') {
      d.push('<rect width="200" height="200" fill="#2a0e4a"/>');
      for (var gx = 0; gx <= 200; gx += 25) d.push('<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="200" stroke="#ff3cac" stroke-opacity=".35" stroke-width="2"/>');
      for (var gy = 0; gy <= 200; gy += 25) d.push('<line x1="0" y1="' + gy + '" x2="200" y2="' + gy + '" stroke="#2bd2ff" stroke-opacity=".35" stroke-width="2"/>');
    } else if (bg === 'forest') {
      defs.push('<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9f6ca"/><stop offset="1" stop-color="#2e7d32"/></linearGradient>');
      d.push('<rect width="200" height="200" fill="url(#' + id + 'b)"/>');
      [[22, 70], [178, 60], [10, 130], [190, 125]].forEach(function (t) {
        d.push('<path d="M' + t[0] + ',' + (t[1] - 40) + ' L' + (t[0] - 22) + ',' + (t[1] + 30) + ' L' + (t[0] + 22) + ',' + (t[1] + 30) + 'Z" fill="#1b5e20" opacity=".7"/>');
      });
      d.push('<circle cx="40" cy="30" r="3" fill="#fff59d"/><circle cx="160" cy="20" r="2.5" fill="#fff59d"/>');
    } else if (bg === 'circuit') {
      d.push('<rect width="200" height="200" fill="#0b3d5c"/>');
      ['M0,40 H50 V70 H80', 'M200,30 H160 V60', 'M0,150 H40 V120', 'M200,140 H170 V170 H140', 'M20,0 V20 H40'].forEach(function (p) {
        d.push('<path d="' + p + '" fill="none" stroke="#3ee0b5" stroke-width="3" opacity=".7"/>');
      });
      [[80, 70], [160, 60], [40, 120], [140, 170], [40, 20]].forEach(function (p) { d.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#3ee0b5"/>'); });
    } else {
      d.push('<rect width="200" height="200" fill="' + (av.bgColor || DEFAULT.bgColor) + '"/>');
      d.push('<circle cx="100" cy="92" r="78" fill="#fff" opacity=".25"/>');
    }

    // cape (behind body)
    if (av.extra === 'cape') d.push('<path d="M58,140 L30,205 L170,205 L142,140 Z" fill="#d62839"/><path d="M58,140 L45,205 L60,205 Z" fill="#a61e2c"/>');
    // long hair / braids back layer
    if (av.hair === 'long') d.push('<path d="M50,82 C46,40 72,28 100,28 C128,28 154,40 150,82 L156,150 C142,158 128,152 124,142 L124,92 L76,92 L76,142 C72,152 58,158 44,150 Z" fill="' + hairFill + '"/>');
    if (av.hair === 'ponytail') d.push('<path d="M138,60 C170,60 178,100 166,140 C160,120 150,100 140,90 Z" fill="' + hairFill + '"/>');
    if (av.hair === 'braids') {
      [56, 144].forEach(function (x) {
        for (var by = 96; by <= 150; by += 13) d.push('<ellipse cx="' + x + '" cy="' + by + '" rx="9" ry="8" fill="' + hairFill + '" stroke="' + shade(hc === 'neon' ? '#784ba0' : hc, -30) + '" stroke-width="1.5"/>');
      });
    }
    // hoodie hood behind head
    if (av.outfit === 'hoodie') d.push('<path d="M50,140 C40,95 62,70 100,70 C138,70 160,95 150,140 Z" fill="' + ocD + '"/>');
    if (av.outfit === 'space') d.push('<circle cx="100" cy="84" r="62" fill="#cfe8ff" opacity=".45" stroke="#e8f4ff" stroke-width="4"/>');

    // body / outfit
    var body = 'M36,205 C36,154 64,132 100,132 C136,132 164,154 164,205 Z';
    d.push('<rect x="88" y="112" width="24" height="26" rx="8" fill="' + skinD + '"/>'); // neck
    var o = av.outfit || 'tee';
    if (o === 'knight') {
      d.push('<path d="' + body + '" fill="#b8c1cc"/><path d="M60,160 H140 M56,180 H144" stroke="#8b96a3" stroke-width="4"/>');
      d.push('<path d="M80,136 L100,160 L120,136" fill="none" stroke="#e9c46a" stroke-width="5"/><circle cx="100" cy="182" r="10" fill="' + oc + '" stroke="#e9c46a" stroke-width="3"/>');
    } else if (o === 'robe') {
      d.push('<path d="' + body + '" fill="' + oc + '"/><path d="M80,134 L100,175 L120,134" fill="' + skinD + '" opacity=".0"/>');
      d.push('<path d="M78,135 L100,178 L122,135" fill="none" stroke="#f5d76e" stroke-width="5"/>');
      [[60, 172], [140, 168], [118, 192], [76, 194]].forEach(function (p) { d.push(star(p[0], p[1], 6, '#f5d76e')); });
    } else if (o === 'space') {
      d.push('<path d="' + body + '" fill="#f1f5f9"/><rect x="74" y="158" width="52" height="30" rx="6" fill="' + oc + '"/>');
      d.push('<circle cx="86" cy="173" r="4" fill="#ef4444"/><circle cx="100" cy="173" r="4" fill="#facc15"/><circle cx="114" cy="173" r="4" fill="#22c55e"/>');
      d.push('<path d="M66,140 C80,150 120,150 134,140" fill="none" stroke="#94a3b8" stroke-width="6"/>');
    } else {
      d.push('<path d="' + body + '" fill="' + oc + '"/>');
      if (o === 'stripes') {
        defs.push('<clipPath id="' + id + 's"><path d="' + body + '"/></clipPath>');
        d.push('<g clip-path="url(#' + id + 's)">');
        for (var sy = 148; sy < 205; sy += 16) d.push('<rect x="30" y="' + sy + '" width="140" height="7" fill="#fff" opacity=".7"/>');
        d.push('</g>');
      }
      if (o === 'hoodie') d.push('<path d="M92,138 V165 M108,138 V165" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="74" y="178" width="52" height="20" rx="8" fill="' + ocD + '"/>');
      if (o === 'jersey') d.push('<text x="100" y="186" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#fff">&lt;/&gt;</text><path d="M80,134 Q100,150 120,134" fill="none" stroke="#fff" stroke-width="4"/>');
      if (o === 'tee' || o === 'stripes') d.push('<path d="M84,134 Q100,148 116,134" fill="' + skinD + '"/>');
    }

    // ears + head
    d.push('<circle cx="54" cy="88" r="10" fill="' + skin + '"/><circle cx="146" cy="88" r="10" fill="' + skin + '"/>');
    d.push('<circle cx="100" cy="82" r="46" fill="' + skin + '"/>');
    d.push('<circle cx="74" cy="100" r="7" fill="#ff8fa3" opacity=".35"/><circle cx="126" cy="100" r="7" fill="#ff8fa3" opacity=".35"/>');

    // eyes
    var e = av.eyes || 'round';
    function roundEye(x) { return '<ellipse cx="' + x + '" cy="86" rx="7" ry="8" fill="' + ink + '"/><circle cx="' + (x + 2.5) + '" cy="83" r="2.5" fill="#fff"/>'; }
    function arcEye(x) { return '<path d="M' + (x - 8) + ',88 Q' + x + ',78 ' + (x + 8) + ',88" fill="none" stroke="' + ink + '" stroke-width="4" stroke-linecap="round"/>'; }
    if (e === 'round') d.push(roundEye(82) + roundEye(118));
    else if (e === 'happy') d.push(arcEye(82) + arcEye(118));
    else if (e === 'wink') d.push(roundEye(82) + arcEye(118));
    else if (e === 'big') [82, 118].forEach(function (x) { d.push('<ellipse cx="' + x + '" cy="86" rx="9" ry="11" fill="' + ink + '"/><circle cx="' + (x + 3) + '" cy="81" r="3.5" fill="#fff"/><circle cx="' + (x - 3) + '" cy="91" r="1.8" fill="#fff"/>'); });
    else if (e === 'sleepy') [82, 118].forEach(function (x) { d.push('<path d="M' + (x - 8) + ',86 Q' + x + ',93 ' + (x + 8) + ',86" fill="none" stroke="' + ink + '" stroke-width="4" stroke-linecap="round"/>'); });
    else if (e === 'star') [82, 118].forEach(function (x) { d.push(star(x, 86, 10, '#facc15', ink)); });
    else if (e === 'pixel') [82, 118].forEach(function (x) { d.push('<rect x="' + (x - 7) + '" y="79" width="14" height="14" fill="' + ink + '"/><rect x="' + (x + 0) + '" y="81" width="5" height="5" fill="#fff"/>'); });

    // mouth
    var m = av.mouth || 'smile';
    if (m === 'smile') d.push('<path d="M88,104 Q100,116 112,104" fill="none" stroke="' + ink + '" stroke-width="4" stroke-linecap="round"/>');
    else if (m === 'grin' || m === 'tongue' || m === 'fangs') {
      d.push('<path d="M85,102 Q100,124 115,102 Z" fill="' + ink + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>');
      if (m === 'grin') d.push('<path d="M88,103 H112 L110,107 H90 Z" fill="#fff"/>');
      if (m === 'tongue') d.push('<ellipse cx="104" cy="113" rx="7" ry="6" fill="#ff6b8b"/>');
      if (m === 'fangs') d.push('<path d="M89,103 L93,110 L96,103 Z M104,103 L107,110 L111,103 Z" fill="#fff"/>');
    } else if (m === 'open') d.push('<ellipse cx="100" cy="108" rx="10" ry="8" fill="' + ink + '"/><ellipse cx="100" cy="112" rx="6" ry="3" fill="#ff6b8b"/>');
    else if (m === 'oh') d.push('<circle cx="100" cy="108" r="5" fill="' + ink + '"/>');

    // hair front
    var h = av.hair || 'short';
    var fringe = 'M54,82 C50,44 74,30 100,30 C126,30 150,44 146,82 C140,62 124,52 100,54 C78,54 60,62 54,82 Z';
    if (h === 'short' || h === 'long' || h === 'bun' || h === 'ponytail' || h === 'braids') d.push('<path d="' + fringe + '" fill="' + hairFill + '"/>');
    if (h === 'bun') d.push('<circle cx="100" cy="26" r="16" fill="' + hairFill + '"/>');
    if (h === 'spiky') d.push('<path d="M54,84 L50,58 L64,62 L64,38 L80,50 L86,24 L100,44 L114,24 L120,50 L136,38 L136,62 L150,58 L146,84 C138,62 120,56 100,56 C80,56 62,62 54,84 Z" fill="' + hairFill + '"/>');
    if (h === 'curly') [[58, 66], [64, 48], [78, 36], [96, 32], [114, 34], [130, 44], [140, 60], [144, 76], [56, 80]].forEach(function (p) {
      d.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="' + hairFill + '"/>');
    });
    if (h === 'mohawk') d.push('<path d="M88,58 C86,38 92,18 100,10 C108,18 114,38 112,58 Z" fill="' + hairFill + '"/>');

    // extras on face/neck
    var x = av.extra;
    if (x === 'glasses') d.push('<g fill="none" stroke="' + ink + '" stroke-width="3"><circle cx="82" cy="86" r="13"/><circle cx="118" cy="86" r="13"/><path d="M95,86 H105 M69,84 L56,80 M131,84 L144,80"/></g>');
    if (x === 'shades') d.push('<path d="M66,78 H96 V90 Q96,98 86,98 H76 Q66,98 66,90 Z M104,78 H134 V90 Q134,98 124,98 H114 Q104,98 104,90 Z" fill="#111"/><path d="M96,82 H104" stroke="#111" stroke-width="4"/><path d="M70,82 L78,82" stroke="#fff" stroke-width="2" opacity=".6"/>');
    if (x === 'scarf') d.push('<path d="M70,128 Q100,146 130,128 L132,140 Q100,158 68,140 Z" fill="#f43f5e"/><rect x="112" y="138" width="14" height="34" rx="4" fill="#e11d48"/>');
    if (x === 'bowtie') d.push('<path d="M100,140 L84,131 V149 Z M100,140 L116,131 V149 Z" fill="#e11d48"/><circle cx="100" cy="140" r="4" fill="#9f1239"/>');
    if (x === 'medal') d.push('<path d="M88,134 L100,162 L112,134" fill="none" stroke="#2563eb" stroke-width="6"/><circle cx="100" cy="168" r="11" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>' + star(100, 168, 6, '#fff7c2'));

    // hats
    var t = av.hat;
    if (t === 'cap') d.push('<path d="M54,68 C54,38 76,26 100,26 C124,26 146,38 146,68 Z" fill="' + oc + '"/><path d="M96,66 H166 Q164,76 150,76 H96 Z" fill="' + ocD + '"/><circle cx="100" cy="28" r="4" fill="' + ocD + '"/>');
    if (t === 'beanie') d.push('<path d="M52,72 C52,34 76,22 100,22 C124,22 148,34 148,72 Z" fill="#ef4444"/><rect x="50" y="62" width="100" height="14" rx="7" fill="#b91c1c"/><circle cx="100" cy="20" r="10" fill="#fff"/>');
    if (t === 'headphones') d.push('<path d="M50,86 C46,30 154,30 150,86" fill="none" stroke="#334155" stroke-width="8"/><rect x="40" y="74" width="18" height="30" rx="8" fill="' + oc + '"/><rect x="142" y="74" width="18" height="30" rx="8" fill="' + oc + '"/>');
    if (t === 'catears') d.push('<path d="M58,56 L62,18 L90,40 Z M142,56 L138,18 L110,40 Z" fill="' + (hc === 'neon' ? '#784ba0' : hc) + '"/><path d="M64,48 L66,28 L82,40 Z M136,48 L134,28 L118,40 Z" fill="#ffb3c6"/>');
    if (t === 'antenna') d.push('<path d="M86,40 Q78,18 66,10 M114,40 Q122,18 134,10" fill="none" stroke="' + ink + '" stroke-width="3.5"/><circle cx="66" cy="10" r="7" fill="#22c55e"/><circle cx="134" cy="10" r="7" fill="#22c55e"/>');
    if (t === 'propeller') d.push('<path d="M54,66 C54,36 76,26 100,26 C124,26 146,36 146,66 Z" fill="#facc15"/><path d="M54,66 C54,36 76,26 100,26 V66 Z" fill="#3b82f6"/><rect x="98" y="12" width="4" height="16" fill="#334155"/><ellipse cx="86" cy="12" rx="14" ry="4" fill="#ef4444"/><ellipse cx="114" cy="12" rx="14" ry="4" fill="#22c55e"/>');
    if (t === 'wizard') d.push('<ellipse cx="100" cy="52" rx="62" ry="12" fill="#4c1d95"/><path d="M62,52 L104,-10 L138,52 Z" fill="#6d28d9"/>' + star(102, 26, 7, '#fde047') + star(86, 42, 4, '#fde047'));
    if (t === 'crown') d.push('<path d="M62,50 L66,18 L84,36 L100,12 L116,36 L134,18 L138,50 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="38" r="5" fill="#ef4444"/><circle cx="78" cy="42" r="3.5" fill="#3b82f6"/><circle cx="122" cy="42" r="3.5" fill="#22c55e"/>');

    // pet (bottom right)
    var p = av.pet;
    if (p && p !== 'none') {
      d.push('<g transform="translate(150,152)">');
      if (p === 'cat') d.push('<path d="M-18,-6 L-16,-26 L-4,-14 Z M18,-6 L16,-26 L4,-14 Z" fill="#f59e0b"/><circle r="20" fill="#f59e0b"/><circle cx="-7" cy="-2" r="3" fill="' + ink + '"/><circle cx="7" cy="-2" r="3" fill="' + ink + '"/><path d="M-4,7 Q0,10 4,7" stroke="' + ink + '" stroke-width="2" fill="none"/><path d="M-20,4 H-10 M20,4 H10" stroke="' + ink + '" stroke-width="1.5"/>');
      if (p === 'bug') d.push('<circle cx="0" cy="-16" r="8" fill="' + ink + '"/><circle r="18" fill="#ef4444"/><path d="M0,-18 V18" stroke="' + ink + '" stroke-width="2.5"/><circle cx="-8" cy="-4" r="4" fill="' + ink + '"/><circle cx="8" cy="6" r="4" fill="' + ink + '"/><circle cx="7" cy="-8" r="3" fill="' + ink + '"/>');
      if (p === 'robot') d.push('<path d="M0,-22 V-30" stroke="#64748b" stroke-width="3"/><circle cy="-31" r="4" fill="#ef4444"/><rect x="-20" y="-22" width="40" height="36" rx="9" fill="#94a3b8"/><rect x="-14" y="-15" width="28" height="16" rx="5" fill="#0f172a"/><circle cx="-6" cy="-7" r="3.5" fill="#22d3ee"/><circle cx="6" cy="-7" r="3.5" fill="#22d3ee"/><rect x="-8" y="5" width="16" height="4" rx="2" fill="#475569"/>');
      if (p === 'slime') d.push('<path d="M-22,16 C-24,-10 -10,-24 0,-24 C10,-24 24,-10 22,16 Z" fill="#4ade80" opacity=".9"/><circle cx="-7" cy="-4" r="4" fill="' + ink + '"/><circle cx="7" cy="-4" r="4" fill="' + ink + '"/><circle cx="-12" cy="-14" r="3" fill="#fff" opacity=".7"/>');
      if (p === 'dragon') d.push('<path d="M10,-8 L34,-26 L28,2 Z" fill="#a3e635"/><circle r="18" fill="#22c55e"/><path d="M-10,-14 L-14,-28 L-2,-17 Z M10,-14 L14,-28 L2,-17 Z" fill="#fbbf24"/><circle cx="-6" cy="-3" r="3.5" fill="' + ink + '"/><circle cx="6" cy="-3" r="3.5" fill="' + ink + '"/><path d="M-6,8 Q0,12 6,8" stroke="' + ink + '" stroke-width="2" fill="none"/>');
      d.push('</g>');
    }
    d.push('</g>'); // end clip

    // frame
    var f = av.frame;
    if (f === 'silver') d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="#cbd5e1" stroke-width="8"/>');
    if (f === 'gold') d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="#f5b301" stroke-width="9"/><rect x="10" y="10" width="180" height="180" rx="26" fill="none" stroke="#fde68a" stroke-width="2"/>');
    if (f === 'rainbow') {
      defs.push('<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef4444"/><stop offset=".25" stop-color="#facc15"/><stop offset=".5" stop-color="#22c55e"/><stop offset=".75" stop-color="#3b82f6"/><stop offset="1" stop-color="#a855f7"/></linearGradient>');
      d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="url(#' + id + 'r)" stroke-width="9"/>');
    }

    var s = size || 120;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + s + '" height="' + s + '" class="avatar-svg"' +
      (opts.title ? ' role="img" aria-label="' + String(opts.title).replace(/"/g, '') + '"' : ' aria-hidden="true"') + '><defs>' + defs.join('') + '</defs>' + d.join('') + '</svg>';
  }

  function star(cx, cy, r, fill, stroke) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.5"' : '') + '/>';
  }

  return { CATALOG: CATALOG, COLORS: COLORS, COLOR_UNLOCK: COLOR_UNLOCK, DEFAULT: DEFAULT, svg: svg,
    isUnlocked: isUnlocked, unlockText: unlockText, sanitize: sanitize, randomAvatar: randomAvatar, allUnlockables: allUnlockables };
})();
