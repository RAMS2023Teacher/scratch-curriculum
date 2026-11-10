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
  // ---- Shop items: bought with coins. rarity drives price and the card's glow. ----
  var SHOP = {
    aura: [['glow', 'Soft Glow', 40, 'common'], ['bubbles', 'Bubbles', 90, 'rare'], ['hearts', 'Hearts', 100, 'rare'], ['sunburst', 'Sunburst', 150, 'rare'],
      ['flames', 'Flames', 280, 'epic'], ['lightning', 'Lightning', 300, 'epic'], ['rainbow', 'Rainbow', 350, 'epic'], ['galaxy', 'Galaxy', 550, 'legendary']],
    effect: [['confetti', 'Confetti', 50, 'common'], ['sparkles', 'Sparkles', 100, 'rare'], ['stars', 'Star Swirl', 130, 'rare'], ['shine', 'Super Shine', 220, 'epic'], ['gems', 'Floating Gems', 480, 'legendary']],
    hat: [['party', 'Party Hat', 50, 'common'], ['beret', 'Beret', 60, 'common'], ['tophat', 'Top Hat', 140, 'rare'], ['horns', 'Viking Helmet', 160, 'rare'], ['halo', 'Halo', 280, 'epic']],
    extra: [['stars', 'Star Glasses', 90, 'rare'], ['visor', 'Cyber Visor', 220, 'epic']],
    outfit: [['tux', 'Tuxedo', 150, 'rare'], ['hero', 'Super Suit', 260, 'epic'], ['goldarmor', 'Golden Armor', 600, 'legendary']],
    pet: [['ghost', 'Ghosty', 120, 'rare'], ['owl', 'Owl', 150, 'rare'], ['axolotl', 'Axolotl', 280, 'epic'], ['phoenix', 'Phoenix', 520, 'legendary']],
    bg: [['candy', 'Candy Land', 90, 'rare'], ['ocean', 'Deep Sea', 140, 'rare'], ['volcano', 'Volcano', 240, 'epic']],
    frame: [['neon', 'Neon', 200, 'epic'], ['diamond', 'Diamond', 450, 'legendary']],
    title: [['sprite', 'Sprite Tamer', 40, 'common'], ['loops', 'Loop Master', 60, 'common'], ['bugs', 'Bug Hunter', 80, 'rare'], ['pixel', 'Pixel Artist', 80, 'rare'],
      ['games', 'Game Maker', 120, 'rare'], ['stories', 'Story Weaver', 120, 'rare'], ['apps', 'App Inventor', 120, 'rare'], ['wizard', 'Code Wizard', 250, 'epic'], ['legend', 'Legend of Scratch', 600, 'legendary']]
  };
  CATALOG.aura = [{ id: 'none', name: 'None' }];
  CATALOG.effect = [{ id: 'none', name: 'None' }];
  CATALOG.title = [{ id: 'none', name: 'No title' }, { id: 'rookie', name: 'Rookie Coder' }];
  Object.keys(SHOP).forEach(function (cat) {
    SHOP[cat].forEach(function (x) {
      CATALOG[cat].push({ id: x[0], name: x[1], rarity: x[3], unlock: { price: x[2], key: cat + ':' + x[0] } });
    });
  });
  // Rarity for every item (shop items set it; level/badge items are rare or epic)
  var RARITY = { common: { name: 'Common', color: '#94a3b8' }, rare: { name: 'Rare', color: '#3a86ff' }, epic: { name: 'Epic', color: '#a855f7' }, legendary: { name: 'Legendary', color: '#ffb703' } };
  Object.keys(CATALOG).forEach(function (cat) {
    CATALOG[cat].forEach(function (i) {
      if (!i.rarity) i.rarity = !i.unlock ? 'common' : i.unlock.badge ? (i.id === 'crown' || i.id === 'space' ? 'legendary' : 'epic') : (i.unlock.level >= 8 ? 'epic' : 'rare');
    });
  });
  var PRICE = {};
  Object.keys(CATALOG).forEach(function (cat) { CATALOG[cat].forEach(function (i) { if (i.unlock && i.unlock.price) PRICE[i.unlock.key] = i.unlock.price; }); });
  function priceOf(key) { return PRICE[key] || 0; }
  function itemOf(cat, id) { return (CATALOG[cat] || []).filter(function (i) { return i.id === id; })[0] || null; }
  // Coins: earned from XP (1 coin per 5 XP), minus what was spent in the shop
  function coinsFor(xp, owned) { var spent = 0; (owned || []).forEach(function (k) { spent += priceOf(k); }); return { earned: Math.floor(xp / 5), spent: spent, balance: Math.floor(xp / 5) - spent }; }

  var COLORS = {
    skin: SKIN.concat(FUN_SKIN), hairColor: HAIR_COLORS.concat(['neon']), outfitColor: CLOTH_COLORS, bgColor: BG_COLORS
  };
  var COLOR_UNLOCK = { neon: { level: 6 } };

  var DEFAULT = { skin: SKIN[2], hair: 'short', hairColor: HAIR_COLORS[1], eyes: 'round', mouth: 'smile',
    outfit: 'tee', outfitColor: CLOTH_COLORS[5], hat: 'none', extra: 'none', pet: 'none', bg: 'solid', bgColor: BG_COLORS[2], frame: 'none',
    aura: 'none', effect: 'none', title: 'none' };

  function randomAvatar(seed) {
    var s = seed || Math.floor(Math.random() * 1e9);
    function pick(arr) { s = (s * 9301 + 49297) % 233280; return arr[Math.floor((s / 233280) * arr.length)]; }
    function free(cat) { return pick(CATALOG[cat].filter(function (i) { return !i.unlock; })).id; }
    return { skin: pick(SKIN), hair: free('hair'), hairColor: pick(HAIR_COLORS), eyes: free('eyes'), mouth: free('mouth'),
      outfit: free('outfit'), outfitColor: pick(CLOTH_COLORS), hat: free('hat'), extra: free('extra'), pet: 'none',
      bg: 'solid', bgColor: pick(BG_COLORS), frame: 'none', aura: 'none', effect: 'none', title: 'none' };
  }

  function isUnlocked(unlock, prof) {
    if (!unlock) return true;
    if (!prof) return false;
    if (unlock.price) return (prof.owned || []).indexOf(unlock.key) >= 0;
    if (unlock.level) return prof.level >= unlock.level;
    if (unlock.badge) return prof.badges.indexOf(unlock.badge) >= 0;
    return false;
  }
  function unlockText(unlock) {
    if (!unlock) return '';
    if (unlock.price) return unlock.price + ' coins';
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
      CATALOG[cat].forEach(function (i) { if (i.unlock && !i.unlock.price) list.push({ cat: cat, id: i.id, name: i.name, unlock: i.unlock }); });
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
    } else if (bg === 'candy') {
      d.push('<rect width="200" height="200" fill="#ffd6ec"/>');
      for (var ci = -200; ci < 200; ci += 36) d.push('<path d="M' + ci + ',200 L' + (ci + 200) + ',0" stroke="#fff" stroke-width="12" opacity=".55"/>');
      [[30, 40, '#ff6fa8'], [170, 50, '#7ad0ff'], [24, 160, '#ffd23f'], [178, 150, '#a78bfa']].forEach(function (q) { d.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="13" fill="' + q[2] + '"/><path d="M' + (q[0] - 7) + ',' + q[1] + ' a7,7 0 0 1 14,0" fill="none" stroke="#fff" stroke-width="3"/>'); });
    } else if (bg === 'ocean') {
      defs.push('<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb6e8"/><stop offset="1" stop-color="#0b3d7a"/></linearGradient>');
      d.push('<rect width="200" height="200" fill="url(#' + id + 'b)"/>');
      [[30, 150, 6], [40, 120, 4], [168, 70, 5], [160, 40, 3], [20, 60, 3]].forEach(function (q) { d.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>'); });
      d.push('<path d="M12,200 Q2,170 14,150 Q24,130 12,110 M188,200 Q198,175 186,155 Q176,135 190,118" fill="none" stroke="#2fbf71" stroke-width="7" stroke-linecap="round"/>');
    } else if (bg === 'volcano') {
      defs.push('<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b0a24"/><stop offset="1" stop-color="#b8361f"/></linearGradient>');
      d.push('<rect width="200" height="200" fill="url(#' + id + 'b)"/><path d="M-10,200 L60,90 L80,100 L95,82 L170,200 Z" fill="#4a1d14"/><path d="M60,90 L80,100 L95,82 L84,120 L70,108 Z" fill="#ff8a1f"/>');
      [[150, 30], [176, 60], [130, 18]].forEach(function (q) { d.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3" fill="#ffd23f"/>'); });
    } else {
      d.push('<rect width="200" height="200" fill="' + (av.bgColor || DEFAULT.bgColor) + '"/>');
      d.push('<circle cx="100" cy="92" r="78" fill="#fff" opacity=".25"/>');
    }

    // aura (behind the character)
    var au = av.aura;
    if (au === 'glow') {
      defs.push('<radialGradient id="' + id + 'au"><stop offset="0" stop-color="#fff7b0" stop-opacity=".95"/><stop offset=".6" stop-color="#ffe066" stop-opacity=".45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>');
      d.push('<circle cx="100" cy="96" r="96" fill="url(#' + id + 'au)"/>');
    } else if (au === 'bubbles') {
      [[30, 60, 14], [170, 50, 18], [24, 130, 10], [176, 128, 12], [60, 22, 8], [146, 20, 9]].forEach(function (q) { d.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="2.5"/><circle cx="' + (q[0] - q[2] * .35) + '" cy="' + (q[1] - q[2] * .35) + '" r="' + (q[2] * .25) + '" fill="#fff"/>'); });
    } else if (au === 'hearts') {
      [[28, 50, 1], [172, 44, 1.2], [22, 128, .8], [178, 126, .9], [100, 14, .8]].forEach(function (q) { d.push('<path transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ')" d="M0,8 C-14,-2 -10,-14 0,-6 C10,-14 14,-2 0,8 Z" fill="#ff5c8a"/>'); });
    } else if (au === 'sunburst') {
      var rays = '';
      for (var ri = 0; ri < 16; ri++) { var a1 = ri * Math.PI / 8, a2 = a1 + Math.PI / 16; rays += 'M100,96 L' + (100 + 160 * Math.cos(a1)).toFixed(1) + ',' + (96 + 160 * Math.sin(a1)).toFixed(1) + ' L' + (100 + 160 * Math.cos(a2)).toFixed(1) + ',' + (96 + 160 * Math.sin(a2)).toFixed(1) + ' Z '; }
      d.push('<path d="' + rays + '" fill="#fff6c2" opacity=".55"/>');
    } else if (au === 'flames') {
      d.push('<path d="M20,205 C10,160 34,150 30,118 C46,140 50,120 46,96 C66,120 70,140 66,160 Z M180,205 C190,160 166,150 170,118 C154,140 150,120 154,96 C134,120 130,140 134,160 Z" fill="#ff7b1c"/>' +
        '<path d="M30,205 C24,178 40,168 38,148 C48,162 52,150 50,136 C60,152 60,170 56,186 Z M170,205 C176,178 160,168 162,148 C152,162 148,150 150,136 C140,152 140,170 144,186 Z" fill="#ffd23f"/>');
    } else if (au === 'lightning') {
      d.push('<path d="M30,20 L14,70 L30,70 L18,118 L46,58 L30,58 L42,20 Z M170,40 L154,90 L170,90 L158,138 L186,78 L170,78 L182,40 Z" fill="#ffe14d" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>');
    } else if (au === 'rainbow') {
      ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'].forEach(function (c, ri) { d.push('<path d="M' + (8 + ri * 7) + ',150 A' + (92 - ri * 7) + ',' + (92 - ri * 7) + ' 0 0 1 ' + (192 - ri * 7) + ',150" fill="none" stroke="' + c + '" stroke-width="7"/>'); });
    } else if (au === 'galaxy') {
      defs.push('<radialGradient id="' + id + 'au"><stop offset="0" stop-color="#c084fc" stop-opacity=".9"/><stop offset=".55" stop-color="#4c1d95" stop-opacity=".85"/><stop offset="1" stop-color="#1e1b4b" stop-opacity="0"/></radialGradient>');
      d.push('<circle cx="100" cy="96" r="100" fill="url(#' + id + 'au)"/><ellipse cx="100" cy="96" rx="96" ry="30" fill="none" stroke="#f0abfc" stroke-width="3" opacity=".7" transform="rotate(-20 100 96)"/>');
      [[30, 40], [170, 30], [20, 150], [182, 160], [60, 16], [150, 186]].forEach(function (q, qi) { d.push(star(q[0], q[1], qi % 2 ? 4 : 6, '#fff')); });
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
    } else if (o === 'tux') {
      d.push('<path d="' + body + '" fill="#1f2937"/><path d="M84,134 L100,190 L116,134 Z" fill="#fff"/><path d="M100,150 L88,143 V157 Z M100,150 L112,143 V157 Z" fill="#e11d48"/><circle cx="100" cy="170" r="2.5" fill="#1f2937"/><circle cx="100" cy="182" r="2.5" fill="#1f2937"/>');
    } else if (o === 'hero') {
      d.push('<path d="M40,140 L28,205 L172,205 L160,140 Z" fill="#e11d48"/><path d="' + body + '" fill="' + oc + '"/><circle cx="100" cy="172" r="18" fill="#ffd23f"/><path d="M104,158 L92,174 H101 L96,188 L110,170 H101 Z" fill="' + ocD + '"/>');
    } else if (o === 'goldarmor') {
      defs.push('<linearGradient id="' + id + 'ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#f5b301"/><stop offset="1" stop-color="#b8860b"/></linearGradient>');
      d.push('<path d="' + body + '" fill="url(#' + id + 'ga)"/><path d="M58,162 H142 M54,184 H146" stroke="#b8860b" stroke-width="4"/><path d="M78,136 L100,160 L122,136" fill="none" stroke="#fff7d1" stroke-width="5"/><path d="M100,166 L110,178 L100,192 L90,178 Z" fill="#38bdf8" stroke="#fff" stroke-width="2"/>');
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

    if (x === 'stars') d.push(star(82, 86, 15, '#ff5c8a') + star(118, 86, 15, '#ff5c8a') + '<path d="M95,84 H105" stroke="#be185d" stroke-width="3"/>');
    if (x === 'visor') d.push('<rect x="58" y="74" width="84" height="22" rx="11" fill="#22d3ee" fill-opacity=".7" stroke="#0e7490" stroke-width="3"/><path d="M66,82 H118" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>');
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

    if (t === 'party') d.push('<path d="M76,48 L104,-6 L124,52 Z" fill="#a855f7"/><path d="M84,34 L118,40 M92,18 L112,22" stroke="#ffd23f" stroke-width="5"/><circle cx="104" cy="-4" r="8" fill="#ff5c8a"/>');
    if (t === 'beret') d.push('<ellipse cx="96" cy="40" rx="50" ry="16" fill="#e11d48" transform="rotate(-10 96 40)"/><circle cx="94" cy="22" r="5" fill="#9f1239"/>');
    if (t === 'tophat') d.push('<ellipse cx="100" cy="46" rx="56" ry="10" fill="#111827"/><rect x="70" y="-6" width="60" height="52" rx="4" fill="#111827"/><rect x="70" y="30" width="60" height="9" fill="' + oc + '"/>');
    if (t === 'horns') d.push('<path d="M54,62 C54,30 76,22 100,22 C124,22 146,30 146,62 Z" fill="#94a3b8"/><path d="M54,62 H146" stroke="#64748b" stroke-width="6"/><path d="M58,44 C36,40 30,20 38,6 C44,22 54,28 64,32 Z M142,44 C164,40 170,20 162,6 C156,22 146,28 136,32 Z" fill="#fff4dc" stroke="#d6c7a1" stroke-width="2"/>');
    if (t === 'halo') d.push('<ellipse cx="100" cy="18" rx="38" ry="10" fill="none" stroke="#ffe14d" stroke-width="7"/><ellipse cx="100" cy="18" rx="38" ry="10" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>');
    // pet (bottom right)
    var p = av.pet;
    if (p && p !== 'none') {
      d.push('<g transform="translate(150,152)">');
      if (p === 'cat') d.push('<path d="M-18,-6 L-16,-26 L-4,-14 Z M18,-6 L16,-26 L4,-14 Z" fill="#f59e0b"/><circle r="20" fill="#f59e0b"/><circle cx="-7" cy="-2" r="3" fill="' + ink + '"/><circle cx="7" cy="-2" r="3" fill="' + ink + '"/><path d="M-4,7 Q0,10 4,7" stroke="' + ink + '" stroke-width="2" fill="none"/><path d="M-20,4 H-10 M20,4 H10" stroke="' + ink + '" stroke-width="1.5"/>');
      if (p === 'bug') d.push('<circle cx="0" cy="-16" r="8" fill="' + ink + '"/><circle r="18" fill="#ef4444"/><path d="M0,-18 V18" stroke="' + ink + '" stroke-width="2.5"/><circle cx="-8" cy="-4" r="4" fill="' + ink + '"/><circle cx="8" cy="6" r="4" fill="' + ink + '"/><circle cx="7" cy="-8" r="3" fill="' + ink + '"/>');
      if (p === 'robot') d.push('<path d="M0,-22 V-30" stroke="#64748b" stroke-width="3"/><circle cy="-31" r="4" fill="#ef4444"/><rect x="-20" y="-22" width="40" height="36" rx="9" fill="#94a3b8"/><rect x="-14" y="-15" width="28" height="16" rx="5" fill="#0f172a"/><circle cx="-6" cy="-7" r="3.5" fill="#22d3ee"/><circle cx="6" cy="-7" r="3.5" fill="#22d3ee"/><rect x="-8" y="5" width="16" height="4" rx="2" fill="#475569"/>');
      if (p === 'slime') d.push('<path d="M-22,16 C-24,-10 -10,-24 0,-24 C10,-24 24,-10 22,16 Z" fill="#4ade80" opacity=".9"/><circle cx="-7" cy="-4" r="4" fill="' + ink + '"/><circle cx="7" cy="-4" r="4" fill="' + ink + '"/><circle cx="-12" cy="-14" r="3" fill="#fff" opacity=".7"/>');
      if (p === 'ghost') d.push('<path d="M-18,20 L-18,-4 A18,18 0 0 1 18,-4 L18,20 L12,14 L6,20 L0,14 L-6,20 L-12,14 Z" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><circle cx="-6" cy="-4" r="3.5" fill="' + ink + '"/><circle cx="6" cy="-4" r="3.5" fill="' + ink + '"/><ellipse cx="0" cy="6" rx="3" ry="4" fill="' + ink + '"/>');
      if (p === 'owl') d.push('<path d="M-18,-12 L-12,-26 L-6,-16 Z M18,-12 L12,-26 L6,-16 Z" fill="#8b5a2b"/><ellipse rx="19" ry="21" fill="#a16207"/><ellipse cy="8" rx="11" ry="10" fill="#fde68a"/><circle cx="-7" cy="-6" r="7" fill="#fff"/><circle cx="7" cy="-6" r="7" fill="#fff"/><circle cx="-7" cy="-6" r="3.5" fill="' + ink + '"/><circle cx="7" cy="-6" r="3.5" fill="' + ink + '"/><path d="M-3,0 L3,0 L0,5 Z" fill="#f59e0b"/>');
      if (p === 'axolotl') d.push('<path d="M-20,-14 l-8,-6 M-22,-6 l-9,0 M-20,2 l-8,5 M20,-14 l8,-6 M22,-6 l9,0 M20,2 l8,5" stroke="#ff5c8a" stroke-width="4" stroke-linecap="round"/><ellipse rx="20" ry="17" fill="#ffb3d1"/><circle cx="-7" cy="-3" r="3" fill="' + ink + '"/><circle cx="7" cy="-3" r="3" fill="' + ink + '"/><path d="M-5,6 Q0,10 5,6" stroke="' + ink + '" stroke-width="2" fill="none"/><circle cx="-12" cy="4" r="3" fill="#ff5c8a" opacity=".5"/><circle cx="12" cy="4" r="3" fill="#ff5c8a" opacity=".5"/>');
      if (p === 'phoenix') d.push('<path d="M-6,10 C-30,4 -34,-20 -22,-30 C-20,-16 -12,-12 -4,-12 Z" fill="#ff7b1c"/><path d="M4,12 C20,30 6,40 -6,30 C4,28 4,22 -2,16 Z" fill="#ffd23f"/><circle r="15" fill="#ef4444"/><path d="M-2,-14 L2,-28 L6,-14 Z M4,-13 L12,-24 L10,-11 Z" fill="#ffd23f"/><circle cx="5" cy="-3" r="3.2" fill="' + ink + '"/><path d="M13,0 L22,3 L13,6 Z" fill="#f59e0b"/>');
      if (p === 'dragon') d.push('<path d="M10,-8 L34,-26 L28,2 Z" fill="#a3e635"/><circle r="18" fill="#22c55e"/><path d="M-10,-14 L-14,-28 L-2,-17 Z M10,-14 L14,-28 L2,-17 Z" fill="#fbbf24"/><circle cx="-6" cy="-3" r="3.5" fill="' + ink + '"/><circle cx="6" cy="-3" r="3.5" fill="' + ink + '"/><path d="M-6,8 Q0,12 6,8" stroke="' + ink + '" stroke-width="2" fill="none"/>');
      d.push('</g>');
    }
    // foreground effects
    var ef = av.effect;
    function sparkle(cx, cy, r, c) { return '<path d="M' + cx + ',' + (cy - r) + ' Q' + cx + ',' + cy + ' ' + (cx + r) + ',' + cy + ' Q' + cx + ',' + cy + ' ' + cx + ',' + (cy + r) + ' Q' + cx + ',' + cy + ' ' + (cx - r) + ',' + cy + ' Q' + cx + ',' + cy + ' ' + cx + ',' + (cy - r) + ' Z" fill="' + c + '"/>'; }
    if (ef === 'confetti') [[20, 30, '#ef4444', 20], [178, 24, '#3b82f6', -30], [16, 110, '#facc15', 50], [184, 96, '#22c55e', -10], [44, 182, '#a855f7', 30], [150, 12, '#ff5c8a', 60]].forEach(function (q) { d.push('<rect x="' + (q[0] - 5) + '" y="' + (q[1] - 3) + '" width="10" height="6" rx="1.5" fill="' + q[2] + '" transform="rotate(' + q[3] + ' ' + q[0] + ' ' + q[1] + ')"/>'); });
    if (ef === 'sparkles') [[26, 30, 10], [176, 40, 13], [18, 120, 8], [182, 118, 9], [150, 14, 6]].forEach(function (q) { d.push(sparkle(q[0], q[1], q[2], '#fff') + sparkle(q[0], q[1], q[2] * .45, '#ffe14d')); });
    if (ef === 'stars') [[28, 34, 9], [172, 30, 11], [20, 104, 7], [182, 100, 8], [100, 8, 7]].forEach(function (q) { d.push(star(q[0], q[1], q[2], '#ffd23f', '#f59e0b')); });
    if (ef === 'shine') d.push('<path d="M-20,200 L90,-10 L120,-10 L10,200 Z" fill="#fff" opacity=".22"/><path d="M30,200 L140,-10 L150,-10 L40,200 Z" fill="#fff" opacity=".18"/>' + sparkle(160, 36, 14, '#fff') + sparkle(40, 150, 9, '#fff'));
    if (ef === 'gems') [[26, 44, '#38bdf8'], [174, 40, '#f472b6'], [20, 124, '#a78bfa'], [180, 124, '#34d399'], [100, 10, '#ffd23f']].forEach(function (q) { d.push('<path d="M' + q[0] + ',' + (q[1] - 11) + ' L' + (q[0] + 9) + ',' + q[1] + ' L' + q[0] + ',' + (q[1] + 12) + ' L' + (q[0] - 9) + ',' + q[1] + ' Z" fill="' + q[2] + '" stroke="#fff" stroke-width="2"/><path d="M' + q[0] + ',' + (q[1] - 11) + ' L' + (q[0] + 9) + ',' + q[1] + ' L' + q[0] + ',' + q[1] + ' Z" fill="#fff" opacity=".5"/>'); });
    d.push('</g>'); // end clip

    // frame
    var f = av.frame;
    if (f === 'silver') d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="#cbd5e1" stroke-width="8"/>');
    if (f === 'gold') d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="#f5b301" stroke-width="9"/><rect x="10" y="10" width="180" height="180" rx="26" fill="none" stroke="#fde68a" stroke-width="2"/>');
    if (f === 'rainbow') {
      defs.push('<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef4444"/><stop offset=".25" stop-color="#facc15"/><stop offset=".5" stop-color="#22c55e"/><stop offset=".75" stop-color="#3b82f6"/><stop offset="1" stop-color="#a855f7"/></linearGradient>');
      d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="url(#' + id + 'r)" stroke-width="9"/>');
    }

    if (f === 'neon') d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="#22d3ee" stroke-width="8"/><rect x="11" y="11" width="178" height="178" rx="25" fill="none" stroke="#f0abfc" stroke-width="4"/>');
    if (f === 'diamond') {
      defs.push('<linearGradient id="' + id + 'dm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0f7ff"/><stop offset=".5" stop-color="#7dd3fc"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient>');
      d.push('<rect x="4" y="4" width="192" height="192" rx="31" fill="none" stroke="url(#' + id + 'dm)" stroke-width="10"/>');
      [[18, 18], [182, 18], [18, 182], [182, 182]].forEach(function (q) { d.push('<path d="M' + q[0] + ',' + (q[1] - 12) + ' L' + (q[0] + 10) + ',' + q[1] + ' L' + q[0] + ',' + (q[1] + 12) + ' L' + (q[0] - 10) + ',' + q[1] + ' Z" fill="#fff" stroke="#7dd3fc" stroke-width="2"/>'); });
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

  function titleText(av) { var t = itemOf('title', (av || {}).title); return t && t.id !== 'none' ? t.name : ''; }
  return { RARITY: RARITY, SHOP: SHOP, priceOf: priceOf, itemOf: itemOf, coinsFor: coinsFor, titleText: titleText, CATALOG: CATALOG, COLORS: COLORS, COLOR_UNLOCK: COLOR_UNLOCK, DEFAULT: DEFAULT, svg: svg,
    isUnlocked: isUnlocked, unlockText: unlockText, sanitize: sanitize, randomAvatar: randomAvatar, allUnlockables: allUnlockables };
})();
