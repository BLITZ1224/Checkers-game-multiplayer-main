var rows = (cols = 10);
var cellW = 60;
var grid = [];
var selected, selectedValue;
var whites = blacks = 10;
var turn = 0; 
var turnValue = -1; // -1 ဆိုရင် ဘယ်သူမှ မဟုတ်သေးဘူး
var gameover = false;
var winner;

// Multiplayer Variables
var peer;
var conn;
var myIdDisplay, statusDisplay;

function setup() {
  createCanvas(601, 601);
  background(0);

  // Grid ဆောက်ခြင်း
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(j, i));
    }
  }

  // အကွက်များ နေရာချခြင်း
  for (var i = 0; i < cols; i++) {
     if(i%2 === 1){
       grid[i + 0 * cols].value = 0;
       grid[i + 2 * cols].value = 0;
       grid[i + 8 * cols].value = 1;
     }else{
       grid[i + 1 * cols].value = 0;
       grid[i + 7 * cols].value = 1;
       grid[i + 9 * cols].value = 1;
     }
  }

  // PeerJS Multiplayer Setup
  myIdDisplay = document.getElementById('my-id');
  statusDisplay = document.getElementById('status');
  
  peer = new Peer(); 

  peer.on('open', function(id) {
    if(myIdDisplay) myIdDisplay.innerText = id;
  });

  // တစ်ဖက်လူက လှမ်းချိတ်တာကို လက်ခံခြင်း (သူက Player 2 ဖြစ်သွားမယ်)
  peer.on('connection', function(c) {
    conn = c;
    turnValue = 0; // Host က အဖြူ (Player 1)
    setupConn();
  });

  // Connect ခလုတ်နှိပ်ပြီး လှမ်းချိတ်ခြင်း (ကိုယ်က Player 2 ဖြစ်သွားမယ်)
  var connectBtn = document.getElementById('connect-btn');
  if(connectBtn) {
    connectBtn.onclick = function() {
      var remoteId = document.getElementById('peer-id-input').value;
      conn = peer.connect(remoteId);
      turnValue = 1; // Join တဲ့သူက အမည်း (Player 2)
      setupConn();
    };
  }
}

function setupConn() {
  if(statusDisplay) statusDisplay.innerText = "အခြေအနေ: ချိတ်ဆက်မိပါပြီ! သင်က Player " + (turnValue + 1) + " ပါ။";
  
  conn.on('data', function(data) {
    // တစ်ဖက်လူဆီက Grid Data ရရင် ကိုယ့်ဆီမှာ Update လုပ်မယ်
    for(var i = 0; i < grid.length; i++){
      grid[i].value = data[i].value;
      grid[i].highlight = false;
      grid[i].kill = false;
    }
    turn = (turn === 0) ? 1 : 0; // အလှည့်ပြောင်းမယ်
  });
}

function mouseClicked() {
  if(turnValue === turn){
    if(!gameover && conn && conn.open){
      for (var i = 0; i < grid.length; i++) {
        if (grid[i].contains(mouseX, mouseY)) {
          if (grid[i].value !== -1) {
            if(grid[i].kill){
              executeKillMove(i);
            }else if(grid[i].value === turn){
              selectPiece(i);
            }
          }else if(selected){
            if(grid[i].highlight){
              executeNormalMove(i);
            }
          }
        }
      }
    }
  }
}

// ရိုးရိုးရွှေ့သည့် Logic
function executeNormalMove(i) {
  selected.value = -1;
  selected.color = selected.nativeColor;
  resetHighlights();
  grid[i].value = selectedValue;
  completeTurn();
}

// စားသည့် Logic
function executeKillMove(i) {
  if(grid[i].value === 0) whites--;
  else if(grid[i].value === 1) blacks--;
  
  selected.value = -1;
  selected.color = selected.nativeColor;
  
  var s = selected;
  var t = grid[i];
  var targetIndex;

  if(s.i - t.i === 1 && s.j - t.j === 1) targetIndex = index(t.i - 1, t.j - 1);
  else if(s.i - t.i === -1 && s.j - t.j === 1) targetIndex = index(t.i + 1, t.j - 1);
  else if(s.i - t.i === 1 && s.j - t.j === -1) targetIndex = index(t.i - 1, t.j + 1);
  else if(s.i - t.i === -1 && s.j - t.j === -1) targetIndex = index(t.i + 1, t.j + 1);

  resetHighlights();
  t.value = -1;
  if(targetIndex !== -1) grid[targetIndex].value = selectedValue;
  completeTurn();
}

function selectPiece(i) {
  grid[i].color = "gray";
  selected = grid[i];
  selectedValue = selected.value;
  for (var j = 0; j < grid.length; j++) {
    if (j !== i) grid[j].color = grid[j].nativeColor;
    grid[j].highlight = false;
    grid[j].kill = false;
  }
  grid[i].checkMoves();
}

function resetHighlights() {
  for (var j = 0; j < grid.length; j++) {
    grid[j].highlight = false;
    grid[j].kill = false;
  }
}

function completeTurn() {
  turn = (turn === 0) ? 1 : 0;
  // တစ်ဖက်လူဆီသို့ Grid data ပို့ခြင်း
  conn.send(grid); 
  checkWin();
}

function checkWin() {
  if(blacks === 0) { gameover = true; winner = 0; }
  else if(whites === 0) { gameover = true; winner = 1; }
}

function draw() {
  background(0);
  if(!conn || !conn.open){
      fill(255);
      textSize(30);
      textAlign(CENTER);
      text("Waiting for connection...", width/2, height/2);
  } else {
      for (var i = 0; i < grid.length; i++) {
        grid[i].show();
        grid[i].hover = grid[i].contains(mouseX, mouseY);
      }
      if(gameover){
        fill(0, 0, 255, 200);
        textSize(80);
        textAlign(CENTER);
        text(winner === 0 ? "White Won!" : "Black Won!", width/2, height/2);
      }
  }
}

function index(i, j){
  if(i < 0 || j < 0 || i > rows-1 || j > cols-1) return -1;
  return i + j * cols;
}
