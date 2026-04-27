var rows = (cols = 10);
var cellW = 60;
var grid = [];
var selected, selectedValue;
var whites = 10, blacks = 10;
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

  // တစ်ဖက်လူက လှမ်းချိတ်တာကို လက်ခံခြင်း (Host)
  peer.on('connection', function(c) {
    conn = c;
    turnValue = 0; // Host က အဖြူ
    setupConn();
  });

  // Join တဲ့သူ (Client)
  var connectBtn = document.getElementById('connect-btn');
  if(connectBtn) {
    connectBtn.onclick = function() {
      var remoteId = document.getElementById('peer-id-input').value;
      conn = peer.connect(remoteId);
      turnValue = 1; // Join တဲ့သူက အမည်း
      setupConn();
    };
  }
}

function setupConn() {
  if(statusDisplay) statusDisplay.innerText = "အခြေအနေ: ချိတ်ဆက်မိပါပြီ! သင်က Player " + (turnValue + 1) + " ပါ။";
  
  conn.on('data', function(data) {
    // တစ်ဖက်လူဆီက ရလာတဲ့ values တွေကိုပဲ ကိုယ့် grid ထဲ ပြန်ထည့်မယ်
    if (data.gridValues) {
      for(var i = 0; i < grid.length; i++){
        grid[i].value = data.gridValues[i];
        grid[i].highlight = false;
        grid[i].kill = false;
        grid[i].color = grid[i].nativeColor;
      }
      turn = data.nextTurn; // တစ်ဖက်လူ ပို့လိုက်တဲ့ အလှည့်အတိုင်း ပြောင်းမယ်
      checkWin();
    }
  });
}

function mouseClicked() {
  // ကိုယ့်အလှည့်ဖြစ်မှ နှိပ်လို့ရမယ်
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

function executeNormalMove(i) {
  selected.value = -1;
  selected.color = selected.nativeColor;
  resetHighlights();
  grid[i].value = selectedValue;
  completeTurn();
}

function executeKillMove(i) {
  var s = selected;
  var t = grid[i];
  var targetIndex = -1;

  // စားမယ့်အကွက်ကို တွက်ချက်ခြင်း
  if(s.i - t.i === 1 && s.j - t.j === 1) targetIndex = index(t.i - 1, t.j - 1);
  else if(s.i - t.i === -1 && s.j - t.j === 1) targetIndex = index(t.i + 1, t.j - 1);
  else if(s.i - t.i === 1 && s.j - t.j === -1) targetIndex = index(t.i - 1, t.j + 1);
  else if(s.i - t.i === -1 && s.j - t.j === -1) targetIndex = index(t.i + 1, t.j + 1);

  if(targetIndex !== -1 && grid[targetIndex].value === -1) {
    if(grid[i].value === 0) whites--;
    else if(grid[i].value === 1) blacks--;
    
    selected.value = -1;
    selected.color = selected.nativeColor;
    t.value = -1;
    grid[targetIndex].value = selectedValue;
    resetHighlights();
    completeTurn();
  }
}

function selectPiece(i) {
  resetHighlights();
  grid[i].color = "gray";
  selected = grid[i];
  selectedValue = selected.value;
  grid[i].checkMoves();
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
  
  // Grid တစ်ခုလုံး မပို့ဘဲ value တွေကိုပဲ array တစ်ခုထဲ ထုတ်ယူမယ်
  var valuesOnly = grid.map(cell => cell.value);
  
  // လိုအပ်တဲ့ data တွေကိုပဲ ပို့မယ်
  conn.send({
    gridValues: valuesOnly,
    nextTurn: turn
  });
  
  checkWin();
}

function checkWin() {
  // ကျားကောင်ရေကို grid ထဲကနေ တိုက်ရိုက်ပြန်စစ်တာ ပိုတိကျပါတယ်
  let wCount = 0, bCount = 0;
  for(let cell of grid) {
    if(cell.value === 0) wCount++;
    if(cell.value === 1) bCount++;
  }
  whites = wCount;
  blacks = bCount;

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
