import { ACHIEVEMENTS } from '../content/achievements';
import { QUESTS, routeTaken, type QuestDef } from '../content/quests';
import { applySettings, setSetting, settings, skipDiceAnimation, type Settings } from './settings';
import { applyVolumes, playSfx } from '../audio/audio';
import { AREAS, CHECKS, ENDINGS, INVENTORY, OBJECTS, PAGES } from '../content/campaign';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  FRIENDS,
  FRIEND_ORDER,
  ITEMS,
  ITEM_SLOTS,
  restlessDrain,
  STYLES,
  STYLE_LABELS,
  MAX_HEARTS,
  POINTS_PER_HEART,
  RALLY_HEARTS,
  REVEAL_AT_HEARTS,
  STAMINA_PER_HEART,
  type ItemDef,
  type Taste,
} from '../content/cast';
import type { Controller, LogLine } from '../game/controller';
import { bandFor, rollD20, type Segment } from '../game/rolls';
import type { AreaId, FriendId, ItemId, Speaker } from '../game/types';

const $ = (id: string) => document.getElementById(id)!;

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function fmtClock(minutes: number): string {
  const total = 19 * 60 + Math.floor(minutes);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Band colors: stable per position in the table so results are easy to tell apart. */
const BAND_COLORS = ['band-a', 'band-b', 'band-c', 'band-d'];

/** Objects in the lower part of the map get their dialog at the top instead. */
const DIALOG_FLIP_ROW = 6;

type Modal = null | 'binder' | 'settings' | 'quit' | 'reset' | 'table';
type BinderTab = 'pages' | 'friends' | 'tables' | 'paths' | 'notes' | 'achievements';

const BINDER_TABS: { id: BinderTab; icon: string; label: string }[] = [
  { id: 'pages', icon: 'description', label: 'Pages' },
  { id: 'friends', icon: 'group', label: 'Friends' },
  { id: 'tables', icon: 'casino', label: 'Roll tables' },
  { id: 'paths', icon: 'route', label: 'Adventure paths' },
  { id: 'notes', icon: 'edit_note', label: 'Session notes' },
  { id: 'achievements', icon: 'emoji_events', label: 'Achievements' },
];

/** Which location each roll happens in, from where its action lives. */
const CHECK_AREA: Record<string, AreaId> = {};
for (const o of OBJECTS) {
  for (const a of o.actions) if (a.check && !CHECK_AREA[a.check]) CHECK_AREA[a.check] = o.area;
}
const AREA_ORDER = Object.keys(AREAS) as AreaId[];

const TASTE_ICON: Record<Taste, string> = { like: '♥', neutral: '–', dislike: '✗', refuses: '⊘' };
const TASTE_WORD: Record<Taste, string> = { like: 'loves', neutral: "doesn't mind", dislike: "doesn't like", refuses: "won't have" };

/** How a friend lets a taste slip between sessions. */
const REVEAL_PHRASE: Record<Taste, string> = {
  like: "wouldn't stop talking about",
  neutral: "said they're fine with",
  dislike: 'texted the group that they can\'t stand',
  refuses: "mentioned they don't have",
};

/** A Material Symbols icon. */
const mi = (name: string, cls = ''): string => `<span class="mi ${cls}" aria-hidden="true">${name}</span>`;

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

/** Short notes on what an item does, shown on its card. */
function itemHints(d: ItemDef): string[] {
  const hints = [CATEGORY_LABELS[d.category]];
  if (d.crash) hints.push(`${mi('bolt')} crash later`);
  if (d.coma) hints.push(`${mi('bedtime')} food coma later`);
  if (d.calm) hints.push(`${mi('wine_bar')} restores patience, sleepier later`);
  if (d.chatty) hints.push(`${mi('chat')} makes people chatty`);
  if (d.homemade) hints.push(`${mi('home')} homemade`);
  return hints;
}

export function mountUI(ctl: Controller, spriteUrl: (key: string) => string): void {
  let picks: ItemId[] = [];
  let modal: Modal = null;
  let binderTab: BinderTab = 'pages';
  let friendTab: FriendId = 'marcus';
  /** Pages currently showing their back in the binder. */
  const faceDown = new Set<string>();
  let areaTab: AreaId = 'inn';
  let pathTab = QUESTS[0].id;
  /** The roll screen: idle (waiting) → rolling (thrown) → landed (result). */
  /**
   * value: the die's number for a real roll. bandId: the outcome picked with
   * the amulet (no die number).
   */
  let roll: { phase: 'rolling' | 'landed'; value: number; bandId: string | null; chosen?: boolean } | null = null;
  let rollTimers: number[] = [];

  // Dialog bookkeeping: which lines were already on screen (so only new ones animate).
  let dialogKey = '';
  let dialogShown = 0;

  // Toast bookkeeping: lines that happen while no dialog is open.
  let toastSession = -1;
  let toastSeen = 0;

  // ── Rendering ──────────────────────────────────────────────

  function render(): void {
    renderHeader();
    renderTable();
    renderDialog();
    renderToasts();
    renderOverlay();
    checkNotices();
  }

  // ── Corner pop-ups ─────────────────────────────────────────
  // New hearts, tastes a friend let slip, and achievements earned when the
  // night is over. They sit above every screen, end screens included.
  let noticeAt = 0;
  function notify(icon: string, title: string, text: string, color = 'var(--accent)', delay = 0): void {
    // Stagger pop-ups that arrive together.
    const now = performance.now();
    noticeAt = Math.max(noticeAt, now + delay);
    const wait = noticeAt - now;
    noticeAt += 700;
    window.setTimeout(() => {
      const n = document.createElement('div');
      n.className = 'notice';
      n.style.setProperty('--n', color);
      n.innerHTML = `<span class="notice-icon">${mi(icon)}</span><div><b>${title}</b><p>${text}</p></div>`;
      $('notices').appendChild(n);
      window.setTimeout(() => n.classList.add('out'), 5500);
      window.setTimeout(() => n.remove(), 6200);
    }, wait);
  }

  /** What a friend's newest heart does for you. */
  function heartPerk(h: number): string {
    if (h >= MAX_HEARTS) return "Best friends. They'll bring a snack to game night.";
    if (h === RALLY_HEARTS) return "They'll rally once a night instead of falling asleep.";
    if (REVEAL_AT_HEARTS.includes(h)) return 'They let a taste slip during the week.';
    return `They'll tire ${Math.round(STAMINA_PER_HEART * 100)}% slower for each heart.`;
  }

  let seenFriendship = ctl.lastFriendship;
  let seenAchievements = new Set(ctl.knowledge.achievements);
  function checkNotices(): void {
    if (ctl.lastFriendship !== seenFriendship) {
      seenFriendship = ctl.lastFriendship;
      for (const c of seenFriendship) {
        const f = FRIENDS[c.friend];
        if (c.heartsAfter > c.heartsBefore) {
          const hearts = `<span class="notice-hearts">${'♥'.repeat(c.heartsAfter)}<span class="empty">${'♥'.repeat(MAX_HEARTS - c.heartsAfter)}</span></span>`;
          notify('favorite', `${f.name}: new heart!`, `${hearts} ${heartPerk(c.heartsAfter)}`, f.color, 1400);
        }
        if (c.revealed) {
          notify('menu_book', `${f.name} let something slip`,
            `During the week, ${f.name} ${REVEAL_PHRASE[c.revealed.taste]} ${CATEGORY_SHORT[c.revealed.category]}. It's in your binder.`, f.color, 1400);
        }
      }
    }
    const got = ctl.knowledge.achievements;
    if (got.length < seenAchievements.size) seenAchievements = new Set(got); // the save was wiped
    for (const id of got) {
      if (seenAchievements.has(id)) continue;
      seenAchievements.add(id);
      // During play these already show in the corner via the session log.
      const inPlay = ctl.phase === 'playing' && ctl.session && !ctl.session.ended;
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (!inPlay && a) notify(a.icon, 'Achievement unlocked', esc(a.name), 'var(--accent)', 1400);
    }
  }

  function renderHeader(): void {
    const s = ctl.session;
    const k = ctl.knowledge;
    $('session-label').textContent = `Session ${s?.number ?? ctl.sessionNumber}`;
    $('clock').textContent = s ? fmtClock(s.minutes) : '7:00 PM';
    $('area-label').textContent = s ? AREAS[s.area].name : '';
    $('binder-count').textContent = `${k.pages.length}/${PAGES.length}`;
    $('quit-btn').hidden = ctl.phase !== 'playing' || !s || s.ended;
  }

  /** A small "are you sure?" card. */
  function confirmHtml(icon: string, title: string, body: string, yes: string, act: string, no = 'Never mind'): string {
    return `
      <div class="card confirm">
        <div class="binder-head">
          <h2>${mi(icon)} ${title}</h2>
          <button class="icon-close" data-act="close" title="Close (Esc)" aria-label="Close">${mi('close')}</button>
        </div>
        ${body}
        <div class="confirm-actions card-action">
          <button class="secondary-btn" data-act="close">${no}</button>
          <button class="danger-btn" data-act="${act}">${yes}</button>
        </div>
      </div>`;
  }

  /** Each friend's expected reaction to an item, as far as you know. */
  /**
   * How the table will take an item: each friend's face, with + (loves it),
   * − (doesn't like it), −− (won't touch it) or ? (you don't know yet).
   * The details are on hover.
   */
  function previewHtml(id: ItemId): string {
    const mark: Record<Taste, string> = { like: '+', neutral: '', dislike: '−', refuses: '−−' };
    return `<div class="faces">${ctl.preview(id).map((p) => {
      const f = FRIENDS[p.friend];
      const title = p.taste
        ? `${f.name} ${TASTE_WORD[p.taste]} ${CATEGORY_SHORT[ITEMS[id].category]} (${signed(p.energy!)} energy)`
        : `You don't know how ${f.name} feels about ${CATEGORY_SHORT[ITEMS[id].category]} yet`;
      const badge = p.taste ? mark[p.taste] : '?';
      const face = spriteUrl(`face-${p.friend}`);
      return `<span class="face ${p.taste ? `t-${p.taste}` : 't-unknown'}" title="${esc(title)}" aria-label="${esc(title)}" style="--c:${f.color}">
        ${face ? `<img src="${face}" alt="" />` : `<b>${f.name[0]}</b>`}
        ${badge ? `<span class="face-mark">${badge}</span>` : ''}
      </span>`;
    }).join('')}</div>`;
  }

  /** ♥♥♥♡♡ for a friend's hearts, plus tonight's pending change. */
  function heartsHtml(id: FriendId, withGain = true): string {
    const h = ctl.hearts(id);
    const gain = withGain ? ctl.session?.friendGain[id] ?? 0 : 0;
    const pending = gain ? `<span class="gain ${gain > 0 ? 'up' : 'down'}">${signed(gain)}</span>` : '';
    return `<span class="hearts" title="Friendship: ${h} of ${MAX_HEARTS} hearts">${'♥'.repeat(h)}<span class="empty">${'♥'.repeat(MAX_HEARTS - h)}</span></span>${pending}`;
  }

  /** A friend's real face, with their character as a little badge. */
  function avatarHtml(id: FriendId, big = false): string {
    const f = FRIENDS[id];
    const face = spriteUrl(`face-${id}`);
    const char = spriteUrl(`char-${id}`);
    const badgeTitle = f.character ? `Plays ${f.character.name}` : 'Runs the game';
    return `<div class="avatar ${big ? 'big' : ''}" style="--c:${f.color}">
      ${face ? `<img class="face" src="${face}" alt="${f.name}" />` : f.name[0]}
      ${char ? `<img class="char-badge" src="${char}" alt="" title="${badgeTitle}" />` : ''}
    </div>`;
  }

  function renderTable(): void {
    $('table').innerHTML = `${tableStripHtml()}<div class="table-full">${tableHtml()}</div>`;
  }

  /**
   * Phones: a slim strip beside the map with each friend's face and energy,
   * and the table's patience. Tap it for the full table.
   */
  function tableStripHtml(): string {
    const s = ctl.session;
    const level = (e: number) => (e > 60 ? 'ok' : e > 30 ? 'low' : 'crit');
    const faces = FRIEND_ORDER.map((id) => {
      const e = s ? s.energy[id] : 100;
      const face = spriteUrl(`face-${id}`);
      return `<span class="strip-friend" title="${FRIENDS[id].name}: ${Math.round(e)}% awake">
        <span class="strip-face" style="--c:${FRIENDS[id].color}">${face ? `<img src="${face}" alt="" />` : FRIENDS[id].name[0]}</span>
        <span class="bar"><span class="fill ${level(e)}" style="width:${e}%"></span></span>
      </span>`;
    }).join('');
    const p = ctl.patience;
    const restless = s ? restlessDrain(s.looks) > 0 : false;
    const snacks = s?.items.length ?? 0;
    return `<button class="table-strip" data-act="table" aria-label="At the Table: tap for details">
      ${faces}
      <span class="strip-friend" title="Table Patience">
        <span class="strip-icon">${mi('sentiment_satisfied')}</span>
        <span class="bar"><span class="fill ${!restless ? 'ok' : p > 45 ? 'low' : 'crit'}" style="width:${p}%"></span></span>
      </span>
      ${snacks ? `<span class="strip-snacks">${mi('cookie')} ${snacks}</span>` : ''}
      <span class="strip-more">${mi('open_in_full')}</span>
    </button>`;
  }

  /** Everything at the table: friends, patience, snacks, your pack, the amulet. */
  function tableHtml(): string {
    const s = ctl.session;
    const friends = FRIEND_ORDER.map((id) => {
      const f = FRIENDS[id];
      const e = s ? s.energy[id] : 100;
      const level = e > 60 ? 'ok' : e > 30 ? 'low' : 'crit';
      return `
        <div class="friend">
          ${avatarHtml(id)}
          <div class="friend-body">
            <div class="friend-name">${f.name} <span class="role">${f.character ? `${f.character.name} the ${f.role}` : f.role}</span>
              <button class="info" data-act="profile" data-friend="${id}" title="About ${f.name}">ⓘ</button>
              ${heartsHtml(id)}</div>
            <div class="bar"><div class="fill ${level}" style="width:${e}%"></div></div>
          </div>
        </div>`;
    }).join('');

    const items = s && s.items.length
      ? s.items.map((id, i) => {
          const d = ITEMS[id];
          const hints = itemHints(d).slice(1);
          const by = s.broughtBy[id];
          return `
            <div class="item">
              <div class="item-name">${mi(d.icon)} ${d.name}${by ? ` <span class="muted small">from ${FRIENDS[by].name}</span>` : ''}</div>
              ${hints.length ? `<div class="hints">${hints.join(' · ')}</div>` : ''}
              ${previewHtml(id)}
              <div class="muted small waiting">${i === 0 ? 'Comes out when someone starts to flag.' : 'Saved for a later snack break.'}</div>
            </div>`;
        }).join('')
      : `<p class="muted">${s ? 'All eaten.' : ''}</p>`;

    const amulet = s?.amulet.held
      ? `<div class="amulet">${mi('pets')} <b>Amulet of the Groundhog</b><br/><span class="muted">Any time: take a path you've seen.<br/>${s.amulet.charges > 0 ? 'Tonight: choose one roll.' : 'Chosen roll used for tonight.'}</span></div>`
      : '';

    const p = ctl.patience;
    const restless = ctl.session ? restlessDrain(ctl.session.looks) > 0 : false;
    const mood = !restless ? 'Patient' : p > 45 ? 'Restless' : p > 0 ? 'Annoyed' : 'Done with you';
    const patience = `
      <div class="patience" title="Every look uses some up. Once the table is restless, looks drain everyone's energy.">
        <div class="patience-label"><span>Table Patience</span><span class="muted">${mood}</span></div>
        <div class="bar"><div class="fill ${!restless ? 'ok' : p > 45 ? 'low' : 'crit'}" style="width:${p}%"></div></div>
      </div>`;

    const pack = packHtml();
    return `
      <h3>At the Table</h3>
      <div class="friends-list">${friends}</div>
      ${patience}
      <div class="table-lower">
        <section><h3>Snacks &amp; Drinks</h3><div class="items-list">${items}</div></section>
        <section>${pack}${amulet}</section>
      </div>`;
  }

  /** What your character is carrying in the story. */
  function packHtml(): string {
    const s = ctl.session;
    if (!s) return '';
    const held = INVENTORY.filter((i) => s.flags.has(i.flag) && !(i.hideIf && s.flags.has(i.hideIf)));
    if (!held.length) return `<h3>Your Pack</h3><p class="muted pack-empty">Nothing yet. Just a lute, some lint, and a strong sense of purpose.</p>`;
    return `<h3>Your Pack</h3><ul class="pack">${held.map((i) => `<li>
      <span class="pack-name">${mi(i.icon)} ${esc(i.name)}</span>
      <span class="pack-hint">${esc(i.hint)}</span>
    </li>`).join('')}</ul>`;
  }

  function speakerName(who: Speaker): string {
    if (who === 'dm') return 'Marcus';
    if (who === 'you') return 'You';
    if (who === 'system') return '';
    return FRIENDS[who].name;
  }

  function speakerColor(who: Speaker): string {
    if (who === 'dm' || who === 'system') return 'var(--accent)';
    if (who === 'you') return '#7fb4e8';
    return FRIENDS[who].color;
  }

  /** DM lines read as narration; friends and rolls get a name tag. */
  function lineHtml(l: LogLine, fresh: boolean): string {
    const cls = `dline ${l.who === 'system' ? 'system' : l.who === 'dm' ? 'narration' : 'speech'}${fresh ? ' fresh' : ''}`;
    const tag = l.who === 'dm' || l.who === 'system'
      ? ''
      : `<span class="tag" style="color:${speakerColor(l.who)}">${speakerName(l.who)}</span>`;
    return `<p class="${cls}">${tag}${l.icon ? mi(l.icon, 'line-icon') : ''}${esc(l.text)}</p>`;
  }

  function renderDialog(): void {
    const el = $('dialog');
    const s = ctl.session;
    const d = s?.dialog;
    if (!s || !d || ctl.phase !== 'playing') {
      el.className = '';
      el.innerHTML = '';
      dialogKey = '';
      return;
    }

    const obj = d.objectId ? OBJECTS.find((o) => o.id === d.objectId) : undefined;
    const here = !!obj && ctl.isHere(obj);
    const lines = s.log.slice(d.from);

    const key = `${s.number}:${d.from}:${d.objectId}`;
    const opened = key !== dialogKey;
    if (opened) {
      dialogKey = key;
      dialogShown = 0;
    }
    const before = dialogShown;
    const keptScroll = el.querySelector('.dialog-lines')?.scrollTop ?? 0;

    const actions = here ? ctl.availableActions(obj!) : [];
    const buttons = actions.length
      ? actions.map((a, i) => `
          <button class="action" data-act="action" data-obj="${obj!.id}" data-action="${a.id}">
            <span class="key">${i + 1}</span>${a.check ? mi('casino') : a.look ? mi('visibility') : ''}${esc(a.label)}
            ${a.minutes ? `<span class="cost">${a.minutes} min</span>` : ''}
          </button>`).join('')
      : '<button class="action" data-act="close-dialog"><span class="key">⏎</span>Continue</button>';

    const icon = obj ? spriteUrl(obj.sprite) : '';
    const plate = obj
      ? `${icon ? `<img class="plate-icon" src="${icon}" alt="" />` : ''}${esc(obj.name)}`
      : `${mi('casino')} Marcus (DM)`;
    const desc = here ? ctl.describe(obj!) : undefined;
    const blurb = desc ? `<p class="dline blurb">${esc(desc)}</p>` : '';

    el.className = `open ${obj && obj.y >= DIALOG_FLIP_ROW ? 'top' : 'bottom'}`;
    el.innerHTML = `
      <div class="plate">${plate}</div>
      <button class="dialog-close" data-act="close-dialog" title="Close (Esc)" aria-label="Close">${mi('close')}</button>
      <div class="dialog-lines">${blurb}${lines.map((l, i) => lineHtml(l, i >= dialogShown)).join('')}</div>
      <div class="dialog-actions">${buttons}</div>`;
    dialogShown = lines.length;

    // A dialog that's just opened starts at the top. When new lines arrive,
    // scroll so the first of them is at the top, so you read from the start.
    const box = el.querySelector<HTMLElement>('.dialog-lines')!;
    const firstNew = box.querySelectorAll<HTMLElement>(':scope > p:not(.blurb)')[before];
    if (opened) box.scrollTop = 0;
    else if (firstNew && lines.length > before) {
      box.scrollTop = firstNew.getBoundingClientRect().top - box.getBoundingClientRect().top - 4;
    } else box.scrollTop = keptScroll;
  }

  function renderToasts(): void {
    const s = ctl.session;
    if (!s || ctl.phase !== 'playing') return;
    if (s.number !== toastSession) {
      toastSession = s.number;
      toastSeen = s.log.length;
    }
    if (!s.dialog) {
      for (const l of s.log.slice(toastSeen)) showToast(l);
    }
    toastSeen = s.log.length;
  }

  function showToast(l: LogLine): void {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = lineHtml(l, false);
    $('toasts').appendChild(t);
    window.setTimeout(() => t.classList.add('out'), 4200);
    window.setTimeout(() => t.remove(), 4800);
  }

  /** The roll table bar. `marker` drops a pointer onto that number. */

  /** A d20 seen face-on: hexagon outline, front triangle, facet edges. */
  /** `asIcon` draws the label as a Material Symbols icon instead of a number. */
  function d20Svg(label: string, asIcon = false): string {
    const edges = [
      [50, 24, 50, 3], [50, 24, 9, 26], [50, 24, 91, 26],
      [75, 66, 91, 26], [75, 66, 91, 74], [75, 66, 50, 97],
      [25, 66, 9, 26], [25, 66, 9, 74], [25, 66, 50, 97],
    ].map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('');
    return `
      <svg class="d20" viewBox="0 0 100 100" aria-hidden="true">
        <polygon class="d-body" points="50,3 91,26 91,74 50,97 9,74 9,26"/>
        <polygon class="d-side" points="9,74 25,66 50,97"/>
        <polygon class="d-side" points="91,74 75,66 50,97"/>
        <polygon class="d-face" points="50,24 75,66 25,66"/>
        <g class="d-edges">${edges}</g>
        <text class="die-num${asIcon ? ' die-icon' : ''}" x="50" y="54">${label}</text>
      </svg>`;
  }

  function renderOverlay(): void {
    const el = $('overlay');
    const html = overlayHtml();
    el.innerHTML = html;
    el.classList.toggle('open', html !== '');
    const notes = el.querySelector('.notes-paper');
    if (notes) notes.scrollTop = notes.scrollHeight;
    // Tab bars scroll sideways: keep the chosen tab in view after a redraw.
    for (const bar of el.querySelectorAll<HTMLElement>('.top-tabs, .side-tabs')) {
      const on = bar.querySelector<HTMLElement>('.on');
      if (on && bar.scrollWidth > bar.clientWidth) {
        bar.scrollLeft = on.offsetLeft - bar.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2;
      }
    }
  }

  function overlayHtml(): string {
    const k = ctl.knowledge;
    if (modal === 'binder' && !ctl.pendingRoll) return binderHtml();
    if (modal === 'settings' && !ctl.pendingRoll) return settingsHtml();
    if (modal === 'table' && ctl.phase === 'playing' && !ctl.pendingRoll) {
      return `
        <div class="card table-card">
          <div class="binder-head">
            <h2>${mi('groups')} At the Table</h2>
            <button class="icon-close" data-act="close" title="Close (Esc)" aria-label="Close">${mi('close')}</button>
          </div>
          ${tableHtml().replace('<h3>At the Table</h3>', '')}
        </div>`;
    }
    if (modal === 'quit' && ctl.phase === 'playing' && !ctl.pendingRoll) {
      return confirmHtml('bedtime', 'Call it a night?',
        `<p>Everyone packs up and goes home. Nothing that happened tonight will count, and next game night starts from the inn again.</p>
         <p class="muted">Your binder keeps everything: pages, roll tables, adventure paths, friendships and achievements.</p>`,
        'End session', 'quit-confirm', 'Keep playing');
    }
    if (modal === 'reset') {
      return confirmHtml('delete_forever', 'Wipe your save?',
        `<p>This forgets every page, roll, taste, friendship, adventure path, ending and achievement. It can't be undone.</p>
         <p class="muted">Your settings are kept.</p>`,
        'Wipe my save', 'reset-confirm');
    }
    switch (ctl.phase) {
      case 'title':
        return `
          <div class="card title-card">
            <button class="gear" data-act="settings" title="Settings">${mi('settings')}</button>
            <h1>We'll Pick This Up<br/>Next Week</h1>
            <p>Your friends are tired. If the party doesn't finish the mission before someone falls asleep, the session doesn't count and everyone forgets it.</p>
            <p><b>Only you remember.</b></p>
            ${k.sessionsPlayed > 0 ? `<p class="muted">${k.sessionsPlayed} ${k.sessionsPlayed === 1 ? 'session' : 'sessions'} played. You've been on this campaign for ${k.weeksPassed} ${k.weeksPassed === 1 ? 'week' : 'weeks'}.</p>` : ''}
            <button class="primary big-start card-action" data-act="start">${k.sessionsPlayed > 0 ? 'Start game night' : 'Start your first game night'}</button>
          </div>`;
      case 'cupboard':
        return cupboardHtml();
      case 'ending':
        return `
          <div class="card ending">
            <p class="fade d0 told">${esc(ctl.endReason)}</p>
            <p class="fade d1 told">Marcus closes the book.</p>
            <p class="fade d2 big">"We'll pick this up next week!"</p>
            <button class="primary fade d4 card-action" data-act="start">Next game night</button>
          </div>`;
      case 'won': {
        const e = ctl.ending!;
        const def = ENDINGS[e.id];
        const ids = Object.keys(ENDINGS);
        const page = e.newPage ? PAGES.find((p) => p.id === e.newPage) : null;
        // Stagger each story line, then the summary and buttons.
        const step = 1.1;
        const lines = e.lines.map((l, i) => `<p class="fade" style="animation-delay:${0.2 + i * step}s">${esc(l)}</p>`).join('');
        const after = 0.4 + e.lines.length * step;
        return `
          <div class="card ending complete ending-${e.id}">
            <p class="ending-kicker fade" style="animation-delay:0s">${e.firstTime ? 'New ending found' : 'Ending'} · ${k.endings.length}/${ids.length}</p>
            <h2 class="ending-title fade" style="animation-delay:0s">${esc(def.title)}</h2>
            ${lines}
            <div class="fade" style="animation-delay:${after}s">
              <p class="muted">The session counts. It took ${k.sessionsPlayed} session${k.sessionsPlayed === 1 ? '' : 's'} and ${k.weeksPassed} weeks of real life.</p>
              ${page ? `<p class="new-page">${mi('description')} New page in your binder: <b>${esc(page.title)}</b>. It might open up something new next time.</p>` : ''}
            </div>
            <div class="fade card-action" style="animation-delay:${after + 1.2}s">
              <button class="primary" data-act="play-again">Play again (keep what you know)</button>
              <button class="link" data-act="reset">Wipe save and start fresh</button>
            </div>
          </div>`;
      }
      case 'playing':
        if (ctl.pendingRoll) return rollHtml();
        return '';
    }
  }



  function cupboardHtml(): string {
    const { items, spoiled } = ctl.pantry();
    const cards = items.map((id) => {
      const it = ITEMS[id];
      const on = picks.includes(id);
      const effects = itemHints(it).slice(1);
      return `<button class="pick ${on ? 'on' : ''}" data-act="pick" data-item="${id}" aria-pressed="${on}">
        ${on ? `<span class="picked">${mi('check')}</span>` : ''}
        <span class="pick-icon">${mi(it.icon)}</span>
        <span class="pick-type">${CATEGORY_LABELS[it.category]}</span>
        <b class="pick-name">${esc(it.name)}</b>
        ${effects.length ? `<span class="effects">${effects.map((e) => `<span>${e}</span>`).join('')}</span>` : ''}
        <span class="pick-blurb">${esc(it.blurb)}</span>
        ${previewHtml(id)}
      </button>`;
    }).join('');
    const notes = [
      spoiled.length
        ? `${mi('history')} It's been ${ctl.knowledge.lastGap} weeks. The ${spoiled.map((i) => ITEMS[i].name.toLowerCase()).join(' and ')} went off.`
        : '',
      ctl.bringers().length
        ? `${mi('favorite')} ${ctl.bringers().map((b) => FRIENDS[b].name).join(' and ')} ${ctl.bringers().length === 1 ? 'is' : 'are'} bringing something too.`
        : '',
    ].filter(Boolean).map((n) => `<p class="cup-note">${n}</p>`).join('');
    const chosen = picks[0] ? ITEMS[picks[0]] : null;
    return `
      <div class="card cupboard">
        <h1>The Cupboard</h1>
        <p class="cup-sub">Game night ${ctl.sessionNumber}. Pick one thing to bring. It comes out as a snack break when someone starts to flag.</p>
        ${notes}
        <div class="picks">${cards}</div>
        <button class="primary big-start card-action" data-act="go" ${chosen ? '' : 'disabled'}>${chosen ? `Bring the ${esc(chosen.name.toLowerCase())}` : 'Pick something to bring'}</button>
      </div>`;
  }

  /** A short + / − mark for how strongly they feel (the words are on hover). */
  function gradeHtml(mark: string, word: string): string {
    return mark
      ? `<span class="grade" title="${word}" aria-label="${word}">${mark}</span>`
      : `<span class="sr-only">${word}</span>`;
  }

  function styleListHtml(id: FriendId): string {
    const icon = { like: '♥', dislike: '✗', neutral: '–' } as const;
    const mark = { like: '+', dislike: '−', neutral: '' } as const;
    const word = { like: 'loves it', dislike: "doesn't like it", neutral: "doesn't mind" } as const;
    return `<ul class="tastes styles">${STYLES.map((st) => {
      const k = ctl.knownStyle(id, st);
      const cls = k === 'like' ? 't-like' : k === 'dislike' ? 't-dislike' : k === 'neutral' ? 't-neutral' : 't-unknown';
      return `<li class="${cls}"><span class="ti">${k ? icon[k] : '?'}</span>${STYLE_LABELS[st]}${k ? gradeHtml(mark[k], word[k]) : ''}</li>`;
    }).join('')}</ul>`;
  }

  function tasteListHtml(id: FriendId): string {
    const mark: Record<Taste, string> = { like: '+', neutral: '', dislike: '−', refuses: '−−' };
    return `<ul class="tastes">${CATEGORIES.map((c) => {
      const t = ctl.knownTaste(id, c);
      return `<li class="${t ? `t-${t}` : 't-unknown'}"><span class="ti">${t ? TASTE_ICON[t] : '?'}</span>${CATEGORY_LABELS[c]}${t ? gradeHtml(mark[t], TASTE_WORD[t]) : ''}</li>`;
    }).join('')}</ul>`;
  }

  function profileHtml(id: FriendId, compact = false): string {
    const f = FRIENDS[id];
    return `
      <div class="profile ${compact ? 'compact' : ''}">
        <div class="profile-head">
          ${avatarHtml(id, true)}
          <div><h3>${f.name} <span class="role">${f.role}</span></h3><p class="muted">${esc(f.vibe)}</p></div>
          ${spriteUrl(`char-${id}`) ? `<img class="char-full" src="${spriteUrl(`char-${id}`)}" alt="" />` : ''}
        </div>
        <p><b>${f.character ? `Plays ${esc(f.character.name)}:` : 'Plays:'}</b> ${f.character ? esc(f.character.title) : 'nobody. Marcus runs the game, and voices every single NPC.'}</p>
        <p><b>How you know them:</b> ${esc(f.howYouKnow)}</p>
        <h4>Friendship ${heartsHtml(id)}</h4>
        ${friendshipDetail(id)}
        <h4>How they like to play</h4>
        ${styleListHtml(id)}
        <h4>What they like to eat</h4>
        ${tasteListHtml(id)}
      </div>`;
  }

  function friendshipDetail(id: FriendId): string {
    const h = ctl.hearts(id);
    const points = ctl.friendPoints(id);
    const toNext = h >= MAX_HEARTS ? null : POINTS_PER_HEART - (points % POINTS_PER_HEART);
    const perk = (on: boolean, text: string) => `<li class="${on ? 'on' : ''}">${on ? '✓' : '·'} ${text}</li>`;
    return `
      <p class="muted small">${toNext === null ? 'Best friends.' : `${toNext} more to the next heart.`} Earned hearts are for keeps.</p>
      <ul class="perks">
        ${perk(h > 0, `Tires ${Math.round(STAMINA_PER_HEART * h * 100)}% slower (${Math.round(STAMINA_PER_HEART * 100)}% per heart)`)}
        ${perk(h >= RALLY_HEARTS, `${'♥'.repeat(RALLY_HEARTS)} Rallies once a night instead of falling asleep`)}
        ${perk(h >= REVEAL_AT_HEARTS[REVEAL_AT_HEARTS.length - 1], `${REVEAL_AT_HEARTS.map((n) => '♥'.repeat(n)).join(' and ')} Lets a taste slip during the week`)}
        ${perk(h >= MAX_HEARTS, `${'♥'.repeat(MAX_HEARTS)} Brings a snack to game night`)}
      </ul>`;
  }

  function rollHtml(): string {
    const pending = ctl.pendingRoll!;
    const obj = OBJECTS.find((o) => o.id === pending.objectId)!;
    const action = obj.actions.find((a) => a.id === pending.actionId)!;
    const check = CHECKS[action.check!];

    let die: string;
    let below = '';
    let marker: number | undefined;

    if (!roll) {
      die = `<button class="die-wrap idle" data-act="roll" title="Roll (Enter)">${d20Svg('20')}<span class="die-shadow"></span></button>`;
      const paths = ctl.canUseAmulet()
        ? `<p>Take a path you've already seen <span class="muted small">(any time)</span></p>
            ${ctl.knownOutcomes(check.id).map((b) => `<button class="chip outcome ${BAND_COLORS[check.bands.indexOf(b) % BAND_COLORS.length]}" data-act="remember" data-band="${b.id}">${esc(b.label)}</button>`).join('')}`
        : '';
      const choose = ctl.canChooseRoll()
        ? `<p>Or choose the exact roll <span class="muted small">(once tonight; it becomes a path you can take forever)</span></p>
            <div class="num-grid">${Array.from({ length: 20 }, (_, i) => i + 1).map((n) => `<button class="chip num" data-act="choose" data-value="${n}">${n}</button>`).join('')}</div>`
        : '';
      const remembered = paths || choose
        ? `<div class="remember"><p>${mi('pets')} <b>Amulet of the Groundhog</b></p>${paths}${choose}</div>`
        : '';
      below = `${remembered}<button class="primary card-action" data-act="roll">Roll the d20</button>`;
    } else if (roll.phase === 'rolling') {
      die = `<div class="die-wrap throw">${d20Svg(String(rollD20()))}<span class="die-shadow"></span></div>`;
      below = '<p class="rolling-note">Rolling…</p>';
    } else {
      const remembered = roll.bandId !== null;
      const band = remembered ? check.bands.find((b) => b.id === roll!.bandId)! : bandFor(check, roll.value);
      const color = BAND_COLORS[check.bands.indexOf(band) % BAND_COLORS.length];
      const flair = remembered || roll.chosen ? 'remembered' : roll.value === 20 ? 'crit' : roll.value === 1 ? 'fumble' : '';
      const tag = remembered
        ? "You've been down this road before"
        : roll.chosen ? 'You bent your luck'
        : roll.value === 20 ? 'Natural 20!' : roll.value === 1 ? 'Natural 1…' : '';
      die = `<div class="die-wrap landed ${flair}">${d20Svg(remembered ? 'pets' : String(roll.value), remembered)}<span class="die-shadow"></span></div>`;
      below = `
        ${tag ? `<p class="flair-tag ${flair}">${tag}</p>` : ''}
        <p class="result ${color}">${esc(band.label)}</p>
        <button class="primary reveal-in card-action" data-act="roll-continue">Continue</button>`;
      if (!remembered) marker = roll.value;
    }

    return `
      <div class="card roll-card">
        <h2>${mi('casino')} ${esc(check.name)}</h2>
        <p class="muted">One roll decides it. What you know about this table:</p>
        <div class="roll-scale">${rollScaleHtml(check.id, marker, true)}</div>
        <div class="tray">${die}</div>
        ${below}
      </div>`;
  }

  /** Tabs across the top of a binder section. */
  function topTabs(items: { id: string; label: string }[], current: string, act: string): string {
    return `<div class="top-tabs">${items.map((t) =>
      `<button class="top-tab ${t.id === current ? 'on' : ''}" data-act="${act}" data-id="${t.id}">${t.label}</button>`,
    ).join('')}</div>`;
  }

  /** Pages are cards: click to flip between the front and the DM-only back. */
  function pagesBody(): string {
    const k = ctl.knowledge;
    const cards = PAGES.map((p) => {
      if (!k.pages.includes(p.id)) {
        return '<div class="page-card"><article class="page missing"><h3>???</h3><p>A page you haven\'t found yet.</p></article></div>';
      }
      const read = k.flipped.includes(p.id);
      return `
        <div class="page-card ${faceDown.has(p.id) ? 'flipped' : ''} ${read ? '' : 'unread'}" data-act="flip" data-page="${p.id}" role="button" tabindex="0" title="Click to flip">
          <article class="page front ${p.damage ?? ''}">
            <h3>${esc(p.title)}</h3>${p.body}
            <span class="flip-hint">${read ? '↻' : '↻ flip me'}</span>
          </article>
          <article class="page back ${p.damage ?? ''}">
            <span class="dm-stamp">DM EYES ONLY</span>
            <h3>${esc(p.title)}: back</h3>${p.back}
            <span class="flip-hint">↻</span>
          </article>
        </div>`;
    }).join('');
    return `<p class="muted small">Click a page to flip it over. The backs are where the DM's secrets live.</p>
      <div class="pages-grid">${cards}</div>`;
  }

  function friendsBody(): string {
    const tabs = FRIEND_ORDER.map((id) => ({
      id,
      label: `<span class="mini-avatar" style="--c:${FRIENDS[id].color}">${spriteUrl(`face-${id}`) ? `<img src="${spriteUrl(`face-${id}`)}" alt="" />` : FRIENDS[id].name[0]}</span>${FRIENDS[id].name}`,
    }));
    return `${topTabs(tabs, friendTab, 'friend-tab')}
      ${profileHtml(friendTab)}
      <p class="muted small">Friendship lasts between sessions. It grows when you bring things they love and play the way they like. Playing the way they don't, or testing the table's patience, sets back your progress toward the next heart, but a heart you've earned is yours to keep.</p>`;
  }

  /**
   * Roll tables by location. Rolls you've tried show what you know; the
   * rest are "???", so you can tell a place has more to find.
   */
  function tablesBody(): string {
    const k = ctl.knowledge;
    const tabs = AREA_ORDER.map((id) => {
      if (!ctl.hasSeen(id)) return { id, label: '???' };
      const checks = Object.keys(CHECK_AREA).filter((c) => CHECK_AREA[c] === id);
      const seen = checks.filter((c) => k.rolls.some((r) => r.check === c) || ctl.fullyRevealed(c)).length;
      return { id, label: `${AREAS[id].name.replace(/^The /, '')} <span class="tab-count">${seen}/${checks.length}</span>` };
    });
    if (!ctl.hasSeen(areaTab)) {
      return `${topTabs(tabs, areaTab, 'area-tab')}<div class="table-row unknown-roll"><h4>???</h4><p class="muted">A place you haven't found yet.</p></div>`;
    }
    const known = (id: string) => k.rolls.some((r) => r.check === id) || ctl.fullyRevealed(id);
    // Known rolls first, then the ??? ones.
    const checks = Object.keys(CHECK_AREA)
      .filter((c) => CHECK_AREA[c] === areaTab)
      .sort((a, b) => Number(known(b)) - Number(known(a)));
    const seen = checks.filter(known);
    const unseen = checks.length - seen.length;
    const more = unseen
      ? `<p class="rt-more">${mi('help')} ${unseen === 1 ? 'One more roll' : `${unseen} more rolls`} to find here.</p>`
      : '';
    const body = checks.length
      ? `${seen.map(rollTableHtml).join('')}${more}`
      : '<p class="muted">No rolls here.</p>';
    return `${topTabs(tabs, areaTab, 'area-tab')}${body}`;
  }

  /**
   * Adventure paths: each quest's steps, and every route through each step.
   * Routes you've taken show when you first took them; the rest are "???".
   * Steps further along than you've got stay "???" too.
   */
  function pathsBody(): string {
    const paths = ctl.knowledge.paths;
    const found = (q: QuestDef) => q.steps.some((st) => st.routes.some((r) => routeTaken(paths, r) !== null));
    const tabs = QUESTS.map((q) => {
      if (!q.known && !found(q)) return { id: q.id, label: '???' };
      const routes = q.steps.flatMap((st) => st.routes);
      const got = routes.filter((r) => routeTaken(paths, r) !== null).length;
      return { id: q.id, label: `${mi(q.icon)} ${esc(q.title)} <span class="tab-count">${got}/${routes.length}</span>` };
    });
    const q = QUESTS.find((x) => x.id === pathTab) ?? QUESTS[0];
    if (!q.known && !found(q)) {
      return `${topTabs(tabs, q.id, 'path-tab')}<div class="table-row unknown-roll"><h4>???</h4><p class="muted">A quest you haven't stumbled into yet.</p></div>`;
    }
    // Show steps up to (and including) the first one you haven't done yet.
    let revealed = true;
    const steps = q.steps.map((st, i) => {
      const taken = st.routes.map((r) => routeTaken(paths, r));
      const done = taken.some((n) => n !== null);
      const show = revealed || done;
      if (!done && !st.optional) revealed = false;
      const routes = st.routes.map((r, j) => taken[j] !== null
        ? `<li class="route found">${mi('check')}<span>${esc(r.label)}</span><span class="when">session ${taken[j]}</span></li>`
        : `<li class="route unknown">${mi('help')}<span>???</span></li>`).join('');
      return `<li class="step ${done ? 'done' : show ? 'next' : 'hidden'}">
        <span class="step-dot">${done ? mi('check') : i + 1}</span>
        <div class="step-body">
          <h4>${show ? esc(st.title) : '???'}${st.optional && show ? ' <span class="muted small">(optional)</span>' : ''}
            <span class="tab-count">${taken.filter((n) => n !== null).length}/${st.routes.length}</span></h4>
          <ul class="routes">${routes}</ul>
        </div>
      </li>`;
    }).join('');
    return `${topTabs(tabs, q.id, 'path-tab')}
      <p class="muted small">${esc(q.blurb)} Every route you've ever taken is here, whichever night it was.</p>
      <ol class="path">${steps}</ol>`;
  }

  /**
   * One roll table: a 1–20 scale split into its outcomes (hatched where you
   * don't know yet), pins for the numbers you've rolled, and a legend.
   */
  /**
   * A roll's 1–20 scale and legend: the outcomes you know, hatched where you
   * don't, pins for past rolls, and (on the dice screen) a bright pin for the
   * number you just rolled.
   */
  function rollScaleHtml(id: string, current?: number, onDice = false): string {
    const c = CHECKS[id];
    const segs = ctl.segmentsFor(id);
    const rolls = ctl.knowledge.rolls.filter((r) => r.check === id).map((r) => r.value);
    const color = (seg: Segment) => (seg.band ? BAND_COLORS[c.bands.indexOf(seg.band) % BAND_COLORS.length] : 'unknown');
    const range = (seg: Segment) => (seg.from === seg.to ? `${seg.from}` : `${seg.from}–${seg.to}`);
    const at = (v: number) => `left:${((v - 0.5) / 20) * 100}%`;

    const bar = segs.map((seg) => `<span class="rt-seg ${color(seg)}" style="flex:${seg.to - seg.from + 1}" title="${range(seg)}: ${seg.band ? esc(seg.band.label) : 'unknown'}"></span>`).join('');
    const counts = new Map<number, number>();
    for (const v of rolls) counts.set(v, (counts.get(v) ?? 0) + 1);
    const past = onDice ? ' past' : '';
    const pins = [...counts].filter(([v]) => v !== current).map(([v, n]) =>
      `<span class="rt-pin${past}" style="${at(v)}" title="You rolled ${v}${n > 1 ? ` ${n} times` : ''}">${v}${n > 1 ? `<small>×${n}</small>` : ''}</span>`).join('')
      + (current !== undefined ? `<span class="rt-pin now" style="${at(current)}" title="Tonight's roll">${current}</span>` : '');
    const ticks = [1, 5, 10, 15, 20].map((v) => `<span style="${at(v)}">${v}</span>`).join('');
    const unknown = segs.filter((seg) => !seg.band).map(range);
    const legend = segs.filter((seg) => seg.band).map((seg) => `
      <li>
        <span class="rt-swatch ${color(seg)}"></span>
        <b>${range(seg)}</b>
        <span>${esc(seg.band!.label)}</span>
      </li>`).join('') + (unknown.length ? `
      <li class="unknown">
        <span class="rt-swatch unknown"></span>
        <span>Still a mystery: ${unknown.join(', ')}</span>
      </li>` : '');
    return `
      <div class="rt-scale">
        <div class="rt-pins">${pins}</div>
        <div class="rt-bar">${bar}</div>
        <div class="rt-ticks">${ticks}</div>
      </div>
      <ul class="rt-legend">${legend}</ul>`;
  }

  /** One roll table in the binder: the scale and legend, plus how you know it. */
  function rollTableHtml(id: string): string {
    const c = CHECKS[id];
    const segs = ctl.segmentsFor(id);
    const rolls = ctl.knowledge.rolls.filter((r) => r.check === id);
    const badges = [
      ctl.fullyRevealed(id) ? `<span class="rt-badge">${mi('description')} From a page</span>` : '',
      rolls.length ? `<span class="rt-badge">${mi('casino')} Rolled ${rolls.length === 1 ? 'once' : `${rolls.length} times`}</span>` : '',
      segs.every((s) => s.band) ? `<span class="rt-badge done">${mi('check')} All known</span>` : '',
    ].join('');
    return `
      <article class="rt-card">
        <header><h4>${esc(c.name)}</h4><span class="rt-badges">${badges}</span></header>
        ${rollScaleHtml(id)}
      </article>`;
  }

  function notesBody(): string {
    const s = ctl.session;
    if (!s || ctl.phase !== 'playing') return '<p class="muted">No game night in progress. Session notes only last for one night.</p>';
    const notes = s.log.map((l) => {
      const who = speakerName(l.who);
      const tag = who ? `<b style="color:${speakerColor(l.who)}">${who}:</b> ` : '';
      return `<div class="note ${l.who === 'system' ? 'system' : ''}">
        <span class="time">${fmtClock(l.at)}</span><span class="note-text">${tag}${l.icon ? mi(l.icon, 'line-icon') : ''}${esc(l.text)}</span></div>`;
    }).join('');
    return `
      <p class="muted small">Session ${s.number}, scribbled on the back of a character sheet. These go in the bin when the night ends. Only your binder survives.</p>
      <div class="notes-paper">${notes}</div>`;
  }

  function achievementsBody(): string {
    const got = ctl.knowledge.achievements;
    const cards = ACHIEVEMENTS.map((a) => {
      const on = got.includes(a.id);
      const hidden = a.secret && !on;
      return `<div class="ach ${on ? 'on' : ''}">
        <span class="ach-icon">${mi(hidden ? 'help' : a.icon)}</span>
        <div><b>${hidden ? '???' : esc(a.name)}</b><p>${hidden ? 'A secret. Keep exploring.' : esc(a.desc)}</p></div>
      </div>`;
    }).join('');
    return `<p class="muted small">${got.length} of ${ACHIEVEMENTS.length} unlocked. These stick around through every session and every playthrough.</p>
      <div class="ach-grid">${cards}</div>`;
  }

  /** A row of choice buttons for one setting. */
  function choiceRow<K extends keyof Settings>(key: K, label: string, hint: string, options: [Settings[K], string][]): string {
    return `<div class="setting">
      <div><b>${label}</b><p class="muted small">${hint}</p></div>
      <div class="choices">${options.map(([value, text]) => `<button class="choice ${settings[key] === value ? 'on' : ''}" data-act="set" data-key="${key}" data-value="${String(value)}">${text}</button>`).join('')}</div>
    </div>`;
  }

  /** A 0–100 volume slider for one setting. */
  function sliderRow(key: 'musicVolume' | 'sfxVolume', label: string, hint: string): string {
    const v = settings[key];
    return `<div class="setting">
      <div><b>${label}</b><p class="muted small">${hint}</p></div>
      <label class="slider">
        <input type="range" min="0" max="100" step="5" value="${v}" data-volume="${key}" aria-label="${label} volume" />
        <span class="slider-value">${v}%</span>
      </label>
    </div>`;
  }

  /** "Version 0.2.0 · build 6ada675 · 11 Nov 2026", to check which build you're on. */
  function versionText(): string {
    // Defined at build time; a dev server started before vite.config.ts changed won't have them.
    if (typeof __APP_VERSION__ === 'undefined') return 'Version: dev build';
    const built = new Date(__APP_BUILT__).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    return `Version ${__APP_VERSION__} · build ${__APP_COMMIT__} · ${built}`;
  }

  function settingsHtml(): string {
    return `
      <div class="card settings">
        <div class="binder-head">
          <h2>${mi('settings')} Settings</h2>
          <button class="icon-close" data-act="close" title="Close (Esc)" aria-label="Close">${mi('close')}</button>
        </div>
        ${choiceRow('textSize', 'Text size', 'For the dialog, pages and notes.', [['normal', 'Normal'], ['large', 'Large']])}
        ${choiceRow('walkSpeed', 'Walk speed', 'How fast you walk to things you click.', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']])}
        ${choiceRow('quickRolls', 'Quick dice rolls', 'Skip the tumble and show the result straight away.', [[false, 'Off'], [true, 'On']])}
        ${choiceRow('reduceMotion', 'Reduce motion', 'Turn off fades and animations.', [[false, 'Off'], [true, 'On']])}
        <h3 class="settings-section">${mi('music_note')} Sound</h3>
        ${sliderRow('musicVolume', 'Music', 'A little chiptune for each part of town.')}
        ${sliderRow('sfxVolume', 'Sound effects', 'Dice, new pages and achievements.')}
        ${choiceRow('muted', 'Mute everything', 'Silence the music and the sound effects.', [[false, 'Off'], [true, 'On']])}
        <div class="danger">
          <div><b>Reset save</b><p class="muted small">Forget every page, roll, taste, friendship, ending and achievement. Settings are kept.</p></div>
          <button class="danger-btn" data-act="reset">Reset save</button>
        </div>
        <p class="version">${versionText()}</p>
      </div>`;
  }

  function binderHtml(): string {
    const k = ctl.knowledge;
    const counts: Partial<Record<BinderTab, string>> = {
      pages: `${k.pages.length}/${PAGES.length}`,
      achievements: `${k.achievements.length}/${ACHIEVEMENTS.length}`,
    };
    const side = BINDER_TABS.map((t) => `
      <button class="side-tab ${binderTab === t.id ? 'on' : ''}" data-act="binder-tab" data-tab="${t.id}" title="${t.label}" aria-label="${t.label}${counts[t.id] ? ` (${counts[t.id]})` : ''}">
        <span class="side-icon">${mi(t.icon)}</span><span class="side-label">${t.label}</span>
        ${counts[t.id] ? `<span class="tab-count">${counts[t.id]}</span>` : ''}
      </button>`).join('');
    const body = {
      pages: pagesBody, friends: friendsBody, tables: tablesBody, paths: pathsBody,
      notes: notesBody, achievements: achievementsBody,
    }[binderTab]();
    const title = BINDER_TABS.find((t) => t.id === binderTab)!;
    return `
      <div class="card binder">
        <nav class="side-tabs">
          <div class="binder-title">${mi('menu_book')} Your binder</div>
          ${side}
        </nav>
        <section class="binder-main">
          <div class="binder-head">
            <h2>${mi(title.icon)} ${title.label}</h2>
            <button class="icon-close" data-act="close" title="Close (Esc)" aria-label="Close">${mi('close')}</button>
          </div>
          <div class="binder-body ${binderTab}">${body}</div>
        </section>
      </div>`;
  }

  // ── Input ──────────────────────────────────────────────────

  /** Delays between number flips while the die tumbles: fast, then settling. */
  const FLIP_DELAYS = [40, 40, 45, 50, 55, 65, 75, 90, 110, 135, 165, 200];

  function clearRollTimers(): void {
    rollTimers.forEach((t) => window.clearTimeout(t));
    rollTimers = [];
  }

  /**
   * Throw the die. The overlay renders once for the throw (so the CSS
   * tumble isn't restarted), only the number is swapped while it rolls, and
   * it renders again once it lands.
   */
  function throwDie(): void {
    if (roll) return;
    const value = rollD20();
    roll = { phase: 'rolling', value, bandId: null };
    renderOverlay();
    playSfx('dice');
    const reduced = skipDiceAnimation();
    let at = 0;
    let last = 0;
    for (const delay of reduced ? [] : FLIP_DELAYS) {
      at += delay;
      rollTimers.push(window.setTimeout(() => {
        const num = document.querySelector('#overlay .die-num');
        // Any number except the one showing (step 1–19 around the die), so
        // every flip visibly changes.
        const step = 1 + Math.floor(Math.random() * 19);
        const n = last ? 1 + ((last - 1 + step) % 20) : rollD20();
        last = n;
        if (num) num.textContent = String(n);
      }, at));
    }
    rollTimers.push(window.setTimeout(() => {
      if (!roll) return;
      roll.phase = 'landed';
      playSfx('land');
      renderOverlay();
    }, reduced ? 150 : at + 120));
  }

  /**
   * Between sessions: fade to black, show "N weeks later…", then fade back
   * in on the cupboard.
   */
  let skipping = false;
  function timeSkip(weeks: number): void {
    if (skipping) return;
    skipping = true;
    const c = $('curtain');
    c.innerHTML = `<p class="later">${weeks} weeks later…</p>`;
    c.className = 'show';
    const at = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
    at(1000, () => {
      picks = [];
      modal = null;
      ctl.toCupboard();
      c.classList.add('text');
    });
    at(3800, () => c.classList.remove('text'));
    at(4600, () => c.classList.add('lift'));
    at(5500, () => {
      c.className = '';
      c.innerHTML = '';
      skipping = false;
    });
  }

  function openBinder(tab?: BinderTab): void {
    if (ctl.pendingRoll) return;
    if (tab) binderTab = tab;
    modal = 'binder';
    renderOverlay();
    const notes = document.querySelector('#overlay .notes-paper');
    if (notes) notes.scrollTop = notes.scrollHeight;
  }

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!t) return;
    const d = t.dataset;
    switch (d.act) {
      case 'start':
        if (ctl.phase === 'ending') {
          timeSkip(ctl.knowledge.lastGap);
          break;
        }
        picks = [];
        modal = null;
        // The very first game night skips the cupboard: it opens at the boss.
        if (ctl.phase === 'title' && ctl.knowledge.sessionsPlayed === 0) ctl.startPrologue();
        else ctl.toCupboard();
        break;
      case 'pick': {
        const id = d.item as ItemId;
        if (picks.includes(id)) picks = picks.filter((p) => p !== id);
        else if (ITEM_SLOTS === 1) picks = [id];
        else if (picks.length < ITEM_SLOTS) picks.push(id);
        renderOverlay();
        break;
      }
      case 'go':
        if (picks.length === 0) break;
        ctl.startSession(picks);
        picks = [];
        break;
      case 'action':
        ctl.perform(d.obj!, d.action!);
        break;
      case 'close-dialog':
        ctl.closeDialog();
        break;
      case 'profile':
        friendTab = d.friend as FriendId;
        openBinder('friends');
        break;
      case 'flip': {
        const id = d.page!;
        if (faceDown.has(id)) faceDown.delete(id);
        else faceDown.add(id);
        ctl.flipPage(id);
        // Flip in place so the card animates instead of being redrawn.
        t.classList.toggle('flipped', faceDown.has(id));
        t.classList.remove('unread');
        const hint = t.querySelector('.front .flip-hint');
        if (hint) hint.textContent = '↻';
        const count = document.querySelector('.side-tab.on .tab-count');
        if (count) count.textContent = `${ctl.knowledge.pages.length}/${PAGES.length}`;
        break;
      }
      case 'friend-tab':
        friendTab = d.id as FriendId;
        renderOverlay();
        break;
      case 'area-tab':
        areaTab = d.id as AreaId;
        renderOverlay();
        break;
      case 'path-tab':
        pathTab = d.id!;
        renderOverlay();
        break;
      case 'binder':
        // Open on the current location's roll tables if that's where you were.
        if (ctl.session) areaTab = ctl.session.area;
        openBinder();
        break;
      case 'binder-tab':
        openBinder(d.tab as BinderTab);
        break;
      case 'close':
        modal = null;
        renderOverlay();
        break;
      case 'roll':
        throwDie();
        break;
      case 'choose':
        if (!roll) {
          roll = { phase: 'landed', value: Number(d.value), bandId: null, chosen: true };
          playSfx('land');
          renderOverlay();
        }
        break;
      case 'remember':
        if (!roll) {
          roll = { phase: 'landed', value: 0, bandId: d.band! };
          playSfx('land');
          renderOverlay();
        }
        break;
      case 'roll-continue':
        if (roll?.phase === 'landed') {
          const r = roll;
          roll = null;
          clearRollTimers();
          if (r.bandId) ctl.resolveRemembered(r.bandId);
          else if (r.chosen) ctl.resolveChosen(r.value);
          else ctl.resolveRoll(r.value);
        }
        break;
      case 'play-again':
        if (ctl.phase === 'won') timeSkip(ctl.knowledge.lastGap);
        break;
      case 'settings':
        if (!ctl.pendingRoll) {
          modal = 'settings';
          renderOverlay();
        }
        break;
      case 'set': {
        const key = d.key as keyof Settings;
        const raw = d.value!;
        const value = raw === 'true' ? true : raw === 'false' ? false : raw;
        setSetting(key, value as never);
        applyVolumes();
        renderOverlay();
        break;
      }
      case 'reset':
        modal = 'reset';
        renderOverlay();
        break;
      case 'reset-confirm':
        picks = [];
        modal = null;
        ctl.resetCampaign();
        renderOverlay();
        break;
      case 'table':
        if (ctl.phase === 'playing' && !ctl.pendingRoll) {
          modal = 'table';
          renderOverlay();
        }
        break;
      case 'quit':
        if (ctl.phase === 'playing' && !ctl.pendingRoll) {
          modal = 'quit';
          renderOverlay();
        }
        break;
      case 'quit-confirm':
        modal = null;
        ctl.callItANight();
        renderOverlay();
        break;
    }
  });

  // Volume sliders: update as you drag, and play a blip so you can hear the level.
  document.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    const key = el.dataset.volume as 'musicVolume' | 'sfxVolume' | undefined;
    if (!key) return;
    setSetting(key, Number(el.value));
    applyVolumes();
    const label = el.parentElement?.querySelector('.slider-value');
    if (label) label.textContent = `${el.value}%`;
  });
  document.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.volume === 'sfxVolume') playSfx('land');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal) {
        modal = null;
        renderOverlay();
      } else {
        ctl.closeDialog();
      }
      return;
    }
    // Enter or Space rolls the die, then continues.
    if (ctl.pendingRoll && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (!roll) throwDie();
      else if (roll.phase === 'landed') (document.querySelector('#overlay [data-act=roll-continue]') as HTMLElement | null)?.click();
      return;
    }
    // Number keys pick dialog actions; Enter continues narration.
    if (modal || ctl.pendingRoll || ctl.phase !== 'playing') return;
    const buttons = [...document.querySelectorAll<HTMLElement>('#dialog .action')];
    if (e.key === 'Enter' && buttons.length === 1 && buttons[0].dataset.act === 'close-dialog') {
      buttons[0].click();
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= 9 && buttons[n - 1]?.dataset.act === 'action') buttons[n - 1].click();
  });

  ctl.on('change', render);
  applySettings();
  render();
}
