var rows = (cols = 10);
var cellW = 60;
var grid = [];
var selected, selectedValue;
var whites = 10, blacks = 10;
var turn = 0; 
var turnValue = -1;
var gameover = false;
var winner;

var peer;
var conn;
var myIdDisplay, statusDisplay;

function setup() {
  createCanvas(601, 601);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(j, i));
    }
  }

  // အကွက်များ နေရာချခြင်း
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

  myIdDisplay = document.getElementById('my-id');
  statusDisplay = document.getElementById('status');
  peer = new Peer();

  peer.on('open', function(id) {
    if (myIdDisplay) myIdDisplay.innerText = id;
  });

  peer.on('connection', function(c) {
    conn = c;
    turnValue = 0;
    setupConn();
  });

  var connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.onclick = function() {
      var remoteId = document.getElementById('peer-id-input').value;
      conn = peer.connect(remoteId);
      turnValue = 1;
      setupConn();
    };
  }
}

function setupConn() {
  if (statusDisplay) statusDisplay.innerText = "ချိတ်ဆက်မိပါပြီ! သင်က Player " + (turnValue + 1) + " ပါ။";
  conn.on('data', function(data) {
    if (data.gridStates) {
      for (var i = 0; i < grid.length; i++) {
        grid[i].value = data.gridStates[i].v;
        grid[i].king = data.gridStates[i].k;
        grid[i].highlight = false;
        grid[i].kill = false;
      }
      turn = data.nextTurn;
      checkWin();
    }
  });
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
  grid[i].color = "gray";
  selected = grid[i];
  selectedValue = selected.value;
  grid[i].checkMoves();
}

function executeNormalMove(i) {
  grid[i].value = selectedValue;
  grid[i].king = selected.king; // King status ကို လက်ဆင့်ကမ်းသည်
  checkKingStatus(grid[i]);

  selected.value = -1;
  selected.king = false;
  resetHighlights();
  completeTurn();
}

function executeKillMove(i) {
  var s = selected;
  var t = grid[i];
  var di = t.i - s.i;
  var dj = t.j - s.j;
  var target = grid[index(t.i + di, t.j + dj)];

  if (target && target.value === -1) {
    target.value = selectedValue;
    target.king = s.king;
    checkKingStatus(target);

    s.value = -1; s.king = false;
    t.value = -1; t.king = false;
    resetHighlights();
    completeTurn();
  }
}

function checkKingStatus(cell) {
  if (cell.value === 0 && cell.j === rows - 1) cell.king = true; // အဖြူ အောက်ဆုံးရောက်ရင်
  if (cell.value === 1 && cell.j === 0) cell.king = true;    // အမည်း အပေါ်ဆုံးရောက်ရင်
}

function resetHighlights() {
  for (var j = 0; j < grid.length; j++) {
    grid[j].color = grid[j].nativeColor;
    grid[j].highlight = false;
    grid[j].kill = false;
  }
}

function completeTurn() {
  turn = (turn === 0) ? 1 : 0;
  var states = grid.map(c => ({ v: c.value, k: c.king }));
  conn.send({ gridStates: states, nextTurn: turn });
  checkWin();
}

function checkWin() {
  let w = 0, b = 0;
  for (let c of grid) {
    if (c.value === 0) w++;
    if (c.value === 1) b++;
  }
  whites = w; blacks = b;
  if (blacks === 0) { gameover = true; winner = 0; }
  else if (whites === 0) { gameover = true; winner = 1; }
}

function draw() {
  background(0);
  if (!conn || !conn.open) {
    fill(255); textSize(30); textAlign(CENTER);
    text("Waiting for connection...", width / 2, height / 2);
  } else {
    for (var i = 0; i < grid.length; i++) {
      grid[i].show();
      grid[i].hover = grid[i].contains(mouseX, mouseY);
    }
    if (gameover) {
      fill(0, 0, 255, 200); textSize(80); textAlign(CENTER);
      text(winner === 0 ? "White Won!" : "Black Won!", width / 2, height / 2);
    }
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i >= rows || j >= cols) return -1;
  return i + j * cols;
}
