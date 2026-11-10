/* Scratch Quest — illustrated quest map scenery (flat storybook vector art).
 * Everything here is static: no animations, no filters (those made the map flicker on Chromebooks).
 * The scenery string is built once and cached. Coordinates match SQ_RULES.NODES on a 1000 × 1990 map.
 */
var SQ_MAPART = (function () {
  var o;
  function P(s) { o.push(s); }
  function f(n) { return Math.round(n * 10) / 10; }

  // ---------- little drawings ----------
  function tree(x, y, s, c1, c2) { // round storybook tree
    s = s || 1; c1 = c1 || '#4caf50'; c2 = c2 || '#6fcf72';
    P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="20" rx="16" ry="5" fill="#000" opacity=".1"/><rect x="-4" y="2" width="8" height="18" rx="2" fill="#8d6238"/>' +
      '<circle cy="-10" r="20" fill="' + c1 + '"/><circle cx="-9" cy="-4" r="12" fill="' + c1 + '"/><circle cx="-6" cy="-16" r="9" fill="' + c2 + '"/></g>');
  }
  function pine(x, y, s, c1, c2) {
    s = s || 1; c1 = c1 || '#2f7d4f'; c2 = c2 || '#3f9a62';
    P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="22" rx="14" ry="4" fill="#000" opacity=".1"/><rect x="-3" y="12" width="6" height="10" fill="#7a5230"/>' +
      '<path d="M0,-34 L16,-6 L8,-6 L20,14 L-20,14 L-8,-6 L-16,-6 Z" fill="' + c1 + '"/><path d="M0,-34 L16,-6 L8,-6 L20,14 L2,14 Z" fill="' + c2 + '" opacity=".55"/></g>');
  }
  function flowers(x, y, c) {
    c = c || ['#ff8fab', '#ffd166', '#ffffff'];
    [[0, 0], [12, 5], [-10, 7], [5, 13]].forEach(function (p, i) {
      P('<circle cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="3.2" fill="' + c[i % c.length] + '"/><circle cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="1.2" fill="#f4a300"/>');
    });
  }
  function tuft(x, y, c) { P('<path d="M' + x + ',' + y + ' l3,-9 l2,9 l3,-7 l2,7" fill="none" stroke="' + (c || '#8fc274') + '" stroke-width="2" stroke-linecap="round"/>'); }
  function mountain(x, y, s, body, shade, snow) {
    s = s || 1;
    P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-46,26 L0,-38 L46,26 Z" fill="' + body + '"/><path d="M0,-38 L46,26 L10,26 Z" fill="' + shade + '"/>' +
      (snow ? '<path d="M-14,-18 L0,-38 L14,-18 L7,-13 L0,-20 L-7,-13 Z" fill="' + snow + '"/>' : '') + '</g>');
  }
  function cube(x, y, c, d) { // pixel block
    P('<rect x="' + x + '" y="' + y + '" width="18" height="18" fill="' + c + '"/><rect x="' + x + '" y="' + (y + 14) + '" width="18" height="4" fill="' + d + '"/><rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="5" height="5" fill="#fff" opacity=".45"/>');
  }
  function coin(x, y) { P('<circle cx="' + x + '" cy="' + y + '" r="8" fill="#f6c343" stroke="#d99a1e" stroke-width="2"/><rect x="' + (x - 1.5) + '" y="' + (y - 4) + '" width="3" height="8" rx="1" fill="#d99a1e"/>'); }
  function mushroom(x, y, cap) {
    P('<rect x="' + (x - 4) + '" y="' + y + '" width="8" height="11" rx="3" fill="#f6ead7"/><path d="M' + (x - 13) + ',' + (y + 2) + ' Q' + x + ',' + (y - 18) + ' ' + (x + 13) + ',' + (y + 2) + ' Z" fill="' + (cap || '#e5484d') + '"/>' +
      '<circle cx="' + (x - 4) + '" cy="' + (y - 4) + '" r="2.2" fill="#fff"/><circle cx="' + (x + 5) + '" cy="' + (y - 2) + '" r="1.6" fill="#fff"/>');
  }
  function book(x, y, s) {
    s = s || 1;
    P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-30,6 L0,12 L30,6 L30,-14 L0,-8 L-30,-14 Z" fill="#8a5a3c"/><path d="M-27,2 Q-14,-2 0,4 L0,-12 Q-14,-18 -27,-14 Z" fill="#fffaf0"/>' +
      '<path d="M27,2 Q14,-2 0,4 L0,-12 Q14,-18 27,-14 Z" fill="#fff4e0"/><path d="M-20,-9 h12 M-20,-4 h12 M8,-9 h12 M8,-4 h12" stroke="#c9b79c" stroke-width="1.5"/></g>');
  }
  function gear(x, y, r, c) {
    var pts = [];
    for (var i = 0; i < 16; i++) { var a = Math.PI * 2 * i / 16, rr = i % 2 ? r : r * 1.28; pts.push(f(x + rr * Math.cos(a)) + ',' + f(y + rr * Math.sin(a))); }
    P('<polygon points="' + pts.join(' ') + '" fill="' + c + '"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .42) + '" fill="#f5e7c4"/>');
  }
  function lighthouse(x, y, light) {
    P('<g transform="translate(' + x + ',' + y + ')"><path d="M-10,40 L-6,-10 L6,-10 L10,40 Z" fill="#fff"/><path d="M-9,28 L-8,18 L8,18 L9,28 Z M-7,6 L-7,-2 L7,-2 L7,6 Z" fill="#e5484d"/>' +
      '<rect x="-8" y="-20" width="16" height="10" fill="' + (light ? '#ffe28a' : '#9ad1f0') + '" stroke="#37474f" stroke-width="2"/><path d="M-10,-20 L0,-30 L10,-20 Z" fill="#37474f"/>' +
      (light ? '<path d="M8,-17 L40,-26 L40,-6 Z" fill="#ffe28a" opacity=".55"/>' : '') + '</g>');
  }
  function wave(x, y, c) { P('<path d="M' + x + ',' + y + ' q6,-6 12,0 t12,0" fill="none" stroke="' + (c || '#ffffff') + '" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>'); }
  function crystal(x, y, s, c, d) {
    s = s || 1;
    P('<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M0,-26 L10,-4 L0,16 L-10,-4 Z" fill="' + c + '"/><path d="M0,-26 L10,-4 L0,0 Z" fill="#fff" opacity=".45"/>' +
      '<path d="M-14,16 L-18,0 L-10,-10 L-6,8 Z" fill="' + d + '"/><path d="M12,16 L16,2 L22,10 L18,18 Z" fill="' + d + '"/></g>');
  }
  function rock(x, y, s, c) { s = s || 1; P('<path transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M-26,12 Q-28,-6 -12,-14 Q4,-24 18,-10 Q30,0 24,12 Z" fill="' + (c || '#8e86a3') + '"/>'); }
  function castle(x, y) {
    P('<g transform="translate(' + x + ',' + y + ')"><ellipse cx="0" cy="44" rx="78" ry="10" fill="#000" opacity=".08"/>' +
      '<rect x="-50" y="-20" width="100" height="64" fill="#efe3f2"/><rect x="-50" y="-20" width="100" height="10" fill="#d9c6e2"/>' +
      [-50, -30, -10, 10, 30].map(function (cx) { return '<rect x="' + cx + '" y="-30" width="12" height="10" fill="#efe3f2"/>'; }).join('') +
      '<rect x="-72" y="-46" width="30" height="90" fill="#e6d4ec"/><rect x="42" y="-46" width="30" height="90" fill="#e6d4ec"/>' +
      '<path d="M-78,-46 L-57,-82 L-36,-46 Z M36,-46 L57,-82 L78,-46 Z" fill="#c2457a"/><path d="M-57,-82 v-16 l14,5 l-14,5" fill="#f6c343"/><path d="M57,-82 v-16 l14,5 l-14,5" fill="#4aa3df"/>' +
      '<rect x="-14" y="10" width="28" height="34" rx="14" fill="#7a3b5c"/><rect x="-64" y="-26" width="12" height="16" rx="6" fill="#7a3b5c"/><rect x="52" y="-26" width="12" height="16" rx="6" fill="#7a3b5c"/>' +
      '<rect x="-30" y="-4" width="10" height="12" rx="5" fill="#7a3b5c"/><rect x="20" y="-4" width="10" height="12" rx="5" fill="#7a3b5c"/></g>');
  }
  function bunting(x1, x2, y, colors) {
    P('<path d="M' + x1 + ',' + y + ' Q' + ((x1 + x2) / 2) + ',' + (y + 22) + ' ' + x2 + ',' + y + '" fill="none" stroke="#9b7a8c" stroke-width="2"/>');
    var n = 9;
    for (var i = 1; i < n; i++) {
      var t = i / n, bx = x1 + (x2 - x1) * t, by = y + 22 * 4 * t * (1 - t) * .5 + 1;
      P('<path d="M' + f(bx - 7) + ',' + f(by) + ' L' + f(bx + 7) + ',' + f(by) + ' L' + f(bx) + ',' + f(by + 14) + ' Z" fill="' + colors[i % colors.length] + '"/>');
    }
  }
  function star(x, y, r, c) {
    var pts = [];
    for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; pts.push(f(x + rr * Math.cos(a)) + ',' + f(y + rr * Math.sin(a))); }
    P('<polygon points="' + pts.join(' ') + '" fill="' + c + '"/>');
  }
  function biome(x, y, w, h, fill, edge) {
    P('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="30" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>');
  }

  // ---------- the whole scene ----------
  var cache = null;
  function scene() {
    if (cache) return cache;
    o = [];
    // ground
    P('<rect width="1000" height="1990" fill="#d7ecc3"/>');
    [[60, 80], [150, 300], [90, 520], [880, 140], [940, 420], [830, 560], [60, 1010], [930, 1000], [120, 1240], [880, 1250], [80, 1650], [920, 1700], [160, 1900], [860, 1930]].forEach(function (p) { tuft(p[0], p[1]); tuft(p[0] + 14, p[1] + 6); });
    // forest edges beside Sprite Meadow
    [[70, 120, 1.1], [170, 200, .9], [100, 330, 1.2], [195, 430, .8], [80, 560, 1], [190, 590, .9],
      [840, 90, 1], [930, 210, 1.2], [820, 300, .9], [920, 470, 1.1], [835, 560, .85]].forEach(function (t, i) { tree(t[0], t[1], t[2], i % 2 ? '#3f9a4f' : '#4caf50', '#7bd17e'); });
    // fork 1 and 2 surroundings (outside the boxes) + caves and castle edges
    [[150, 1010, 1], [120, 1150, .9], [870, 1060, 1], [890, 1180, .85], [140, 1700, 1], [100, 1850, .9], [880, 1640, 1], [900, 1800, .9]].forEach(function (t) { tree(t[0], t[1], t[2], '#43a047', '#79c97c'); });

    // Sprite Meadow
    biome(250, 30, 500, 600, '#c4e6a5', '#9ccf80');
    P('<path d="M254,250 Q300,190 340,250 Q300,300 254,300 Z" fill="#b2dc8f"/><path d="M746,170 Q690,120 650,190 Q700,230 746,220 Z" fill="#b2dc8f"/>');
    P('<path d="M254,560 Q330,500 380,600 L380,626 L254,626 Z" fill="#b2dc8f"/>');
    P('<ellipse cx="705" cy="420" rx="38" ry="20" fill="#8fcbe8" stroke="#6fb3d6" stroke-width="3"/><path d="M688,416 q6,-4 12,0 M706,424 q6,-4 12,0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>');
    tree(295, 145, 1.05); tree(300, 455, .95); tree(705, 265, 1); tree(330, 575, .7); tree(700, 560, .9);
    flowers(290, 330); flowers(690, 140); flowers(640, 600); flowers(300, 70, ['#b39ddb', '#ffffff', '#ffd166']);
    tuft(330, 300); tuft(660, 470); tuft(320, 510);

    // Arcade Peaks (fork 1) and Arcade Peaks II (fork 2, snowy)
    biome(40, 640, 290, 300, '#f8dcbf', '#e9b98c');
    mountain(275, 712, .8, '#e39a6b', '#cf8456', '#fff3e6'); mountain(305, 735, .55, '#eaa77b', '#d48b5c');
    cube(60, 780, '#ff7a59', '#d4573a'); cube(78, 780, '#ffb347', '#d98a2b'); cube(69, 762, '#7c6cf0', '#5a4bc9');
    cube(282, 860, '#43c6ac', '#2c9b84'); cube(282, 878, '#ff7a59', '#d4573a');
    coin(75, 900); coin(290, 815); coin(98, 915);
    biome(40, 1275, 290, 300, '#e6eef8', '#bccde2');
    mountain(270, 1350, .85, '#9fb4cf', '#8299b8', '#ffffff'); mountain(305, 1368, .55, '#b1c3da', '#94a9c4', '#ffffff');
    cube(60, 1420, '#5aa9e6', '#3b84c0'); cube(78, 1420, '#7c6cf0', '#5a4bc9'); cube(69, 1402, '#43c6ac', '#2c9b84');
    coin(80, 1540); coin(290, 1460); pine(285, 1540, .75, '#4e8f7a', '#6aae97');

    // Story Woods (fork 1) and Story Woods II (fork 2, autumn)
    biome(355, 640, 290, 300, '#acd59c', '#84b872');
    pine(388, 705, 1); pine(615, 702, 1.1); pine(392, 905, .9); pine(618, 895, 1); pine(410, 790, .7);
    mushroom(395, 840); mushroom(605, 805, '#f07a3a'); book(600, 930, .7);
    biome(355, 1275, 290, 300, '#f4dcae', '#dcb675');
    tree(390, 1340, .95, '#e8833a', '#f2a65a'); tree(615, 1335, 1, '#d9534f', '#ee8a6a'); tree(388, 1535, .85, '#f0b23a', '#f6cf6a'); tree(617, 1530, .9, '#e8833a', '#f2a65a');
    mushroom(400, 1440, '#a0522d'); book(610, 1440, .65);

    // Gadget Bay (fork 1) and Gadget Bay II (fork 2, dusk)
    biome(670, 640, 290, 300, '#f6e8c6', '#e3cc94');
    P('<path d="M905,644 Q890,720 912,790 Q930,860 905,936 L930,936 Q956,936 956,906 L956,674 Q956,644 930,644 Z" fill="#9fd3ec"/>');
    wave(915, 760); wave(920, 850); wave(915, 905);
    lighthouse(932, 700); gear(705, 790, 11, '#9aa7b4'); gear(722, 806, 7, '#c0c9d2'); gear(706, 905, 9, '#9aa7b4');
    P('<path d="M880,870 h28 M880,880 h28" stroke="#a97a4a" stroke-width="4"/>');
    biome(670, 1275, 290, 300, '#e9ddf3', '#c8b5de');
    P('<path d="M905,1279 Q890,1355 912,1425 Q930,1495 905,1571 L930,1571 Q956,1571 956,1541 L956,1309 Q956,1279 930,1279 Z" fill="#8ab0e3"/>');
    wave(915, 1400); wave(918, 1500);
    lighthouse(932, 1335, true); gear(705, 1425, 11, '#8e88a8'); gear(706, 1535, 9, '#8e88a8');
    star(720, 1300, 4, '#fff6c2'); star(880, 1310, 3, '#fff6c2');

    // Debug Caves
    biome(250, 955, 500, 270, '#cfc8dc', '#a79ebd');
    P('<path d="M262,1215 L262,1120 Q262,1070 310,1070 Q358,1070 358,1120 L358,1215 Z" fill="#8e86a3"/><path d="M280,1215 L280,1128 Q280,1094 310,1094 Q340,1094 340,1128 L340,1215 Z" fill="#3f3852"/>');
    rock(712, 1000, 1, '#a39bb8'); rock(690, 1195, 1.2, '#958daa'); rock(300, 1000, .8, '#a39bb8');
    crystal(330, 1035, .9, '#8f7cf7', '#b8a9ff'); crystal(700, 1100, 1, '#4cc3e0', '#8adff2'); crystal(660, 1190, .7, '#e46fd3', '#f3a6e8'); crystal(380, 1185, .6, '#4cc3e0', '#8adff2');

    // Showcase Castle
    biome(250, 1590, 500, 370, '#f6dbe7', '#e3abc4');
    bunting(270, 730, 1612, ['#e5484d', '#f6c343', '#43a047', '#4aa3df', '#a464e0']);
    castle(650, 1820);
    star(300, 1700, 6, '#f6c343'); star(330, 1880, 5, '#f6c343'); star(720, 1690, 5, '#f6c343');
    flowers(300, 1930, ['#ff8fab', '#ffffff', '#b39ddb']); flowers(720, 1935);

    cache = o.join('');
    return cache;
  }

  // Wooden sign with the area name (drawn above the roads)
  function sign(x, y, label, icon, color) {
    var w = Math.round(label.length * 10.5 + 56);
    return '<g class="sign"><rect x="' + (x + 18) + '" y="' + (y + 28) + '" width="6" height="20" fill="#7a4f2a"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="6" fill="#a8743f" stroke="#6e4723" stroke-width="3"/>' +
      '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="4" rx="2" fill="#fff" opacity=".18"/>' +
      '<circle cx="' + (x + 20) + '" cy="' + (y + 17) + '" r="11" fill="' + color + '"/>' +
      '<use href="#i-' + icon + '" x="' + (x + 12) + '" y="' + (y + 9) + '" width="16" height="16" class="sign-ico"/>' +
      '<text x="' + (x + 38) + '" y="' + (y + 23) + '" class="sign-text">' + label + '</text></g>';
  }
  function banner(cx, y, text) {
    var w = Math.round(text.length * 9.6 + 60), x = cx - w / 2;
    return '<g class="banner-rib"><path d="M' + (x - 18) + ',' + (y + 4) + ' L' + x + ',' + (y + 4) + ' L' + x + ',' + (y + 32) + ' L' + (x - 18) + ',' + (y + 32) + ' L' + (x - 8) + ',' + (y + 18) + ' Z" fill="#d9a441"/>' +
      '<path d="M' + (x + w + 18) + ',' + (y + 4) + ' L' + (x + w) + ',' + (y + 4) + ' L' + (x + w) + ',' + (y + 32) + ' L' + (x + w + 18) + ',' + (y + 32) + ' L' + (x + w + 8) + ',' + (y + 18) + ' Z" fill="#d9a441"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="30" rx="4" fill="#fff4d6" stroke="#d9a441" stroke-width="3"/>' +
      '<text x="' + cx + '" y="' + (y + 20) + '" text-anchor="middle" class="banner-text">' + text + '</text></g>';
  }
  return { scene: scene, sign: sign, banner: banner };
})();
