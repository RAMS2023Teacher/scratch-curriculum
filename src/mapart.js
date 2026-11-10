/* Scratch Quest — quest map scenery in a bold game-board style (original design).
 * Bright raised tiles for each area, big simple shapes, a thick white road. Static and cached:
 * no animations or filters (those made the map flicker on Chromebooks).
 * Coordinates match SQ_RULES.NODES on a 1000 × 1990 map.
 */
var SQ_MAPART = (function () {
  var o;
  function P(s) { o.push(s); }
  function f(n) { return Math.round(n * 10) / 10; }
  // area colors: [tile, edge (3D side), pattern tint, deco]
  var C = {
    trunk: ['#5fe08f', '#22a35a', '#7ff0a8', '#1f8a4c'],
    games: ['#ffb45c', '#e07b1f', '#ffc985', '#c4610d'],
    stories: ['#c79bff', '#8f4fe6', '#d9b8ff', '#7a3bd1'],
    apps: ['#5fd6f5', '#1a9ccc', '#8de4fa', '#0f7fab'],
    merge: ['#ffd84f', '#d4a20b', '#ffe68a', '#b98a00'],
    finale: ['#ff94bd', '#e0457b', '#ffb6d2', '#c2346a']
  };
  function tile(x, y, w, h, k) {
    var c = C[k];
    P('<rect x="' + x + '" y="' + (y + 12) + '" width="' + w + '" height="' + h + '" rx="30" fill="' + c[1] + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="30" fill="' + c[0] + '"/>' +
      '<rect x="' + (x + 14) + '" y="' + (y + 8) + '" width="' + (w - 28) + '" height="10" rx="5" fill="#fff" opacity=".25"/>');
  }
  function dots(x, y, w, h, color, step) { // soft polka-dot pattern inside a tile
    step = step || 70;
    for (var yy = y + 40; yy < y + h - 20; yy += step) for (var xx = x + 30 + ((yy / step) % 2 ? step / 2 : 0); xx < x + w - 20; xx += step) {
      P('<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="9" fill="' + color + '" opacity=".55"/>');
    }
  }
  // chunky decorations (2 tones, no outlines)
  function tree(x, y, s, c) { s = s || 1; P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><rect x="-6" y="4" width="12" height="20" rx="4" fill="#8a4f2a"/><circle cy="-8" r="22" fill="' + (c || '#1f8a4c') + '"/><circle cx="-7" cy="-15" r="8" fill="#fff" opacity=".25"/></g>'); }
  function cube(x, y, c, d, s) { s = s || 26; P('<rect x="' + x + '" y="' + (y + 5) + '" width="' + s + '" height="' + s + '" rx="5" fill="' + d + '"/><rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="5" fill="' + c + '"/><rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="7" height="7" rx="2" fill="#fff" opacity=".5"/>'); }
  function coin(x, y) { P('<circle cx="' + x + '" cy="' + (y + 3) + '" r="11" fill="#c78a00"/><circle cx="' + x + '" cy="' + y + '" r="11" fill="#ffd23f"/><rect x="' + (x - 2) + '" y="' + (y - 6) + '" width="4" height="12" rx="2" fill="#c78a00"/>'); }
  function star(x, y, r, c) {
    var pts = [];
    for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .48 : r; pts.push(f(x + rr * Math.cos(a)) + ',' + f(y + rr * Math.sin(a))); }
    P('<polygon points="' + pts.join(' ') + '" fill="' + c + '"/>');
  }
  function book(x, y, c) { P('<g transform="translate(' + x + ',' + y + ')"><rect x="-26" y="-12" width="52" height="30" rx="5" fill="' + c + '"/><rect x="-22" y="-16" width="21" height="28" rx="3" fill="#fff"/><rect x="1" y="-16" width="21" height="28" rx="3" fill="#fff"/><path d="M-18,-8 h13 M-18,-2 h13 M5,-8 h13 M5,-2 h13" stroke="#d9c8f5" stroke-width="3" stroke-linecap="round"/></g>'); }
  function gear(x, y, r, c) {
    var pts = [];
    for (var i = 0; i < 16; i++) { var a = Math.PI * 2 * i / 16, rr = i % 2 ? r : r * 1.3; pts.push(f(x + rr * Math.cos(a)) + ',' + f(y + rr * Math.sin(a))); }
    P('<polygon points="' + pts.join(' ') + '" fill="' + c + '"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .45) + '" fill="#fff" opacity=".85"/>');
  }
  function crystal(x, y, s, c) { s = s || 1; P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M0,-30 L13,-6 L0,18 L-13,-6 Z" fill="' + c + '"/><path d="M0,-30 L13,-6 L0,-2 Z" fill="#fff" opacity=".5"/></g>'); }
  function mountain(x, y, s, c, snow) { s = s || 1; P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-46,28 L0,-36 L46,28 Z" fill="' + c + '"/><path d="M-15,-15 L0,-36 L15,-15 L6,-10 L0,-17 L-6,-10 Z" fill="' + (snow || '#fff') + '"/></g>'); }
  function castle(x, y) {
    P('<g transform="translate(' + x + ',' + y + ')"><rect x="-56" y="-14" width="112" height="62" rx="6" fill="#c2346a"/><rect x="-56" y="-20" width="112" height="62" rx="6" fill="#fff"/>' +
      '<rect x="-76" y="-50" width="32" height="92" rx="6" fill="#fff"/><rect x="44" y="-50" width="32" height="92" rx="6" fill="#fff"/>' +
      '<path d="M-82,-50 L-60,-86 L-38,-50 Z M38,-50 L60,-86 L82,-50 Z" fill="#ffd23f"/><rect x="-15" y="6" width="30" height="36" rx="15" fill="#c2346a"/>' +
      '<rect x="-66" y="-30" width="12" height="16" rx="6" fill="#ff94bd"/><rect x="54" y="-30" width="12" height="16" rx="6" fill="#ff94bd"/></g>');
  }
  function trophy(x, y) { P('<g transform="translate(' + x + ',' + y + ')"><rect x="-14" y="16" width="28" height="8" rx="3" fill="#c78a00"/><rect x="-5" y="4" width="10" height="14" fill="#ffd23f"/><path d="M-18,-20 h36 v10 a18,18 0 0 1 -36,0 Z" fill="#ffd23f"/><path d="M-18,-14 h-8 a8,8 0 0 0 8,10 M18,-14 h8 a8,8 0 0 1 -8,10" fill="none" stroke="#ffd23f" stroke-width="4"/></g>'); }
  function sparkle(x, y, r, c) { P('<path d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + ' Z" fill="' + (c || '#fff') + '"/>'); }

  var cache = null;
  function scene() {
    if (cache) return cache;
    o = [];
    // purple world with soft bubbles and sparkles
    P('<defs><linearGradient id="mapsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b45f0"/><stop offset="1" stop-color="#4b1fb0"/></linearGradient></defs>');
    P('<rect width="1000" height="1990" fill="url(#mapsky)"/>');
    [[110, 160, 90], [900, 330, 120], [80, 1080, 110], [930, 1140, 90], [120, 1760, 120], [890, 1820, 100], [500, 1990, 160]].forEach(function (b) {
      P('<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#fff" opacity=".06"/>');
    });
    [[60, 60, 9], [190, 330, 7], [140, 500, 10], [850, 120, 8], [940, 520, 10], [830, 600, 6], [60, 980, 7], [180, 1220, 9], [940, 990, 8], [820, 1230, 7], [70, 1620, 9], [180, 1940, 7], [930, 1640, 8], [810, 1950, 9]].forEach(function (s) { sparkle(s[0], s[1], s[2], '#ffe68a'); });

    // Sprite Meadow
    tile(250, 30, 500, 600, 'trunk'); dots(250, 30, 500, 600, C.trunk[2], 90);
    tree(300, 150, 1.1, C.trunk[3]); tree(305, 460, 1, C.trunk[3]); tree(705, 260, 1.05, C.trunk[3]); tree(700, 530, .9, C.trunk[3]); tree(320, 580, .7, C.trunk[3]);
    star(690, 120, 16, '#fff'); star(300, 300, 11, '#fff');
    // Arcade Peaks + II
    tile(40, 640, 290, 300, 'games'); dots(40, 640, 290, 300, C.games[2]);
    mountain(282, 714, .75, C.games[3]); cube(58, 770, '#7c4dff', '#5a2fd6'); cube(84, 770, '#ff4d6d', '#c92a4a'); cube(71, 744, '#3a86ff', '#2563c4'); coin(285, 830); coin(80, 905); coin(108, 915);
    tile(40, 1275, 290, 300, 'games'); dots(40, 1275, 290, 300, C.games[2]);
    mountain(275, 1352, .85, '#c4610d', '#ffffff'); cube(58, 1420, '#26c06b', '#188a4b'); cube(84, 1420, '#ffd23f', '#c78a00'); coin(80, 1540); coin(288, 1470);
    // Story Woods + II
    tile(355, 640, 290, 300, 'stories'); dots(355, 640, 290, 300, C.stories[2]);
    book(605, 725, '#7a3bd1'); star(390, 900, 15, '#fff'); star(612, 905, 10, '#ffe68a'); tree(392, 790, .8, C.stories[3]);
    tile(355, 1275, 290, 300, 'stories'); dots(355, 1275, 290, 300, C.stories[2]);
    book(395, 1340, '#7a3bd1'); star(612, 1335, 14, '#ffe68a'); tree(612, 1530, .85, C.stories[3]); star(392, 1535, 10, '#fff');
    // Gadget Bay + II
    tile(670, 640, 290, 300, 'apps'); dots(670, 640, 290, 300, C.apps[2]);
    gear(925, 725, 18, C.apps[3]); gear(902, 752, 10, '#fff'); gear(705, 905, 14, C.apps[3]); cube(905, 880, '#ffd23f', '#c78a00');
    tile(670, 1275, 290, 300, 'apps'); dots(670, 1275, 290, 300, C.apps[2]);
    gear(925, 1360, 18, C.apps[3]); gear(705, 1540, 13, C.apps[3]); cube(905, 1515, '#ff4d6d', '#c92a4a');
    // Debug Caves
    tile(250, 955, 500, 270, 'merge'); dots(250, 955, 500, 270, C.merge[2], 80);
    P('<path d="M266,1213 L266,1125 Q266,1072 314,1072 Q362,1072 362,1125 L362,1213 Z" fill="#b98a00"/><path d="M284,1213 L284,1130 Q284,1095 314,1095 Q344,1095 344,1130 L344,1213 Z" fill="#4a2e00" opacity=".75"/>');
    crystal(690, 1020, 1.1, '#7c4dff'); crystal(720, 1048, .7, '#3a86ff'); crystal(680, 1180, .9, '#ff4d6d'); crystal(330, 1010, .8, '#26c06b');
    // Showcase Castle
    tile(250, 1590, 500, 370, 'finale'); dots(250, 1590, 500, 370, C.finale[2], 80);
    castle(655, 1835); trophy(310, 1890); star(300, 1700, 14, '#fff'); star(720, 1690, 11, '#ffe68a'); sparkle(340, 1770, 10, '#fff');

    cache = o.join('');
    return cache;
  }
  // White pill label with the area name
  function sign(x, y, label, icon, color) {
    var w = Math.round(label.length * 11.2 + 58);
    return '<g class="sign"><rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="36" rx="18" fill="#2a1650" opacity=".25"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="36" rx="18" fill="#fff"/>' +
      '<circle cx="' + (x + 19) + '" cy="' + (y + 18) + '" r="13" fill="' + color + '"/>' +
      '<use href="#i-' + icon + '" x="' + (x + 10) + '" y="' + (y + 9) + '" width="18" height="18" class="sign-ico"/>' +
      '<text x="' + (x + 40) + '" y="' + (y + 25) + '" class="sign-text" style="fill:' + color + '">' + label + '</text></g>';
  }
  function banner(cx, y, text) {
    var w = Math.round(text.length * 10.4 + 56), x = cx - w / 2;
    return '<g class="banner-rib"><rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="34" rx="17" fill="#c78a00"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="17" fill="#ffd23f"/>' +
      '<text x="' + cx + '" y="' + (y + 23) + '" text-anchor="middle" class="banner-text">' + text + '</text></g>';
  }
  // darker "3D side" color for a node of each area
  function edgeColor(branch) { return (C[branch] || C.trunk)[1]; }
  return { scene: scene, sign: sign, banner: banner, edgeColor: edgeColor };
})();
