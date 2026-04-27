var rows = (cols = 10), cellW = 60, grid = [];
var selected = null, selectedValue, turn = 0, turnValue = -1;
var gameover = false, winner, timer = 30, timerInterval;
var peer, conn;

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-holder');
  
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(j, i));
    }
  }
  initPieces();
  setupMultiplayer();
  setupChat();
}

function initPieces() {
  for (var i = 0; i < cols; i++) {
    if (i % 2 === 1) {
      grid[i + 0 * cols].value = 0;
      grid[i + 2 * cols].value = 0;
      grid[i + 8 * cols].value = 1;
    } else {
      grid[i + 1 * cols].value = 0;
      grid[i + 7 * cols].value = 1;
      grid[i + 9 * cols].value = 1;
    }
  }
}

function setupMultiplayer() {
  peer = new Peer();
  peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
  });

  peer.on('connection', c => {
    conn = c;
    turnValue = 0; // Host is White
    setupConn();
  });

  document.getElementById('connect-btn').onclick = () => {
    let remoteId = document.getElementById('peer-id-input').value;
    conn = peer.connect(remoteId);
    turnValue = 1; // Joiner is Black
    setupConn();
  };
}

function setupConn() {
  document.getElementById('status').innerText = "ချိတ်ဆက်မိပါပြီ!";
  startTimer();
  
  conn.on('data', data => {
    if (data.type === 'move') {
      data.states.forEach((s, i) => {
        grid[i].value = s.v;
        grid[i].king = s.k;
      });
      turn = data.nextTurn;
      resetHighlights();
      startTimer();
      checkWin();
    } else if (data.type === 'chat') {
      displayChat(data.msg, 'peer');
    }
  });
}

function setupChat() {
  let input = document.getElementById('chat-input');
  let btn = document.getElementById('send-msg-btn');
  btn.onclick = () => {
    if (input.value && conn) {
      conn.send({ type: 'chat', msg: input.value });
      displayChat(input.value, 'my');
      input.value = '';
    }
  };
}

function displayChat(msg, type) {
  let box = document.getElementById('chat-messages');
  let p = document.createElement('p');
  p.style.margin = "5px 0";
  p.style.color = (type === 'my') ? "#00fff2" : "#e94560";
  p.innerText = (type === 'my' ? "You: " : "Friend: ") + msg;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 30;
  timerInterval = setInterval(() => {
    timer--;
    document.getElementById('timer-bar').style.width = (timer/30 * 100) + "%";
    document.getElementById('timer-label').innerText = timer + "s";
    if (timer <= 0) {
      if (turn === turnValue) completeTurn();
      clearInterval(timerInterval);
    }
  }, 1000);
}

function mouseClicked() {
  if (turnValue === turn && !gameover && conn && conn.open) {
    for (var i = 0; i < grid.length; i++) {
      if (grid[i].contains(mouseX, mouseY)) {
        if (grid[i].value !== -1) {
          if (grid[i].kill) executeKillMove(i);
          else if (grid[i].value === turn) selectPiece(i);
        } else if (selected && grid[i].highlight) {
          executeNormalMove(i);
        }
      }
    }
  }
}

function selectPiece(i) {
  resetHighlights();
  selected = grid[i];
  selectedValue = selected.value;
  selected.checkMoves();
}

function executeNormalMove(i) {
  grid[i].value = selectedValue;
  grid[i].king = selected.king;
  checkKingStatus(grid[i]);
  selected.value = -1;
  selected.king = false;
  completeTurn();
}

function executeKillMove(i) {
  let s = selected;
  let t = grid[i];
  let targetIdx = index(t.i + (t.i - s.i), t.j + (t.j - s.j));
  let target = grid[targetIdx];

  if (target && target.value === -1) {
    target.value = selectedValue;
    target.king = s.king;
    checkKingStatus(target);

    s.value = -1; s.king = false;
    t.value = -1; t.king = false;

    // ဆင့်စား (Chain Kill) စစ်ဆေးခြင်း
    if (target.canCaptureMore()) {
      resetHighlights();
      selected = target;
      selected.checkMoves(true); // စားလို့ရတာကိုပဲ ပြန်ပြမည်
    } else {
      completeTurn();
    }
  }
}

function completeTurn() {
  turn = (turn === 0) ? 1 : 0;
  resetHighlights();
  let states = grid.map(c => ({ v: c.value, k: c.king }));
  conn.send({ type: 'move', states: states, nextTurn: turn });
  startTimer();
  checkWin();
}

function checkKingStatus(cell) {
  if (cell.value === 0 && cell.j === rows - 1) cell.king = true;
  if (cell.value === 1 && cell.j === 0) cell.king = true;
}

function checkWin() {
  let w = 0, b = 0;
  for (let c of grid) {
    if (c.value === 0) w++;
    if (c.value === 1) b++;
  }
  document.getElementById('white-count').innerText = w;
  document.getElementById('black-count').innerText = b;
  document.getElementById('turn-display').innerText = (turn === turnValue) ? "သင့်အလှည့်" : "တစ်ဖက်လူအလှည့်";

  if (b === 0) { gameover = true; winner = 0; }
  else if (w === 0) { gameover = true; winner = 1; }
}

function resetHighlights() {
  grid.forEach(c => {
    c.highlight = false;
    c.kill = false;
  });
  selected = null;
}

function draw() {
  background(26, 26, 46); // Dark background for Neon
  for (var i = 0; i < grid.length; i++) {
    grid[i].show();
    grid[i].hover = grid[i].contains(mouseX, mouseY);
  }
  if (gameover) {
    fill(0, 255, 242, 200);
    textSize(60);
    textAlign(CENTER, CENTER);
    text(winner === 0 ? "WHITE WON!" : "BLACK WON!", width/2, height/2);
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i >= rows || j >= cols) return -1;
  return i + j * cols;
}
