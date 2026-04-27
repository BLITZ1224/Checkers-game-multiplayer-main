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