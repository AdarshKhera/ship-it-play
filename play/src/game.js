import { SQUAD_SIZE, view } from './config.js';
import { HEROES, ROSTER } from './data.js';
import { createWorld } from './world.js';
import { buildFuelIcons } from './props.js';
import { createRun } from './state.js';
import { attachHooks, chooseCard, commandPower, commandSwap, commandSwapTo, commitSquad, updateGame } from './sim.js';
import { makeVignette, renderScene } from './render.js';
import { drawHud, PAUSE_BTN, POWER_BTN, SWAP_BTN, benchSlot } from './hud.js';
import { inCircle } from './draw.js';
import { createUi } from './ui.js';
import { createEditor } from './editor.js';
import { drawHome } from './home.js';
import { drawSquad } from './squad.js';
import { drawHowto, HOWTO_SLIDES } from './howto.js';
import { drawScores } from './scores.js';
import { drawLevelSelect } from './levelSelect.js';
import { levelById } from './levels.js';
import { canFullscreen, isFullscreen, isStandalone, enterFullscreen, toggleFullscreen } from './fullscreen.js';
import { drawSettings } from './settings.js';
import { drawResults } from './results.js';
import { drawCards, drawPause } from './overlays.js';
import { text, rrect } from './draw.js';
import {
  defaultProfile, heroLabel, levelUnlocked, loadProfile, markSeen, newlyUnlocked, nextLevelId, reachWave, recordRun, saveProfile, setHeroLabel, setPlayerName, shareText,
} from './profile.js';
import { isUnlocked } from './rules.js';

export function createApp({ canvas, ctx, sprites, audio, input }) {
  const worlds = {};
  const worldFor = theme => { if (!worlds[theme]) worlds[theme] = createWorld(ctx, theme); return worlds[theme]; };
  const A = { sprites, fuel: buildFuelIcons(), vignette: makeVignette() };
  const ui = createUi();
  const editor = createEditor();
  const app = {
    ui, A, t: 0, screen: 'home', G: null, profile: loadProfile(), howto: { i: 0, after: 'home' },
    squadUi: { picked: [], focus: 'dave', mode: 'home', wave: 0 }, resultInfo: null, lastRank: 0, confirmReset: false, toast: null,
  };
  let fade = null;
  let touchSeen = false;
  let betweenReady = false;
  let resultDone = false;

  audio.setMuted(!app.profile.settings.sound);

  let saveWarned = false;
  const setProfile = p => {
    app.profile = p;
    if (!saveProfile(p) && !saveWarned) { saveWarned = true; say('Progress could not be saved on this device'); }
    audio.setMuted(!p.settings.sound);
  };
  const labelFor = id => heroLabel(app.profile, HEROES[id]);
  const vibrate = pattern => { if (app.profile.settings.vibration && navigator.vibrate) { try { navigator.vibrate(pattern); } catch { /* unsupported */ } } };
  const say = msg => { app.toast = { msg, t: 0 }; };

  function navigate(screen) {
    if (fade) return;
    fade = { t: 0, screen, switched: false };
  }

  function startRun(squadIds, levelId = app.profile.level) {
    if (squadIds.length !== SQUAD_SIZE) return;
    const level = levelById(levelUnlocked(app.profile, levelId) ? levelId : 'office');
    setProfile({ ...app.profile, squad: squadIds.slice(), level: level.id });
    const G = createRun({ squadIds: squadIds.slice(), world: worldFor(level.theme), sfx: audio.sfx, sprites, labelFor, touch: touchSeen, levelId: level.id });
    attachHooks(G);
    G.hintsOn = !app.profile.hintsDone;
    G.haptic = vibrate;
    app.G = G;
    app.resultInfo = null;
    app.runUnlocked = [];
    betweenReady = false;
    resultDone = false;
    input.reset();
    if (touchSeen && canFullscreen() && !isFullscreen() && !isStandalone()) enterFullscreen();
    navigate('run');
  }

  function openSquad(returnTo = 'home') {
    app.squadUi = { picked: app.profile.squad.slice(), focus: app.profile.squad[0] || 'dave', mode: 'home', wave: 0, returnTo };
    navigate('squad');
  }

  function leaveSquad() {
    const { picked, returnTo } = app.squadUi;
    const unlockedIds = ROSTER.filter(id => isUnlocked(app.profile.bestWave, HEROES[id]));
    let p = markSeen(app.profile, unlockedIds);
    if (picked.length === SQUAD_SIZE) p = { ...p, squad: picked.slice() };
    setProfile(p);
    navigate(returnTo || 'home');
  }

  function togglePick(id) {
    const def = HEROES[id];
    app.squadUi.focus = id;
    if (!isUnlocked(app.profile.bestWave, def)) { audio.sfx.click(); return; }
    const list = app.squadUi.picked;
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else { list.push(id); if (list.length > SQUAD_SIZE) list.shift(); }
    audio.sfx.click();
  }

  function refreshRunLabels() {
    if (!app.G) return;
    app.G.squad.forEach(h => { const l = labelFor(h.id); h.name = l.name; h.title = l.title; });
  }

  function renameHero() {
    const id = app.squadUi.focus;
    const def = HEROES[id];
    const lab = heroLabel(app.profile, def);
    editor.open({
      heading: `Rename ${def.name}`,
      fields: [
        { id: 'name', label: 'Name', value: lab.name, max: 12, placeholder: def.name },
        { id: 'title', label: 'Job title', value: lab.title, max: 22, placeholder: def.title },
      ],
      onSave: v => { setProfile(setHeroLabel(app.profile, id, v)); refreshRunLabels(); },
      onReset: () => { setProfile(setHeroLabel(app.profile, id, { name: '', title: '' })); refreshRunLabels(); },
    });
  }

  function editPlayer() {
    editor.open({
      heading: 'Your name',
      fields: [{ id: 'player', label: 'Shown on the scoreboard', value: app.profile.player, max: 12, placeholder: 'Player' }],
      onSave: v => setProfile(setPlayerName(app.profile, v.player)),
    });
  }

  async function share(entry) {
    if (!entry) { say('Play a round first'); return; }
    const msg = shareText(entry, entry.squad.map(id => labelFor(id).name), location.href.split('?')[0]);
    try {
      if (window.ShipItNative && window.ShipItNative.share) { window.ShipItNative.share(msg); return; }
      if (navigator.share) { await navigator.share({ text: msg }); return; }
      await navigator.clipboard.writeText(msg);
      say('Score copied. Paste it anywhere!');
    } catch {
      say('Could not share. Long-press to copy instead');
    }
  }

  function currentEntry() {
    const r = app.G && app.G.result;
    if (!r) return null;
    return { score: r.score, stars: r.stars, won: r.won, wave: r.wave, squad: r.squad, level: r.level };
  }

  function fire(id) {
    audio.sfx.click();
    vibrate(8);
    if (id.startsWith('pick:')) { togglePick(id.slice(5)); return; }
    if (id.startsWith('slot:')) { app.squadUi.picked.splice(Number(id.slice(5)), 1); return; }
    if (id.startsWith('card:')) { chooseCard(app.G, Number(id.slice(5))); return; }
    if (id.startsWith('level:') && id !== 'level:locked') { startRun(app.profile.squad, id.slice(6)); return; }
    switch (id) {
      case 'play':
        if (!app.profile.seenHowTo) { app.howto = { i: 0, after: 'play' }; navigate('howto'); } else startRun(app.profile.squad);
        break;
      case 'go:howto': app.howto = { i: 0, after: 'home' }; navigate('howto'); break;
      case 'go:squad': openSquad(app.screen === 'levels' ? 'levels' : 'home'); break;
      case 'go:levels': navigate('levels'); break;
      case 'link:case': location.href = new URL('../', location.href).href; break;
      case 'levels:back': navigate('home'); break;
      case 'level:locked': say('Clear the previous level first'); break;
      case 'go:scores': navigate('scores'); break;
      case 'go:settings': app.confirmReset = false; navigate('settings'); break;
      case 'toggle:fullscreen':
        if (canFullscreen()) toggleFullscreen(); else say('Tap Share, then Add to Home Screen, for fullscreen');
        break;
      case 'toggle:sound': setProfile({ ...app.profile, settings: { ...app.profile.settings, sound: !app.profile.settings.sound } }); break;
      case 'toggle:vibration': setProfile({ ...app.profile, settings: { ...app.profile.settings, vibration: !app.profile.settings.vibration } }); vibrate(30); break;
      case 'edit:player': editPlayer(); break;
      case 'reset:progress':
        if (!app.confirmReset) { app.confirmReset = true; break; }
        app.confirmReset = false;
        setProfile(defaultProfile());
        say('Progress reset');
        break;
      case 'settings:back': case 'scores:back': navigate('home'); break;
      case 'scores:play': startRun(app.profile.squad); break;
      case 'scores:share': share(app.profile.scores[0] ? { ...app.profile.scores[0] } : null); break;
      case 'howto:prev': app.howto.i = Math.max(0, app.howto.i - 1); break;
      case 'howto:next': app.howto.i = Math.min(HOWTO_SLIDES - 1, app.howto.i + 1); break;
      case 'howto:back': navigate(app.howto.after === 'play' ? 'home' : 'home'); break;
      case 'howto:done':
        setProfile({ ...app.profile, seenHowTo: true });
        if (app.howto.after === 'play') startRun(app.profile.squad); else navigate('home');
        break;
      case 'squad:back': leaveSquad(); break;
      case 'rename:hero': renameHero(); break;
      case 'squad:go':
        if (app.squadUi.picked.length !== SQUAD_SIZE) break;
        if (app.squadUi.mode === 'between') {
          setProfile(markSeen(app.profile, ROSTER.filter(r => isUnlocked(app.profile.bestWave, HEROES[r]))));
          commitSquad(app.G, app.squadUi.picked.slice());
          betweenReady = false;
        } else {
          setProfile(markSeen({ ...app.profile, squad: app.squadUi.picked.slice() }, ROSTER.filter(r => isUnlocked(app.profile.bestWave, HEROES[r]))));
          startRun(app.squadUi.picked);
        }
        break;
      case 'pause:resume': app.G.paused = false; break;
      case 'pause:home': app.G = null; navigate('home'); break;
      case 'result:again': startRun(app.G.result.squad.length === 3 ? app.G.result.squad : app.profile.squad, app.G.level.id); break;
      case 'result:next': startRun(app.G.result.squad, nextLevelId(app.G.level.id) || app.G.level.id); break;
      case 'result:home': app.G = null; navigate('home'); break;
      case 'result:share': share(currentEntry()); break;
      default: break;
    }
  }

  function togglePause() {
    const G = app.G;
    if (!G || !['play', 'clear'].includes(G.mode)) return;
    G.paused = !G.paused;
  }

  function nav(dir) {
    const cur = ROSTER.indexOf(app.squadUi.focus);
    const next = Math.max(0, Math.min(ROSTER.length - 1, cur + ({ left: -1, right: 1, up: -6, down: 6 })[dir]));
    app.squadUi.focus = ROSTER[next];
  }

  function onAction(a) {
    if (editor.isOpen()) return;
    if (a === 'mute') { fire('toggle:sound'); return; }
    const G = app.G;
    switch (app.screen) {
      case 'home': if (a === 'confirm') fire('play'); break;
      case 'howto':
        if (a === 'right' || a === 'confirm') fire(app.howto.i === HOWTO_SLIDES - 1 ? 'howto:done' : 'howto:next');
        else if (a === 'left') fire('howto:prev');
        else if (a === 'pause') fire('howto:back');
        break;
      case 'scores': case 'settings': case 'levels': if (a === 'pause') navigate('home'); break;
      case 'squad':
        if (['left', 'right', 'up', 'down'].includes(a)) nav(a);
        else if (a === 'confirm') togglePick(app.squadUi.focus);
        else if (a === 'pause') leaveSquad();
        else if (a === 'power' && app.squadUi.picked.length === SQUAD_SIZE) fire('squad:go');
        break;
      case 'run':
        if (!G) break;
        if (G.paused) { if (a === 'pause' || a === 'confirm') G.paused = false; else if (a === 'restart') fire('pause:home'); return; }
        if (G.mode === 'cards') { const idx = { n1: 0, n2: 1, n3: 2 }[a]; if (idx !== undefined) chooseCard(G, idx); return; }
        if (G.mode === 'squad') {
          if (['left', 'right', 'up', 'down'].includes(a)) nav(a);
          else if (a === 'confirm') togglePick(app.squadUi.focus);
          else if (a === 'power') fire('squad:go');
          return;
        }
        if (G.mode === 'win' || G.mode === 'lost') {
          if (G.endT < 0.9) return;
          if (a === 'confirm') fire('result:again'); else if (a === 'pause' || a === 'restart') fire('result:home');
          return;
        }
        if (a === 'pause') togglePause();
        else if (a === 'power') commandPower(G);
        else if (a === 'swap') commandSwap(G, 1);
        else if (a === 'swapPrev') commandSwap(G, -1);
        else if (a === 'n1') commandSwapTo(G, 0);
        else if (a === 'n2') commandSwapTo(G, 1);
        else if (a === 'n3') commandSwapTo(G, 2);
        break;
      default: break;
    }
  }

  function runPlaying() {
    const G = app.G;
    return app.screen === 'run' && G && !G.paused && (G.mode === 'play' || G.mode === 'clear' || G.mode === 'lose');
  }

  function onDown(p) {
    if (p.touch) touchSeen = true;
    audio.unlock();
    if (editor.isOpen() || fade) return;
    if (runPlaying()) {
      const G = app.G;
      if (inCircle(p, PAUSE_BTN)) { togglePause(); return; }
      if (G.mode === 'lose') return;
      if (inCircle(p, POWER_BTN)) { commandPower(G); vibrate(25); return; }
      if (inCircle(p, SWAP_BTN)) { commandSwap(G, 1); return; }
      for (let i = 0; i < G.squad.length; i++) { if (inCircle(p, benchSlot(i))) { commandSwapTo(G, i); return; } }
      if (!input.stickActive() && p.x < view.w * 0.62 && p.y > 140) input.beginStick(p.id, p.x, p.y);
      return;
    }
    ui.pressed = ui.at(p);
  }

  function onUp(p) {
    if (p.x === undefined) return;
    const id = ui.at(p);
    const pressed = ui.pressed;
    ui.pressed = null;
    if (editor.isOpen() || fade) return;
    if (id && id === pressed) fire(id);
  }

  function afterRun(G) {
    if ((G.mode === 'win' || G.mode === 'lost') && !resultDone) {
      resultDone = true;
      const r = G.result;
      const prev = app.profile.bestWave;
      const hadScores = app.profile.scores.length > 0;
      const out = recordRun(app.profile, { score: r.score, wave: r.wave, stars: r.stars, squad: r.squad, won: r.won, level: r.level, date: Date.now() });
      setProfile(out.profile);
      app.lastRank = out.rank;
      app.resultInfo = { rank: out.rank, opened: out.opened, best: out.best && hadScores, unlocked: [...new Set([...(app.runUnlocked || []), ...newlyUnlocked(prev, out.profile.bestWave)])] };
    }
    if (G.mode === 'squad' && !betweenReady) {
      betweenReady = true;
      const next = G.wave + 1;
      const prev = app.profile.bestWave;
      setProfile(reachWave(app.profile, next + 1));
      const fresh = newlyUnlocked(prev, app.profile.bestWave);
      app.squadUi = { picked: G.squadPick.slice(), focus: fresh[0] || G.squadPick[0], mode: 'between', wave: next, returnTo: 'home' };
      if (fresh.length) { app.runUnlocked = [...(app.runUnlocked || []), ...fresh]; say(`Unlocked: ${fresh.map(id => HEROES[id].name).join(' and ')}!`); }
    }
  }

  function drawRun(dt) {
    const G = app.G;
    if (!G) return;
    renderScene(ctx, G, A);
    if (G.mode === 'cards') drawCards(ctx, app);
    else if (G.mode === 'squad') drawSquad(ctx, app);
    else if (G.mode === 'win' || G.mode === 'lost') drawResults(ctx, app);
    else drawHud(ctx, G, A, input);
    if (G.paused) drawPause(ctx, app);
    void dt;
  }

  function drawToast() {
    const t = app.toast;
    if (!t) return;
    const a = Math.min(1, t.t * 6, (2.6 - t.t) * 4);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.font = '700 24px "Fredoka", system-ui, sans-serif';
    const w = ctx.measureText(t.msg).width + 56;
    rrect(ctx, view.w / 2 - w / 2, 640 - t.t * 6, w, 52, 26); ctx.fillStyle = 'rgba(16,19,48,0.96)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#15171f'; ctx.stroke();
    text(ctx, t.msg, view.w / 2, 667 - t.t * 6, { size: 24, align: 'center', base: 'middle' });
    ctx.restore();
  }

  function frame(dt) {
    app.t += dt;
    if (app.toast) { app.toast.t += dt; if (app.toast.t > 2.6) app.toast = null; }
    const ev = input.drain();
    ev.actions.forEach(onAction);
    ev.pointers.forEach(p => { if (p.kind === 'down') onDown(p); else { input.endStick(p.id); onUp(p); } });

    const G = app.G;
    if (app.screen === 'run' && G && !editor.isOpen()) {
      updateGame(G, dt, G.mode === 'play' ? input.move() : { x: 0, y: 0 });
      afterRun(G);
    }

    if (fade) {
      fade.t += dt;
      if (!fade.switched && fade.t >= 0.14) { fade.switched = true; app.screen = fade.screen; ui.pressed = null; }
      if (fade.t >= 0.32) fade = null;
    }

    ctx.setTransform(canvas.width / view.w, 0, 0, canvas.height / view.h, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ui.begin(dt);
    switch (app.screen) {
      case 'home': drawHome(ctx, app); break;
      case 'howto': drawHowto(ctx, app); break;
      case 'scores': drawScores(ctx, app); break;
      case 'levels': drawLevelSelect(ctx, app); break;
      case 'settings': drawSettings(ctx, app); break;
      case 'squad': drawSquad(ctx, app); break;
      case 'run': drawRun(dt); break;
      default: break;
    }
    drawToast();
    if (fade) {
      const a = fade.t < 0.14 ? fade.t / 0.14 : Math.max(0, 1 - (fade.t - 0.14) / 0.18);
      ctx.fillStyle = `rgba(10,12,36,${a})`;
      ctx.fillRect(0, 0, view.w, view.h);
    }
  }

  document.addEventListener('visibilitychange', () => {
    const G = app.G;
    if (document.hidden && G && G.mode === 'play' && !G.paused && app.screen === 'run') G.paused = true;
  });

  function pause() { const G = app.G; if (G && G.mode === 'play' && !G.paused) { G.paused = true; input.reset(); } }
  return { frame, state: () => app.G, app, startRun, pause, navigate };
}
