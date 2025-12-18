// app.js
const datePicker = document.getElementById('datePicker'); // 날짜 선택 입력
const clearDayBtn = document.getElementById('clearDay'); // 해당 날짜 초기화
const clearAllBtn = document.getElementById('clearAll'); // 전체 초기화
const countInfo = document.getElementById('countInfo'); // 기록 개수 표시 요소
const recordList = document.getElementById('recordList'); // 기록 리스트를 렌더할 요소

const newMedInput = document.getElementById('newMedInput'); // 슬롯 추가용 입력
const addMedBtn = document.getElementById('addMedBtn'); // 슬롯 추가 버튼
const medSlotsList = document.getElementById('medSlotsList'); // 슬롯 목록

// med slots local key
const MED_SLOTS_KEY = 'med-slots';

// track last consumed action so render can apply animation class
let lastConsumedAction = null; // { key: '약이름', action: 'inc'|'dec' }
let lastConsumedRenderDate = null;

function loadMedSlots() {
  // 로컬스토리지에서 약 슬롯 배열을 읽어오기
  try {
    const raw = localStorage.getItem(MED_SLOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('failed to load med slots', e);
    return [];
  }
}

function saveMedSlots(arr) {
  // 약 슬롯 배열을 저장.
  localStorage.setItem(MED_SLOTS_KEY, JSON.stringify(arr));
}

function renderMedSlots() {
  // 슬롯 렌더
  const slots = loadMedSlots();
  medSlotsList.innerHTML = '';
  slots.forEach(s => {
    const li = document.createElement('li');
    li.className = 'med-slot-item';
    // 슬롯 텍스트 설정
    const label = document.createElement('span');
    label.textContent = s;
    li.appendChild(label);

    // 슬롯 클릭 시 즉시 해당 약 이름으로 복용 기록을 추가합니다.
    li.addEventListener('click', () => {
      const dateStr = ensureDateSelected();
      const records = loadRecords(dateStr);
      const iso = new Date().toISOString();
      const id = `r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      records.push({ id, iso, note: s });
      saveRecords(dateStr, records);
      render(dateStr);
    });

    // 슬롯 삭제 버튼 (슬롯 자체 삭제, 클릭 이벤트 버블링 방지)
    const del = document.createElement('button');
    del.className = 'del-slot';
    del.textContent = '×';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      const all = loadMedSlots().filter(x => x !== s);
      saveMedSlots(all);
      renderMedSlots();
    });

    li.appendChild(del);
    medSlotsList.appendChild(li);
  });
}

addMedBtn.addEventListener('click', () => {
  // 새 슬롯을 추가합니다 (중복 방지)
  const v = newMedInput.value.trim();
  if (!v) return;
  const slots = loadMedSlots();
  if (!slots.includes(v)) {
    slots.push(v);
    saveMedSlots(slots);
    renderMedSlots();
  }
  newMedInput.value = '';
});

// 초기 med slots 렌더
renderMedSlots();

// 키: YYYY-MM-DD -> value: array of ISO timestamps
// 날짜별 저장 키 생성 함수 (형식: med-records:YYYY-MM-DD)
function storageKeyFor(dateStr) {
  return `med-records:${dateStr}`;
}

function loadRecords(dateStr) {
  // 해당 날짜의 기록 배열을 로드 이전 형식(문자열 배열)도 변환 처리함
  const raw = localStorage.getItem(storageKeyFor(dateStr));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // 이전 버전은 단순 ISO 문자열 배열을 사용했을 수 있음
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      return parsed.map(iso => ({ id: `i_${iso}_${Math.random().toString(36).slice(2,6)}`, iso, note: '' }));
    }
    return parsed;
  } catch (e) {
    console.error('parsing records failed', e);
    return [];
  }
}

function saveRecords(dateStr, arr) {
  // 해당 날짜의 기록 배열을 로컬스토리지에 저장
  localStorage.setItem(storageKeyFor(dateStr), JSON.stringify(arr));
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString();
}

function render(dateStr) {
  // 선택된 날짜의 기록을 화면에 렌더합니다.
  const records = loadRecords(dateStr);
  countInfo.textContent = `선택된 날짜의 기록: ${records.length}회`;

  // render aggregated consumed summary (약 이름 × N)
  renderConsumed(dateStr);

  // 리스트 초기화
  recordList.innerHTML = '';
  if (records.length === 0) return;

  // 최신 항목을 위에 표시
  records.slice().reverse().forEach((rec, idx) => {
    const li = document.createElement('li');
    li.className = 'record-item';

    // 주요 정보: 약 이름 또는 기본 라벨
    const primary = document.createElement('div');
    primary.className = 'record-primary';
    primary.textContent = rec.note || '복용 기록';

    // 보조 정보: 시간 및 상세
    const meta = document.createElement('div');
    meta.className = 'record-meta';
    const stamp = new Date(rec.iso);
    meta.textContent = formatTime(rec.iso);
    meta.title = stamp.toLocaleString();

    // 우측 메타 영역(삭제 버튼)
    const metaRight = document.createElement('div');
    metaRight.className = 'meta-right';
    metaRight.appendChild(meta);

    // 개별 삭제 버튼
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '삭제';
    del.addEventListener('click', () => {
      // id로 해당 레코드만 제거
      const all = loadRecords(dateStr).filter(r => r.id !== rec.id);
      saveRecords(dateStr, all);
      render(dateStr);
    });

    metaRight.appendChild(del);

    li.appendChild(primary);
    li.appendChild(metaRight);
    recordList.appendChild(li);
  });
}

function createConsumedItemElement(name, dateStr) {
  const li = document.createElement('li');
  li.className = 'consumed-item';
  li.dataset.key = name;

  const label = document.createElement('span');
  label.className = 'consumed-name';
  label.textContent = name;

  const badge = document.createElement('span');
  badge.className = 'count';
  badge.textContent = '×0';

  const incBtn = document.createElement('button');
  incBtn.className = 'consumed-inc';
  incBtn.textContent = '+';
  incBtn.title = '하나 추가';
  incBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const all = loadRecords(dateStr);
    const iso = new Date().toISOString();
    const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    all.push({ id, iso, note: name });
    saveRecords(dateStr, all);
    lastConsumedAction = { key: name, action: 'inc' };
    render(dateStr);
  });
  incBtn.addEventListener('pointerenter', () => li.classList.add('hovered-by-btn'));
  incBtn.addEventListener('pointerleave', () => li.classList.remove('hovered-by-btn'));

  const decBtn = document.createElement('button');
  decBtn.className = 'consumed-del';
  decBtn.textContent = '−';
  decBtn.title = '하나 제거';
  decBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const all = loadRecords(dateStr);
    for (let i = all.length - 1; i >= 0; i--) {
      if ((all[i].note || '') === name) {
        all.splice(i, 1);
        break;
      }
    }
    saveRecords(dateStr, all);
    lastConsumedAction = { key: name, action: 'dec' };
    render(dateStr);
  });
  decBtn.addEventListener('pointerenter', () => li.classList.add('hovered-by-btn'));
  decBtn.addEventListener('pointerleave', () => li.classList.remove('hovered-by-btn'));

  li.appendChild(label);
  li.appendChild(badge);
  li.appendChild(incBtn);
  li.appendChild(decBtn);

  li.addEventListener('animationend', (e) => {
    if (e.animationName === 'consumedEnter') {
      li.classList.remove('consumed-item--enter');
    }
  });

  return li;
}

function updateConsumedItemContent(li, name, count) {
  li.dataset.key = name;
  const label = li.querySelector('.consumed-name');
  if (label) label.textContent = name;
  const badge = li.querySelector('.count');
  if (badge) badge.textContent = `×${count}`;
  return badge;
}

function renderConsumed(dateStr) {
  const consumedListEl = document.getElementById('consumedList');
  if (!consumedListEl) return;

  if (lastConsumedRenderDate !== dateStr) {
    consumedListEl.innerHTML = '';
    lastConsumedRenderDate = dateStr;
  }

  const records = loadRecords(dateStr);
  if (records.length === 0) {
    consumedListEl.innerHTML = '';
    lastConsumedAction = null;
    return;
  }

  // 집계: note -> count + 첫 등장 인덱스(처음 눌렀던 순)를 기록
  const counts = {};
  const firstIndex = {};
  records.forEach((r, idx) => {
    const key = r.note || '복용 기록';
    counts[key] = (counts[key] || 0) + 1;
    if (firstIndex[key] === undefined) firstIndex[key] = idx;
  });

  // 정렬: 처음 눌렀던 순 (첫 등장 인덱스 오름차순)
  const keys = Object.keys(counts).sort((a, b) => firstIndex[a] - firstIndex[b]);

  const existingMap = new Map();
  Array.from(consumedListEl.querySelectorAll('.consumed-item')).forEach((li) => {
    existingMap.set(li.dataset.key, li);
  });

  keys.forEach((k) => {
    const count = counts[k];
    let li = existingMap.get(k);
    if (li) {
      existingMap.delete(k);
      li.classList.remove('hovered-by-btn');
    } else {
      li = createConsumedItemElement(k, dateStr);
      li.classList.add('consumed-item--enter');
    }

    const badge = updateConsumedItemContent(li, k, count);
    if (badge) {
      badge.classList.remove('count--inc', 'count--dec');
      if (lastConsumedAction && lastConsumedAction.key === k) {
        if (lastConsumedAction.action === 'inc') badge.classList.add('count--inc');
        if (lastConsumedAction.action === 'dec') badge.classList.add('count--dec');
        badge.addEventListener('animationend', () => {
          badge.classList.remove('count--inc', 'count--dec');
        }, { once: true });
        lastConsumedAction = null;
      }
    }

    consumedListEl.appendChild(li);
  });

  if (lastConsumedAction && !counts[lastConsumedAction.key]) {
    lastConsumedAction = null;
  }

  existingMap.forEach((li) => {
    li.classList.remove('hovered-by-btn');
    li.remove();
  });
}

function ensureDateSelected() {
  if (!datePicker.value) {
    // default to today
    const today = new Date();
    datePicker.value = today.toISOString().slice(0, 10);
  }
  return datePicker.value;
}

// 이벤트 핸들러
datePicker.addEventListener('change', () => {
  const dateStr = ensureDateSelected();
  render(dateStr);
});

clearDayBtn.addEventListener('click', () => {
  const dateStr = ensureDateSelected();
  if (confirm(`${dateStr}의 기록을 제거하시겠습니까?`)) {
    localStorage.removeItem(storageKeyFor(dateStr));
    render(dateStr);
  }
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('모든 기록을 초기화합니다. 진행할까요?')) return;
  // remove all keys that start with med-records:
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('med-records:')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  render(ensureDateSelected());
});

// 초기화: 페이지 로드 시 오늘 날짜 선택 및 렌더
(function init() {
  ensureDateSelected();
  render(datePicker.value);
})();