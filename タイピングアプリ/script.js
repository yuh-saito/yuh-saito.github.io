import { QUESTIONS } from './data/questions.js';

const GAME_MODES = {
  TIME_ATTACK: {
    key: 'time-attack',
    label: 'タイムアタック',
    timeLimitSeconds: 30,
    missionCount: null,
  },
  MISSION: {
    key: 'mission',
    label: 'ミッションモード',
    timeLimitSeconds: null,
    missionCount: 3,
  },
};

const SCREEN_IDS = {
  title: 'title-screen',
  modeSelect: 'mode-select-screen',
  ready: 'ready-screen',
  play: 'play-screen',
  result: 'result-screen',
  ranking: 'ranking-screen',
};

const READY_FEEDBACK_MESSAGE = 'Spaceで開始';
const DEFAULT_RANK = 'E';
const SECONDS_PER_MINUTE = 60;
const MISS_FLASH_DURATION_MS = 180;
const COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const LOCAL_STORAGE_PLAYER_NAME_KEY = 'typing-app-player-name';
const LOCAL_STORAGE_RANKING_KEY = 'typing-app-local-ranking';
const RANK_THRESHOLDS = [
  { rank: 'SS', minScore: 300 },
  { rank: 'S', minScore: 250 },
  { rank: 'A', minScore: 200 },
  { rank: 'B', minScore: 150 },
  { rank: 'C', minScore: 110 },
  { rank: 'D', minScore: 70 },
  { rank: 'E', minScore: 0 },
];
const KEY_TO_FINGER_MAP = {
  '1': 'left-pinky',
  q: 'left-pinky',
  a: 'left-pinky',
  z: 'left-pinky',
  '2': 'left-ring',
  w: 'left-ring',
  s: 'left-ring',
  x: 'left-ring',
  '3': 'left-middle',
  e: 'left-middle',
  d: 'left-middle',
  c: 'left-middle',
  '4': 'left-index',
  '5': 'left-index',
  r: 'left-index',
  f: 'left-index',
  v: 'left-index',
  t: 'left-index',
  g: 'left-index',
  b: 'left-index',
  '6': 'right-index',
  '7': 'right-index',
  y: 'right-index',
  h: 'right-index',
  n: 'right-index',
  u: 'right-index',
  j: 'right-index',
  m: 'right-index',
  '8': 'right-middle',
  i: 'right-middle',
  k: 'right-middle',
  ',': 'right-middle',
  '9': 'right-ring',
  o: 'right-ring',
  l: 'right-ring',
  ';': 'right-ring',
  '.': 'right-ring',
  '0': 'right-pinky',
  p: 'right-pinky',
  '-': 'right-pinky',
  '@': 'right-pinky',
  ':': 'right-pinky',
  '/': 'right-pinky',
  Space: 'right-thumb',
};

const ROMAJI_VARIANTS = {
  shi: ['shi', 'si', 'ci'],
  chi: ['chi', 'ti'],
  tsu: ['tsu', 'tu'],
  fu: ['fu', 'hu'],
  ji: ['ji', 'zi'],
  sha: ['sha', 'sya'],
  shu: ['shu', 'syu'],
  sho: ['sho', 'syo'],
  cha: ['cha', 'tya', 'cya'],
  chu: ['chu', 'tyu', 'cyu'],
  cho: ['cho', 'tyo', 'cyo'],
  ja: ['ja', 'zya', 'jya'],
  ju: ['ju', 'zyu', 'jyu'],
  jo: ['jo', 'zyo', 'jyo'],
};
const SINGLE_N_ROMAJI = 'n';
const IGNORE_KEY_SET = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'Tab',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Backspace',
]);

/**
 * アプリケーション全体の状態です。
 *
 * @type {{
 *   currentScreen: 'title' | 'modeSelect' | 'ready' | 'play' | 'result',
 *   selectedMode: { key: string, label: string, timeLimitSeconds: number | null, missionCount: number | null } | null,
 *   keyboardVisible: boolean,
 *   fingerGuideVisible: boolean,
 *   score: number,
 *   correctCount: number,
 *   missCount: number,
 *   totalTypeCount: number,
 *   clearedQuestionCount: number,
 *   elapsedSeconds: number,
 *   remainingValue: number,
 *   currentQuestion: { id: string, text: string, kana: string, romaji: string },
 *   previousQuestionId: string | null,
 *   typedText: string,
 *   resultRank: string,
 *   isPlaying: boolean,
 *   missFlashTimerId: number | null,
 *   missFlashActive: boolean,
 *   currentRomajiOptions: string[],
 *   timerId: number | null,
 *   countdownValue: number,
 *   countdownTimerId: number | null,
 *   isCountdownRunning: boolean,
 * }}
 */
const appState = {
  currentScreen: 'title',
  selectedMode: null,
  playerName: '',
  latestRankingEntry: null,
  pendingRankingSave: false,
  keyboardVisible: true,
  fingerGuideVisible: true,
  score: 0,
  correctCount: 0,
  missCount: 0,
  totalTypeCount: 0,
  clearedQuestionCount: 0,
  elapsedSeconds: 0,
  remainingValue: GAME_MODES.TIME_ATTACK.timeLimitSeconds,
  currentQuestion: QUESTIONS[0],
  previousQuestionId: null,
  typedText: '',
  resultRank: DEFAULT_RANK,
  isPlaying: false,
  missFlashTimerId: null,
  missFlashActive: false,
  currentRomajiOptions: [],
  timerId: null,
  countdownValue: COUNTDOWN_START,
  countdownTimerId: null,
  isCountdownRunning: false,
};

const elements = {
  screens: Array.from(document.querySelectorAll('[data-screen]')),
  statusMode: document.querySelector('#status-mode'),
  statusScore: document.querySelector('#status-score'),
  statusCorrect: document.querySelector('#status-correct'),
  statusMiss: document.querySelector('#status-miss'),
  statusRemainingLabel: document.querySelector('#status-remaining-label'),
  statusRemainingValue: document.querySelector('#status-remaining-value'),
  questionText: document.querySelector('#question-text'),
  questionKana: document.querySelector('#question-kana'),
  typedRomaji: document.querySelector('#typed-romaji'),
  remainingRomaji: document.querySelector('#remaining-romaji'),
  romajiProgressBar: document.querySelector('#romaji-progress-bar'),
  readyKeyboardToggle: document.querySelector('#ready-keyboard-toggle'),
  readyFingerGuideToggle: document.querySelector('#ready-finger-guide-toggle'),
  readyModeName: document.querySelector('#ready-mode-name'),
  readyModeDescription: document.querySelector('#ready-mode-description'),
  playCountdownDisplay: document.querySelector('#play-countdown-display'),
  playQuestionCard: document.querySelector('#play-question-card'),
  virtualKeyboard: document.querySelector('#virtual-keyboard'),
  fingerGuide: document.querySelector('#finger-guide'),
  resultRank: document.querySelector('#result-rank'),
  resultScore: document.querySelector('#result-score'),
  resultTodayRank: document.querySelector('#result-today-rank'),
  resultCorrect: document.querySelector('#result-correct'),
  resultMiss: document.querySelector('#result-miss'),
  resultAccuracy: document.querySelector('#result-accuracy'),
  resultWpm: document.querySelector('#result-wpm'),
  resultExtraLabel: document.querySelector('#result-extra-label'),
  resultExtraValue: document.querySelector('#result-extra-value'),
  rankingStatusMessage: document.querySelector('#ranking-status-message'),
  rankingCurrentRank: document.querySelector('#ranking-current-rank'),
  rankingCurrentRankScreen: document.querySelector('#ranking-current-rank-screen'),
  rankingTodayRank: document.querySelector('#ranking-today-rank'),
  rankingMonthRank: document.querySelector('#ranking-month-rank'),
  rankingMonthRankScreen: document.querySelector('#ranking-month-rank-screen'),
  rankingTodayTableBody: document.querySelector('#ranking-today-table-body'),
  rankingMonthTableBody: document.querySelector('#ranking-month-table-body'),
  playerNameModal: document.querySelector('#player-name-modal'),
  playerNameInput: document.querySelector('#player-name-input'),
  playerNameError: document.querySelector('#player-name-error'),
  playerNameSubmit: document.querySelector('#player-name-submit'),
  keycaps: Array.from(document.querySelectorAll('.keycap')),
  fingerCards: Array.from(document.querySelectorAll('.finger-shape')),
  actionButtons: Array.from(document.querySelectorAll('[data-action]')),
};

/**
 * 初期化処理を行います。
 *
 * @returns {void}
 */
function init() {
  appState.playerName = loadPlayerName();
  bindEvents();
  syncToggleState();
  render();
}

/**
 * 保存済みの表示名を読み込みます。
 *
 * @returns {string}
 */
function loadPlayerName() {
  const savedPlayerName = localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME_KEY);

  return typeof savedPlayerName === 'string' ? savedPlayerName.trim() : '';
}

/**
 * 表示名を保存します。
 *
 * @param {string} playerName 表示名です。
 * @returns {void}
 */
function savePlayerName(playerName) {
  const normalizedPlayerName = playerName.trim();

  appState.playerName = normalizedPlayerName;
  localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME_KEY, normalizedPlayerName);
}

/**
 * イベントを登録します。
 *
 * @returns {void}
 */
function bindEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleButtonSpaceKeydown, true);
  elements.readyKeyboardToggle?.addEventListener('change', handleReadyKeyboardToggle);
  elements.readyFingerGuideToggle?.addEventListener('change', handleReadyFingerGuideToggle);
  elements.playerNameSubmit?.addEventListener('click', handlePlayerNameSubmit);
  document.addEventListener('keydown', handleKeydown);
}

/**
 * 表示名保存ボタン押下時の処理を行います。
 *
 * @returns {void}
 */
function handlePlayerNameSubmit() {
  const inputValue = elements.playerNameInput?.value.trim() ?? '';

  if (!inputValue) {
    if (elements.playerNameError) {
      elements.playerNameError.textContent = '表示名を入力してください。';
    }

    elements.playerNameInput?.focus();
    return;
  }

  savePlayerName(inputValue);
  closePlayerNameModal();

  if (!appState.pendingRankingSave) {
    return;
  }

  appState.pendingRankingSave = false;
  const { savedEntry } = saveRankingResult();
  render();

  if (elements.rankingStatusMessage) {
    elements.rankingStatusMessage.textContent = savedEntry ? '' : 'ランキング登録には表示名の入力が必要です。';
  }
}

/**
 * 現在表示中の画面で操作可能なボタン一覧を取得します。
 *
 * @returns {HTMLButtonElement[]}
 */
function getCurrentScreenActionButtons() {
  return elements.actionButtons.filter((button) => {
    const screenElement = button.closest('[data-screen]');

    if (!(screenElement instanceof HTMLElement)) {
      return false;
    }

    const isInActiveScreen = screenElement.id === SCREEN_IDS[appState.currentScreen];
    const isVisible = !button.disabled && button.offsetParent !== null;
    return isInActiveScreen && isVisible;
  });
}

/**
 * 現在表示中の画面の選択ボタンを移動します。
 *
 * @param {number} direction 移動方向です。
 * @returns {void}
 */
function moveScreenActionFocus(direction) {
  const currentScreenButtons = getCurrentScreenActionButtons();

  if (currentScreenButtons.length === 0) {
    return;
  }

  const activeElement = document.activeElement;
  const currentIndex = currentScreenButtons.findIndex((button) => button === activeElement);
  const baseIndex = currentIndex >= 0 ? currentIndex : -1;
  const nextIndex = (baseIndex + direction + currentScreenButtons.length) % currentScreenButtons.length;
  currentScreenButtons[nextIndex]?.focus();
}

/**
 * 現在表示中の画面の選択中ボタンを実行します。
 *
 * @returns {void}
 */
function triggerScreenAction() {
  const currentScreenButtons = getCurrentScreenActionButtons();

  if (currentScreenButtons.length === 0) {
    return;
  }

  const activeElement = document.activeElement;
  const currentButton = currentScreenButtons.find((button) => button === activeElement)
    ?? currentScreenButtons[0];
  currentButton?.click();
}

/**
 * クリックイベントを処理します。
 *
 * @param {MouseEvent} event クリックイベントです。
 * @returns {void}
 */
function handleClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const actionButton = target.closest('[data-action]');

  if (!(actionButton instanceof HTMLElement)) {
    return;
  }

  const action = actionButton.dataset.action;

  if (!action) {
    return;
  }

  if (action === 'open-mode-select') {
    showScreen('modeSelect');
    return;
  }

  if (action === 'open-ranking-screen') {
    showScreen('ranking');
    return;
  }

  if (action === 'back-to-result') {
    showScreen('result');
    return;
  }

  if (action === 'back-to-title') {
    appState.selectedMode = null;
    stopTimer();
    resetPlayState();
    appState.isPlaying = false;
    showScreen('title');
    return;
  }

  if (action === 'back-to-mode-select') {
    stopTimer();
    resetPlayState();
    appState.isPlaying = false;
    showScreen('modeSelect');
    return;
  }

  if (action === 'start-game') {
    openReadyScreen(actionButton.dataset.mode);
    return;
  }

  if (action === 'open-play-screen') {
    openPlayScreen();
    return;
  }

  if (action === 'retry-game') {
    if (!appState.selectedMode) {
      showScreen('modeSelect');
      return;
    }

    openPlayScreen();
  }
}

/**
 * ボタンに対するSpaceキーの既定動作を抑止します。
 *
 * @param {KeyboardEvent} event キー入力イベントです。
 * @returns {void}
 */
function handleButtonSpaceKeydown(event) {
  if (event.key !== ' ') {
    return;
  }

  const target = event.target;

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (appState.currentScreen === 'play' && !appState.isPlaying) {
    return;
  }

  event.preventDefault();
}

/**
 * 準備画面の仮想キーボード表示切り替えを処理します。
 *
 * @returns {void}
 */
function handleReadyKeyboardToggle() {
  appState.keyboardVisible = Boolean(elements.readyKeyboardToggle?.checked);
  updateVisibility();
}

/**
 * 準備画面の指ガイド表示切り替えを処理します。
 *
 * @returns {void}
 */
function handleReadyFingerGuideToggle() {
  appState.fingerGuideVisible = Boolean(elements.readyFingerGuideToggle?.checked);
  updateVisibility();
}

/**
 * 準備画面を開きます。
 *
 * @param {string | undefined} modeKey モードキーです。
 * @returns {void}
 */
function openReadyScreen(modeKey) {
  const mode = getModeByKey(modeKey);

  if (!mode) {
    return;
  }

  stopTimer();
  stopCountdown();
  appState.selectedMode = mode;
  appState.isPlaying = false;
  appState.isCountdownRunning = false;
  appState.countdownValue = COUNTDOWN_START;
  syncToggleState();
  showScreen('ready');
}

/**
 * プレイ画面を開きます。
 *
 * @returns {void}
 */
function openPlayScreen() {
  if (!appState.selectedMode) {
    return;
  }

  stopTimer();
  stopCountdown();
  resetPlayState();
  showScreen('play');
}

/**
 * ゲームを開始します。
 *
 * @returns {void}
 */
function startGame() {
  if (!appState.selectedMode) {
    return;
  }

  appState.currentQuestion = getNextQuestion();
  appState.currentRomajiOptions = buildRomajiOptions(appState.currentQuestion.romaji);
  appState.isPlaying = true;
  render();
  startTimer();
}

/**
 * モードキーからモード設定を取得します。
 *
 * @param {string | undefined} modeKey モードキーです。
 * @returns {{ key: string, label: string, timeLimitSeconds: number | null, missionCount: number | null } | null}
 */
function getModeByKey(modeKey) {
  return Object.values(GAME_MODES).find((mode) => mode.key === modeKey) ?? null;
}

/**
 * 次の問題を取得します。
 *
 * @returns {{ id: string, text: string, kana: string, romaji: string }}
 */
function getNextQuestion() {
  if (QUESTIONS.length === 0) {
    return {
      id: 'empty',
      text: '問題がありません',
      kana: 'もんだいがありません',
      romaji: 'monndaigaarimasenn',
    };
  }

  if (QUESTIONS.length === 1) {
    const singleQuestion = QUESTIONS[0];
    appState.previousQuestionId = singleQuestion.id;
    return singleQuestion;
  }

  const availableQuestions = QUESTIONS.filter((question) => question.id !== appState.previousQuestionId);
  const nextIndex = Math.floor(Math.random() * availableQuestions.length);
  const nextQuestion = availableQuestions[nextIndex];

  appState.previousQuestionId = nextQuestion.id;
  return nextQuestion;
}

/**
 * プレイ状態を初期化します。
 *
 * @returns {void}
 */
function resetPlayState() {
  appState.score = 0;
  appState.correctCount = 0;
  appState.missCount = 0;
  appState.totalTypeCount = 0;
  appState.clearedQuestionCount = 0;
  appState.elapsedSeconds = 0;
  appState.currentQuestion = QUESTIONS[0];
  appState.typedText = '';
  appState.resultRank = DEFAULT_RANK;
  appState.isPlaying = false;
  appState.isCountdownRunning = false;
  appState.countdownValue = COUNTDOWN_START;
  appState.currentRomajiOptions = buildRomajiOptions(appState.currentQuestion.romaji);
  clearMissFlash();
  updateRemainingValue();
  render();
}

/**
 * タイマーを開始します。
 *
 * @returns {void}
 */
function startTimer() {
  stopTimer();

  if (!appState.selectedMode) {
    return;
  }

  updateRemainingValue();
  render();
  appState.timerId = window.setInterval(() => {
    updateTimerTick();
  }, 1000);
}

/**
 * タイマーを停止します。
 *
 * @returns {void}
 */
function stopTimer() {
  if (!appState.timerId) {
    return;
  }

  window.clearInterval(appState.timerId);
  appState.timerId = null;
}

/**
 * タイマーの1秒経過ごとの処理を行います。
 *
 * @returns {void}
 */
function updateTimerTick() {
  if (!appState.isPlaying || !appState.selectedMode) {
    stopTimer();
    return;
  }

  appState.elapsedSeconds += 1;
  updateRemainingValue();

  if (shouldFinishTimeAttack()) {
    finishTimeAttack();
    return;
  }

  render();
}

/**
 * タイムアタックを終了すべきか判定します。
 *
 * @returns {boolean}
 */
function shouldFinishTimeAttack() {
  if (!appState.selectedMode?.timeLimitSeconds) {
    return false;
  }

  return appState.remainingValue === 0;
}

/**
 * タイムアタック終了時の処理を行います。
 *
 * @returns {void}
 */
function finishTimeAttack() {
  stopTimer();
  finalizeResult();
  appState.isPlaying = false;
  showScreen('result');
}

/**
 * ミッションモード終了時の処理を行います。
 *
 * @returns {void}
 */
function finishMissionMode() {
  finalizeResult();
  appState.isPlaying = false;
  showScreen('result');
}

/**
 * 残り時間または残り問題数を更新します。
 *
 * @returns {void}
 */
function updateRemainingValue() {
  if (!appState.selectedMode) {
    appState.remainingValue = GAME_MODES.TIME_ATTACK.timeLimitSeconds;
    return;
  }

  if (appState.selectedMode.timeLimitSeconds) {
    appState.remainingValue = Math.max(appState.selectedMode.timeLimitSeconds - appState.elapsedSeconds, 0);
    return;
  }

  if (appState.selectedMode.missionCount) {
    appState.remainingValue = Math.max(appState.selectedMode.missionCount - appState.clearedQuestionCount, 0);
    return;
  }

  appState.remainingValue = 0;
}

/**
 * 画面を切り替えます。
 *
 * @param {'title' | 'modeSelect' | 'play' | 'result'} screenKey 画面キーです。
 * @returns {void}
 */
function showScreen(screenKey) {
  appState.currentScreen = screenKey;
  render();
}

/**
 * カウントダウンを開始します。
 *
 * @returns {void}
 */
function startCountdown() {
  if (appState.isCountdownRunning || !appState.selectedMode) {
    return;
  }

  resetPlayState();
  stopCountdown();
  appState.isCountdownRunning = true;
  appState.countdownValue = COUNTDOWN_START;
  showScreen('play');

  appState.countdownTimerId = window.setInterval(() => {
    appState.countdownValue -= 1;

    if (appState.countdownValue <= 0) {
      stopCountdown();
      startGame();
      return;
    }

    render();
  }, COUNTDOWN_INTERVAL_MS);
}

/**
 * カウントダウンを停止します。
 *
 * @returns {void}
 */
function stopCountdown() {
  if (appState.countdownTimerId) {
    window.clearInterval(appState.countdownTimerId);
  }

  appState.countdownTimerId = null;
  appState.isCountdownRunning = false;
}

/**
 * 表示全体を更新します。
 *
 * @returns {void}
 */
function render() {
  updateScreenVisibility();
  updateStatusArea();
  updateQuestionArea();
  updateReadyArea();
  updateVisibility();
  updateVirtualKeyboard();
  updateFingerGuide();
  updateResultArea();
  updateScreenActionFocus();
}

/**
 * 現在表示中の画面の初期フォーカスを更新します。
 *
 * @returns {void}
 */
function updateScreenActionFocus() {
  const currentScreenButtons = getCurrentScreenActionButtons();

  if (currentScreenButtons.length === 0) {
    return;
  }

  const activeElement = document.activeElement;
  const hasFocusedScreenAction = currentScreenButtons.some((button) => button === activeElement);

  if (!hasFocusedScreenAction) {
    currentScreenButtons[0]?.focus();
  }
}

/**
 * 仮想キーボードの強調表示を更新します。
 *
 * @returns {void}
 */
function updateVirtualKeyboard() {
  const expectedKey = getVirtualKeyboardExpectedKey();

  elements.keycaps.forEach((keycapElement) => {
    const isActive = Boolean(expectedKey) && keycapElement.dataset.key === expectedKey;
    keycapElement.classList.toggle('is-active', isActive);
  });
}

/**
 * 仮想キーボードで強調表示するキーを返します。
 *
 * @returns {string | null}
 */
function getVirtualKeyboardExpectedKey() {
  if (appState.currentScreen === 'play' && !appState.isPlaying) {
    return 'Space';
  }

  return getExpectedKey();
}

/**
 * 指位置ガイドの強調表示を更新します。
 *
 * @returns {void}
 */
function updateFingerGuide() {
  // プレイ開始前とカウントダウン中は指ガイドを強調しません。
  const shouldHighlightFinger = appState.currentScreen === 'play'
    && appState.isPlaying
    && !appState.isCountdownRunning;
  const expectedKey = shouldHighlightFinger ? getExpectedKey() : null;
  const activeFinger = expectedKey ? KEY_TO_FINGER_MAP[expectedKey] ?? null : null;

  elements.fingerCards.forEach((fingerCardElement) => {
    const isActive = Boolean(activeFinger) && fingerCardElement.dataset.finger === activeFinger;
    fingerCardElement.classList.toggle('is-active', isActive);
  });
}

/**
 * 画面表示状態を更新します。
 *
 * @returns {void}
 */
function updateScreenVisibility() {
  elements.screens.forEach((screenElement) => {
    const isActive = screenElement.id === SCREEN_IDS[appState.currentScreen];
    screenElement.classList.toggle('is-active', isActive);
  });
}

/**
 * ステータス表示を更新します。
 *
 * @returns {void}
 */
function updateStatusArea() {
  const mode = appState.selectedMode;
  const remainingLabel = mode?.timeLimitSeconds ? '残り時間' : '残り問題数';

  if (elements.statusMode) {
    elements.statusMode.textContent = mode?.label ?? '未選択';
  }

  if (elements.statusScore) {
    elements.statusScore.textContent = String(appState.score);
  }

  if (elements.statusCorrect) {
    elements.statusCorrect.textContent = String(appState.correctCount);
  }

  if (elements.statusMiss) {
    elements.statusMiss.textContent = String(appState.missCount);
  }

  if (elements.statusRemainingLabel) {
    elements.statusRemainingLabel.textContent = remainingLabel;
  }

  if (elements.statusRemainingValue) {
    elements.statusRemainingValue.textContent = String(appState.remainingValue);
  }
}

/**
 * 出題表示を更新します。
 *
 * @returns {void}
 */
function updateQuestionArea() {
  if (elements.playCountdownDisplay) {
    const shouldShowCountdownDisplay = appState.isCountdownRunning || !appState.isPlaying;
    const countdownText = appState.isCountdownRunning ? String(appState.countdownValue) : READY_FEEDBACK_MESSAGE;
    elements.playCountdownDisplay.textContent = countdownText;
    elements.playCountdownDisplay.classList.toggle('is-hidden', !shouldShowCountdownDisplay);
  }

  if (elements.playQuestionCard) {
    elements.playQuestionCard.classList.toggle('is-hidden', appState.isCountdownRunning || !appState.isPlaying);
  }

  if (appState.isCountdownRunning || !appState.isPlaying) {
    if (!appState.isPlaying) {
      if (elements.questionText) {
        elements.questionText.textContent = '';
      }

      if (elements.questionKana) {
        elements.questionKana.textContent = '';
      }

      if (elements.typedRomaji) {
        elements.typedRomaji.textContent = '';
      }

      if (elements.remainingRomaji) {
        elements.remainingRomaji.textContent = '';
      }

      if (elements.romajiProgressBar) {
        elements.romajiProgressBar.style.width = '0%';
      }
    }

    return;
  }

  const activeRomaji = getActiveRomaji();
  const typedLength = appState.typedText.length;
  const remainingRomaji = activeRomaji.slice(typedLength);
  const progressRate = activeRomaji.length === 0 ? 0 : (typedLength / activeRomaji.length) * 100;

  if (elements.questionText) {
    elements.questionText.textContent = appState.currentQuestion.text;
  }

  if (elements.questionKana) {
    elements.questionKana.textContent = appState.currentQuestion.kana;
  }

  if (elements.typedRomaji) {
    elements.typedRomaji.textContent = appState.typedText;
  }

  if (elements.remainingRomaji) {
    elements.remainingRomaji.textContent = remainingRomaji;
  }

  if (elements.romajiProgressBar) {
    elements.romajiProgressBar.style.width = `${progressRate}%`;
  }

}

/**
 * 表示切り替え対象を更新します。
 *
 * @returns {void}
 */
function updateVisibility() {
  elements.virtualKeyboard?.classList.toggle('is-hidden', !appState.keyboardVisible);
  elements.fingerGuide?.classList.toggle('is-hidden', !appState.fingerGuideVisible);
  document.body.classList.toggle('is-miss-flashing', appState.missFlashActive);
}

/**
 * 準備画面の表示を更新します。
 *
 * @returns {void}
 */
function updateReadyArea() {
  if (elements.readyModeName) {
    elements.readyModeName.textContent = appState.selectedMode?.label ?? '未選択';
  }

  if (elements.readyModeDescription) {
    elements.readyModeDescription.textContent = getReadyModeDescription();
  }

}

/**
 * 準備画面のモード説明を返します。
 *
 * @returns {string}
 */
function getReadyModeDescription() {
  if (appState.selectedMode?.key === GAME_MODES.MISSION.key) {
    return '3問クリアを目指すモードです。';
  }

  if (appState.selectedMode?.key === GAME_MODES.TIME_ATTACK.key) {
    return '30秒でどこまで打てるか挑戦します。';
  }

  return '';
}

/**
 * リザルト表示を更新します。
 *
 * @returns {void}
 */
function updateResultArea() {
  const accuracy = calculateAccuracy(appState.correctCount, appState.totalTypeCount);
  const wpm = calculateWpm(appState.correctCount, appState.elapsedSeconds);
  const extraLabel = appState.selectedMode?.timeLimitSeconds ? '完了問題数' : 'クリア時間';
  const extraValue = appState.selectedMode?.timeLimitSeconds
    ? `${appState.clearedQuestionCount}`
    : `${appState.elapsedSeconds}秒`;

  if (elements.resultRank) {
    elements.resultRank.textContent = appState.resultRank;
  }

  if (elements.resultScore) {
    elements.resultScore.textContent = String(appState.score);
  }

  if (elements.resultCorrect) {
    elements.resultCorrect.textContent = String(appState.correctCount);
  }

  if (elements.resultMiss) {
    elements.resultMiss.textContent = String(appState.missCount);
  }

  if (elements.resultAccuracy) {
    elements.resultAccuracy.textContent = `${accuracy}%`;
  }

  if (elements.resultWpm) {
    elements.resultWpm.textContent = String(wpm);
  }

  if (elements.resultExtraLabel) {
    elements.resultExtraLabel.textContent = extraLabel;
  }

  if (elements.resultExtraValue) {
    elements.resultExtraValue.textContent = extraValue;
  }

  updateRankingArea();
}

/**
 * ランキング領域の表示を更新します。
 *
 * @returns {void}
 */
function updateRankingArea() {
  const rankingEntries = sortRankingEntries(loadRankingEntries());
  const targetEntry = appState.latestRankingEntry;

  if (rankingEntries.length === 0) {
    updateRankingPlaceholder();
    return;
  }

  renderRankingSummary(rankingEntries, targetEntry);
  renderPeriodRankingTables(rankingEntries, targetEntry);

  if (elements.rankingStatusMessage) {
    elements.rankingStatusMessage.textContent = '';
  }
}

/**
 * ランキング領域に仮表示を行います。
 *
 * @returns {void}
 */
function updateRankingPlaceholder() {
  if (elements.rankingStatusMessage) {
    elements.rankingStatusMessage.textContent = '';
  }

  if (elements.rankingCurrentRank) {
    elements.rankingCurrentRank.textContent = '-';
  }

  if (elements.rankingTodayRank) {
    elements.rankingTodayRank.textContent = '-';
  }

  if (elements.rankingMonthRank) {
    elements.rankingMonthRank.textContent = '-';
  }

  renderRankingTable(elements.rankingTodayTableBody, []);
  renderRankingTable(elements.rankingMonthTableBody, []);
}

/**
 * ランキングテーブルを描画します。
 *
 * @param {HTMLTableSectionElement | null} tableBody 描画先のtbodyです。
 * @param {Array<{playerName: string, score: number, rank: string, accuracy: number, wpm: number}>} rankingEntries ランキング一覧です。
 * @returns {void}
 */
function renderRankingTable(tableBody, rankingEntries) {
  if (!tableBody) {
    return;
  }

  if (rankingEntries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="ranking-table__empty">ランキングデータはまだありません。</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = rankingEntries
    .slice(0, 10)
    .map((entry, index) => {
      const displayPlayerName = entry.playerName || 'NO NAME';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${displayPlayerName}</td>
          <td>${entry.score}</td>
          <td>${entry.rank}</td>
          <td>${entry.accuracy}%</td>
          <td>${entry.wpm}</td>
        </tr>
      `;
    })
    .join('');
}

/**
 * 指定期間のトップ10テーブルを描画します。
 *
 * @param {Array<{playerName: string, score: number, rank: string, accuracy: number, wpm: number, recordedAt: string}>} rankingEntries 全ランキング一覧です。
 * @param {{recordedAt: string} | null} targetEntry 対象エントリーです。
 * @returns {void}
 */
function renderPeriodRankingTables(rankingEntries, targetEntry) {
  const todayEntries = filterRankingEntriesByPeriod(rankingEntries, targetEntry, 'day');
  const monthEntries = filterRankingEntriesByPeriod(rankingEntries, targetEntry, 'month');

  renderRankingTable(elements.rankingTodayTableBody, todayEntries);
  renderRankingTable(elements.rankingMonthTableBody, monthEntries);
}

/**
 * ランキング一覧をスコア順に並べ替えます。
 *
 * @param {Array<{score: number, recordedAt: string}>} rankingEntries ランキング一覧です。
 * @returns {Array<{score: number, recordedAt: string}>}
 */
function sortRankingEntries(rankingEntries) {
  return [...rankingEntries].sort((firstEntry, secondEntry) => {
    if (secondEntry.score !== firstEntry.score) {
      return secondEntry.score - firstEntry.score;
    }

    return firstEntry.recordedAt.localeCompare(secondEntry.recordedAt);
  });
}

/**
 * 対象エントリーの順位を計算します。
 *
 * @param {Array<{score: number, recordedAt: string}>} rankingEntries ランキング一覧です。
 * @param {{score: number, recordedAt: string} | null} targetEntry 対象エントリーです。
 * @returns {number | null}
 */
function calculateRankingPosition(rankingEntries, targetEntry) {
  if (!targetEntry) {
    return null;
  }

  const sortedEntries = sortRankingEntries(rankingEntries);
  const matchedIndex = sortedEntries.findIndex((entry) => {
    return entry.score === targetEntry.score && entry.recordedAt === targetEntry.recordedAt;
  });

  return matchedIndex >= 0 ? matchedIndex + 1 : null;
}

/**
 * 順位サマリーを描画します。
 *
 * @param {Array<{score: number, recordedAt: string}>} allRankingEntries 全ランキング一覧です。
 * @param {{score: number, recordedAt: string} | null} targetEntry 対象エントリーです。
 * @returns {void}
 */
function renderRankingSummary(allRankingEntries, targetEntry) {
  const currentRank = calculateRankingPosition(allRankingEntries, targetEntry);
  const todayEntries = filterRankingEntriesByPeriod(allRankingEntries, targetEntry, 'day');
  const monthEntries = filterRankingEntriesByPeriod(allRankingEntries, targetEntry, 'month');
  const todayRank = calculateRankingPosition(todayEntries, targetEntry);
  const monthRank = calculateRankingPosition(monthEntries, targetEntry);

  const formattedCurrentRank = formatRankingPosition(currentRank);
  const formattedTodayRank = formatRankingPosition(todayRank);
  const formattedMonthRank = formatRankingPosition(monthRank);

  if (elements.rankingCurrentRank) {
    elements.rankingCurrentRank.textContent = formattedCurrentRank;
  }

  if (elements.rankingCurrentRankScreen) {
    elements.rankingCurrentRankScreen.textContent = formattedCurrentRank;
  }

  if (elements.rankingTodayRank) {
    elements.rankingTodayRank.textContent = formattedTodayRank;
  }

  if (elements.resultTodayRank) {
    elements.resultTodayRank.textContent = formattedTodayRank;
  }

  if (elements.rankingMonthRank) {
    elements.rankingMonthRank.textContent = formattedMonthRank;
  }

  if (elements.rankingMonthRankScreen) {
    elements.rankingMonthRankScreen.textContent = formattedMonthRank;
  }
}

/**
 * 対象期間のランキング一覧に絞り込みます。
 *
 * @param {Array<{recordedAt: string}>} rankingEntries ランキング一覧です。
 * @param {{recordedAt: string} | null} targetEntry 対象エントリーです。
 * @param {'day' | 'month'} periodType 期間種別です。
 * @returns {Array<{recordedAt: string}>}
 */
function filterRankingEntriesByPeriod(rankingEntries, targetEntry, periodType) {
  if (!targetEntry) {
    return [];
  }

  const targetDate = new Date(targetEntry.recordedAt);

  return rankingEntries.filter((entry) => {
    const entryDate = new Date(entry.recordedAt);

    if (periodType === 'day') {
      return entryDate.toDateString() === targetDate.toDateString();
    }

    return entryDate.getFullYear() === targetDate.getFullYear()
      && entryDate.getMonth() === targetDate.getMonth();
  });
}

/**
 * 順位表示用の文字列へ変換します。
 *
 * @param {number | null} rankingPosition 順位です。
 * @returns {string}
 */
function formatRankingPosition(rankingPosition) {
  return rankingPosition ? `${rankingPosition}位` : '-';
}

/**
 * キー入力を処理します。
 *
 * @param {KeyboardEvent} event キー入力イベントです。
 * @returns {void}
 */
function handleKeydown(event) {
  if (!isPlayerNameModalHidden()) {
    return;
  }

  if (appState.currentScreen !== 'play') {
    handleScreenActionKeydown(event);
    return;
  }

  if (appState.currentScreen === 'play' && !appState.isPlaying) {
    if (event.code === 'Space') {
      event.preventDefault();
      startCountdown();
    }

    return;
  }

  if (!appState.isPlaying || appState.currentScreen !== 'play') {
    return;
  }

  if (IGNORE_KEY_SET.has(event.key)) {
    return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (event.key.length !== 1) {
    return;
  }

  const inputKey = event.key.toLowerCase();
  const expectedKey = getExpectedKey();

  if (!expectedKey) {
    return;
  }

  appState.totalTypeCount += 1;

  if (isCorrectKeyInput(inputKey)) {
    handleCorrectInput(inputKey);
    return;
  }

  handleMissInput(expectedKey);
}

/**
 * 表示名モーダルが閉じているか判定します。
 *
 * @returns {boolean}
 */
function isPlayerNameModalHidden() {
  return !elements.playerNameModal || elements.playerNameModal.classList.contains('is-hidden');
}

/**
 * 表示名モーダルを開きます。
 *
 * @returns {void}
 */
function openPlayerNameModal() {
  if (elements.playerNameError) {
    elements.playerNameError.textContent = '';
  }

  elements.playerNameModal?.classList.remove('is-hidden');
  elements.playerNameInput?.focus();
}

/**
 * 表示名モーダルを閉じます。
 *
 * @returns {void}
 */
function closePlayerNameModal() {
  elements.playerNameModal?.classList.add('is-hidden');
}

/**
 * 正解入力時の処理を行います。
 *
 * @param {string} inputKey 入力されたキーです。
 * @returns {void}
 */
function handleCorrectInput(inputKey) {
  appState.typedText += inputKey;
  appState.correctCount += 1;
  updateRomajiOptions();

  if (isQuestionComplete()) {
    handleQuestionComplete();
    return;
  }

  render();
}

/**
 * ミス入力時の処理を行います。
 *
 * @param {string} expectedKey 正解キーです。
 * @returns {void}
 */
function handleMissInput(expectedKey) {
  appState.missCount += 1;
  triggerMissFlash();
  render();
}

/**
 * 問題クリア時の処理を行います。
 *
 * @returns {void}
 */
function handleQuestionComplete() {
  appState.clearedQuestionCount += 1;
  appState.typedText = '';

  if (shouldFinishMissionMode()) {
    finishMissionMode();
    return;
  }

  updateRemainingValue();
  appState.currentQuestion = getNextQuestion();
  appState.currentRomajiOptions = buildRomajiOptions(appState.currentQuestion.romaji);
  render();
}

/**
 * ミッションモードを終了すべきか判定します。
 *
 * @returns {boolean}
 */
function shouldFinishMissionMode() {
  if (!appState.selectedMode?.missionCount) {
    return false;
  }

  return appState.clearedQuestionCount >= appState.selectedMode.missionCount;
}

/**
 * 正確率を計算します。
 *
 * @param {number} correctCount 正解タイプ数です。
 * @param {number} totalTypeCount 総タイプ数です。
 * @returns {number}
 */
function calculateAccuracy(correctCount, totalTypeCount) {
  if (totalTypeCount === 0) {
    return 0;
  }

  return Math.round((correctCount / totalTypeCount) * 100);
}

/**
 * WPMを計算します。
 *
 * @param {number} correctCount 正解タイプ数です。
 * @param {number} elapsedSeconds 経過秒数です。
 * @returns {number}
 */
function calculateWpm(correctCount, elapsedSeconds) {
  if (elapsedSeconds === 0) {
    return 0;
  }

  return Math.round(correctCount / (elapsedSeconds / SECONDS_PER_MINUTE));
}

/**
 * ランキング保存用のエントリーを生成します。
 *
 * @returns {{playerName: string, score: number, rank: string, accuracy: number, wpm: number, typedCount: number, missCount: number, mode: string, recordedAt: string}}
 */
function createRankingEntry() {
  return {
    playerName: appState.playerName,
    score: appState.score,
    rank: appState.resultRank,
    accuracy: calculateAccuracy(appState.correctCount, appState.totalTypeCount),
    wpm: calculateWpm(appState.correctCount, appState.elapsedSeconds),
    typedCount: appState.correctCount,
    missCount: appState.missCount,
    mode: appState.selectedMode?.key ?? '',
    recordedAt: new Date().toISOString(),
  };
}

/**
 * 保存済みランキング一覧を読み込みます。
 *
 * @returns {Array<{playerName: string, score: number, rank: string, accuracy: number, wpm: number, typedCount: number, missCount: number, mode: string, recordedAt: string}>}
 */
function loadRankingEntries() {
  const savedRankingText = localStorage.getItem(LOCAL_STORAGE_RANKING_KEY);

  if (!savedRankingText) {
    return [];
  }

  try {
    const parsedRankingEntries = JSON.parse(savedRankingText);

    return Array.isArray(parsedRankingEntries) ? parsedRankingEntries : [];
  } catch (error) {
    console.warn('ランキングデータの読み込みに失敗しました。', error);
    return [];
  }
}

/**
 * ランキング一覧を保存します。
 *
 * @param {Array<{playerName: string, score: number, rank: string, accuracy: number, wpm: number, typedCount: number, missCount: number, mode: string, recordedAt: string}>} rankingEntries ランキング一覧です。
 * @returns {void}
 */
function saveRankingEntries(rankingEntries) {
  localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(rankingEntries));
}

/**
 * ランキング結果を保存し、画面表示用データを返します。
 *
 * @returns {{sortedRankingEntries: Array<{playerName: string, score: number, rank: string, accuracy: number, wpm: number, typedCount: number, missCount: number, mode: string, recordedAt: string}>, savedEntry: {playerName: string, score: number, rank: string, accuracy: number, wpm: number, typedCount: number, missCount: number, mode: string, recordedAt: string} | null}}
 */
function saveRankingResult() {
  if (!appState.playerName) {
    appState.pendingRankingSave = true;
    openPlayerNameModal();
    return {
      sortedRankingEntries: sortRankingEntries(loadRankingEntries()),
      savedEntry: null,
    };
  }

  appState.pendingRankingSave = false;

  const rankingEntries = loadRankingEntries();
  const savedEntry = createRankingEntry();
  const nextRankingEntries = sortRankingEntries([...rankingEntries, savedEntry]);

  saveRankingEntries(nextRankingEntries);
  appState.latestRankingEntry = savedEntry;

  return {
    sortedRankingEntries: nextRankingEntries,
    savedEntry,
  };
}

/**
 * リザルト値を確定します。
 *
 * @returns {void}
 */
function finalizeResult() {
  appState.score = calculateScore(appState.correctCount, appState.totalTypeCount, appState.elapsedSeconds);
  appState.resultRank = calculateRank(appState.score);

  const { savedEntry } = saveRankingResult();

  render();

  if (elements.rankingStatusMessage) {
    elements.rankingStatusMessage.textContent = savedEntry ? '' : 'ランキング登録には表示名の入力が必要です。';
  }
}

/**
 * 総合スコアを計算します。
 *
 * @param {number} correctCount 正解タイプ数です。
 * @param {number} totalTypeCount 総タイプ数です。
 * @param {number} elapsedSeconds 経過秒数です。
 * @returns {number}
 */
function calculateScore(correctCount, totalTypeCount, elapsedSeconds) {
  const accuracy = calculateAccuracyRatio(correctCount, totalTypeCount);
  const wpm = calculateWpm(correctCount, elapsedSeconds);

  return Math.round(wpm * accuracy ** 3);
}

/**
 * 正確率を0〜1の比率で計算します。
 *
 * @param {number} correctCount 正解タイプ数です。
 * @param {number} totalTypeCount 総タイプ数です。
 * @returns {number}
 */
function calculateAccuracyRatio(correctCount, totalTypeCount) {
  if (totalTypeCount === 0) {
    return 0;
  }

  return correctCount / totalTypeCount;
}

/**
 * スコアに応じたランクを計算します。
 *
 * @param {number} score 総合スコアです。
 * @returns {string}
 */
function calculateRank(score) {
  const matchedRank = RANK_THRESHOLDS.find((threshold) => score >= threshold.minScore);

  return matchedRank?.rank ?? DEFAULT_RANK;
}

/**
 * 現在有効なローマ字表記を取得します。
 *
 * @returns {string}
 */
function getActiveRomaji() {
  return appState.currentRomajiOptions[0] ?? appState.currentQuestion.romaji;
}

/**
 * 現在位置で期待されるキーを取得します。
 *
 * @returns {string}
 */
function getExpectedKey() {
  return getActiveRomaji().charAt(appState.typedText.length);
}

/**
 * ローマ字入力候補を構築します。
 *
 * @param {string} baseRomaji 基準ローマ字です。
 * @returns {string[]}
 */
function buildRomajiOptions(baseRomaji) {
  const optionSet = new Set([baseRomaji]);

  Object.entries(ROMAJI_VARIANTS).forEach(([source, variants]) => {
    if (!baseRomaji.includes(source)) {
      return;
    }

    const expandedOptions = [];

    optionSet.forEach((currentOption) => {
      variants.forEach((variant) => {
        expandedOptions.push(currentOption.replaceAll(source, variant));
      });
    });

    expandedOptions.forEach((option) => {
      optionSet.add(option);
    });
  });

  expandNNRomajiOptions(optionSet);

  return Array.from(optionSet).sort((left, right) => left.length - right.length);
}

/**
 * 「ん」の `n` / `nn` の両入力を許容する候補を追加します。
 *
 * @param {Set<string>} optionSet ローマ字候補セットです。
 * @returns {void}
 */
function expandNNRomajiOptions(optionSet) {
  const additionalOptions = [];

  optionSet.forEach((option) => {
    additionalOptions.push(...buildNNRomajiOptions(option));
  });

  additionalOptions.forEach((option) => {
    optionSet.add(option);
  });
}

/**
 * 「ん」を `n` / `nn` の両方で入力できる候補を生成します。
 *
 * @param {string} romaji ローマ字候補です。
 * @returns {string[]}
 */
function buildNNRomajiOptions(romaji) {
  const romajiOptions = new Set([romaji]);
  const singleNPattern = /n(?!n)/g;
  const matchResults = Array.from(romaji.matchAll(singleNPattern)).filter((matchResult) => {
    const matchIndex = matchResult.index ?? 0;
    const nextCharacter = romaji.charAt(matchIndex + 1);
    return nextCharacter !== 'n';
  });
  const replaceableCount = matchResults.length;

  if (replaceableCount === 0) {
    return Array.from(romajiOptions);
  }

  const combinationCount = 2 ** replaceableCount;

  for (let bitMask = 1; bitMask < combinationCount; bitMask += 1) {
    let nextOption = '';
    let previousIndex = 0;

    matchResults.forEach((matchResult, index) => {
      const matchIndex = matchResult.index ?? 0;
      const shouldUseDoubleN = (bitMask & (1 << index)) !== 0;
      nextOption += romaji.slice(previousIndex, matchIndex);
      nextOption += shouldUseDoubleN ? SINGLE_N_ROMAJI.repeat(2) : SINGLE_N_ROMAJI;
      previousIndex = matchIndex + 1;
    });

    nextOption += romaji.slice(previousIndex);
    romajiOptions.add(nextOption);
  }

  return Array.from(romajiOptions);
}

/**
 * 現在の入力状況に合うローマ字候補へ絞り込みます。
 *
 * @returns {void}
 */
function updateRomajiOptions() {
  const matchedOptions = appState.currentRomajiOptions.filter((option) => option.startsWith(appState.typedText));

  if (matchedOptions.length === 0) {
    appState.currentRomajiOptions = [appState.currentQuestion.romaji];
    return;
  }

  appState.currentRomajiOptions = matchedOptions.sort((left, right) => left.length - right.length);
}

/**
 * 入力キーが正解候補に一致するか判定します。
 *
 * @param {string} inputKey 入力キーです。
 * @returns {boolean}
 */
function isCorrectKeyInput(inputKey) {
  return appState.currentRomajiOptions.some((option) => option.charAt(appState.typedText.length) === inputKey);
}

/**
 * 問題クリア済みか判定します。
 *
 * @returns {boolean}
 */
function isQuestionComplete() {
  return appState.currentRomajiOptions.some((option) => option === appState.typedText);
}

/**
 * ミス時フラッシュを開始します。
 *
 * @returns {void}
 */
function triggerMissFlash() {
  if (appState.missFlashTimerId) {
    window.clearTimeout(appState.missFlashTimerId);
  }

  appState.missFlashActive = true;
  appState.missFlashTimerId = window.setTimeout(() => {
    clearMissFlash();
    render();
  }, MISS_FLASH_DURATION_MS);
}

/**
 * ミス時フラッシュを解除します。
 *
 * @returns {void}
 */
function clearMissFlash() {
  if (appState.missFlashTimerId) {
    window.clearTimeout(appState.missFlashTimerId);
  }

  appState.missFlashTimerId = null;
  appState.missFlashActive = false;
}

/**
 * トグルの初期状態を同期します。
 *
 * @returns {void}
 */
function syncToggleState() {
  syncReadyToggleState();
}

/**
 * 準備画面のトグル表示を同期します。
 *
 * @returns {void}
 */
function syncReadyToggleState() {
  if (elements.readyKeyboardToggle) {
    elements.readyKeyboardToggle.checked = appState.keyboardVisible;
  }

  if (elements.readyFingerGuideToggle) {
    elements.readyFingerGuideToggle.checked = appState.fingerGuideVisible;
  }
}

/**
 * 画面内ボタンのキー入力を処理します。
 *
 * @param {KeyboardEvent} event キー入力イベントです。
 * @returns {void}
 */
function handleScreenActionKeydown(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveScreenActionFocus(-1);
    return;
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    moveScreenActionFocus(1);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    triggerScreenAction();
  }
}

init();
