/* Scratch Quest — page translation for students (Brazilian Portuguese).
 * How it works: after the page draws, this finds the visible text, looks each piece up in a
 * saved dictionary, and asks the server to translate anything new (Google Translate, built
 * into Apps Script). Translations are remembered on the device and in the teacher's Sheet
 * ("Translations" tab), where the teacher can correct them.
 * Never translated: names and anything inside an element marked class="notr", code blocks,
 * pictures, and what people type into boxes.
 */
var SQ_I18N = (function () {
  var lang = 'en', dict = {}, done = {}, miss = {}, queue = {}, timer = null, obs = null, sender = null, busy = false, dirty = false;
  // Hand-written translations for the words students see most (these win over machine translation).
  var BUILTIN = { pt: {
    'Quest Map': 'Mapa de Missões', 'My Avatar': 'Meu Avatar', 'Badges': 'Medalhas', 'Arcade': 'Fliperama', 'My Class': 'Minha Turma',
    'Map': 'Mapa', 'Words': 'Palavras', 'Back': 'Voltar', 'Next': 'Próximo', 'Skip': 'Pular', 'Read to me': 'Ler para mim', 'Stop': 'Parar',
    'Tell me more': 'Conte-me mais', 'Need a hint?': 'Precisa de uma dica?', 'I did it!': 'Consegui!', 'Got it': 'Entendi',
    'Your mission': 'Sua missão', 'Big question': 'Grande pergunta', 'Start quest': 'Começar missão', 'Continue quest': 'Continuar missão',
    'Keep going': 'Continuar', 'Let\'s go!': 'Vamos lá!', 'Turn it in!': 'Entregar!', 'Turn in your quest': 'Entregue sua missão',
    'Quest complete!': 'Missão concluída!', 'Complete': 'Concluída', 'Keep questing!': 'Continue a aventura!', 'Awesome!': 'Incrível!',
    'Level up!': 'Subiu de nível!', 'Badge unlocked!': 'Medalha desbloqueada!', 'Save my look': 'Salvar meu visual', 'Surprise me': 'Me surpreenda',
    'I’m stuck': 'Preciso de ajuda', 'Ask for help': 'Pedir ajuda', 'Confusing?': 'Confuso?', '🤔 Confusing?': '🤔 Confuso?', '✋ I’m stuck': '✋ Preciso de ajuda', 'Rate this quest': 'Avalie esta missão',
    'Finished': 'Concluída', 'Ready to start': 'Pronta para começar', 'Locked': 'Bloqueada', 'Display': 'Aparência', 'Report a bug': 'Avisar de um erro',
    'coins': 'moedas', 'Done': 'Pronto', 'Save': 'Salvar', 'Cancel': 'Cancelar', 'Send': 'Enviar', 'Top scores': 'Melhores pontuações'
  } };
  var SAFE = { B: 1, I: 1, EM: 1, STRONG: 1, U: 1, BR: 1, KBD: 1, MARK: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, CANVAS: 1, IMG: 1, IFRAME: 1, svg: 1, SVG: 1 };
  function norm(t) { return String(t).replace(/\s+/g, ' ').trim(); }
  function wordy(t) { return /[A-Za-z]{2}/.test(t); }
  function load() {
    dict = {}; done = {}; miss = {};
    try { dict = JSON.parse(localStorage.getItem('sq-tr-' + lang) || '{}') || {}; } catch (e) { dict = {}; }
    var b = BUILTIN[lang] || {};
    Object.keys(b).forEach(function (k) { dict['t|' + k] = b[k]; });
    Object.keys(dict).forEach(function (k) { done[norm(dict[k])] = 1; });
  }
  function save() { try { localStorage.setItem('sq-tr-' + lang, JSON.stringify(dict)); } catch (e) { /* storage full or blocked: keep in memory */ } }
  function put(target, html, tr) {
    if (html) { target.innerHTML = tr; done[norm(target.innerHTML)] = 1; }
    else { var m = /^(\s*)[\s\S]*?(\s*)$/.exec(target.nodeValue); target.nodeValue = m[1] + tr + m[2]; done[norm(tr)] = 1; }
  }
  function unit(target, html) {
    var src = norm(html ? target.innerHTML : target.nodeValue);
    if (!src || !wordy(src) || done[src] || src.length > 2500) return;
    var k = (html ? 'h|' : 't|') + src, hit = dict[k];
    if (hit !== undefined) { if (hit !== src) put(target, html, hit); return; }
    if (miss[k]) return;
    (queue[k] = queue[k] || []).push(target);
    if (!timer) timer = setTimeout(flush, 60);
  }
  function simple(el) {
    var all = el.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) if (!SAFE[all[i].tagName]) return false;
    return all.length > 0;
  }
  function walk(el) {
    if (!el || el.nodeType !== 1 || SKIP[el.tagName] || (el.classList && (el.classList.contains('notr') || el.classList.contains('scratchblocks')))) return;
    if (simple(el) && wordy(el.textContent)) { unit(el, true); return; }
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) unit(n, false); else if (n.nodeType === 1) walk(n);
    }
  }
  function flush() {
    timer = null;
    if (busy || lang === 'en' || !sender) return;
    var keys = Object.keys(queue).slice(0, 40);
    if (!keys.length) return;
    busy = true;
    var items = keys.map(function (k) { return { t: k.slice(2), html: k.charAt(0) === 'h' }; });
    var forLang = lang;
    sender(lang, items).then(function (out) {
      busy = false;
      if (forLang !== lang) return;
      keys.forEach(function (k, i) {
        var targets = queue[k] || []; delete queue[k];
        if (!out || out[i] == null) { miss[k] = 1; return; }
        dict[k] = out[i];
        targets.forEach(function (t) {
          if (!t.isConnected) return;
          var html = k.charAt(0) === 'h';
          if (norm(html ? t.innerHTML : t.nodeValue) === k.slice(2)) put(t, html, out[i]);
        });
      });
      if (out) save();
      if (Object.keys(queue).length) timer = setTimeout(flush, 30);
    }).catch(function () { busy = false; keys.forEach(function (k) { miss[k] = 1; delete queue[k]; }); });
  }
  function scan() { dirty = false; if (lang !== 'en') walk(document.body); }
  return {
    lang: function () { return lang; },
    // l: 'en' or 'pt'. send(lang, items) -> Promise of an array of translations (or null when unavailable)
    set: function (l, send) {
      sender = send || sender;
      if (l === lang) { if (l !== 'en') scan(); return; }
      lang = l; queue = {};
      document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
      if (obs) { obs.disconnect(); obs = null; }
      if (l === 'en') return;
      load();
      obs = new MutationObserver(function () { if (!dirty) { dirty = true; Promise.resolve().then(scan); } });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      scan();
    }
  };
})();
