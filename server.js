//SERVER SETUP/////////////////
var express = require('express');

var app = express();
var server = app.listen(1000);

app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

console.log('Server running...');
//////////////////////////////

//GAME VARIABLES
var grid = [];

var rows = (cols = 10);
var cellW = 60;

var turn = 0, turnValue;
var p1, p2;
var p1assigned = false, p2assigned = false;

//SETTING UP GRID
for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(j, i));
    }
}

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

io.sockets.on('connection', newConnection);

function newConnection(socket){
	console.log('[SERVER] >> New connection at ' + socket.id);
	if(!p1assigned){
		p1 = socket.id;
		p1assigned = true;
		var data = {
			turnValue: 0,
			turn: turn,
		}
		socket.emit('init', data);
	}else if(!p2assigned){
		p2 = socket.id;
		p2assigned = true;
		var data = {
			turnValue: 1,
			turn: turn
		}
		socket.emit('init', data);
	}

	socket.on('move', function(data){
		for(var i = 0; i < grid.length; i++){
			grid[i].highlight = data[i].highlight;
			grid[i].kill = data[i].kill;
			grid[i].value = data[i].value;
		}
		turn = (turn === 0)?1:0;
		socket.broadcast.emit('move', data);
	});
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.x = this.i * cellW;
  this.y = this.j * cellW;

  this.hover = false;
  this.highlight = false;
  this.kill = false;
  this.value = -1;

  this.color = "black";
  this.nativeColor;

  if (this.j % 2 === 0) {
    if (this.i % 2 === 0) {
      this.color = "white";
      this.nativeColor = "white";
    } else {
      this.color = "black";
      this.nativeColor = "black";
    }
  } else {
    if (this.i % 2 === 0) {
      this.color = "black";
      this.nativeColor = "black";
    } else {
      this.color = "white";
      this.nativeColor = "white";
    }
  }

  this.show = function() {
    if(this.highlight){
      fill(125, 255, 5);
    }else if(this.kill){
      fill(255, 45, 45);
    }else{
      if (this.hover) {
       fill(255, 100);
      } else {
        if (this.color === "white") {
          fill(255);
        } else if (this.color === "black") {
          fill(0);
        } else if (this.color == "gray") {
          fill(51);
        }
      }
    }
    noStroke();
    rect(this.x, this.y, cellW, cellW);
    if (this.value === 0) {
      fill(255);
      stroke(0);
      ellipseMode(CORNER);
      ellipse(this.x + 3, this.y + 3, cellW * 0.9);
    } else if (this.value === 1) {
      fill(0);
      stroke(255);
      ellipseMode(CORNER);
      ellipse(this.x + 3, this.y + 3, cellW * 0.9);
    }
  };

  this.contains = function(x, y) {
    return this.x < x && this.x + cellW > x && this.y < y && this.y + cellW > y;
  };

  this.checkMoves = function(){
    var topleft = grid[index(this.i-1, this.j-1)];
    var topright = grid[index(this.i+1, this.j-1)];
    var bottomleft = grid[index(this.i-1, this.j+1)];
    var bottomright = grid[index(this.i+1, this.j+1)];

    if(topleft){
      if(topleft.value === -1){
        topleft.highlight = true;
      }else if(topleft.value === this.value){
        //nothing
      }else{
        var checkIndex = index(topleft.i - 1, topleft.j - 1);
        if(checkIndex > -1){
          if(grid[checkIndex].value === -1){
            topleft.kill = true;
          }
        }
      }
    }
    if(topright){
      if(topright.value === -1){
        topright.highlight = true;
      }else if(topright.value === this.value){
        //nothing
      }else{
        var checkIndex = index(topright.i + 1, topright.j - 1);
        if(checkIndex > -1){
          if(grid[checkIndex].value === -1){
            topright.kill = true;
          }
        }
      }
    }
    if(bottomleft){
      if(bottomleft.value === -1){
        bottomleft.highlight = true;
      }else if(bottomleft.value === this.value){
        //nothing
      }else{
        var checkIndex = index(bottomleft.i - 1, bottomleft.j + 1);
        if(checkIndex > -1){
          if(grid[checkIndex].value === -1){
            bottomleft.kill = true;
          }
        }
      }
    }
    if(bottomright){
      if(bottomright.value === -1){
         bottomright.highlight = true;
      }else if(bottomright.value === this.value){
        //nothing
      }else{
        var checkIndex = index(bottomright.i + 1, bottomright.j + 1);
        if(checkIndex > -1){
          if(grid[checkIndex].value === -1){
            bottomright.kill = true;
          }
        }
      }
    }
  }
}
