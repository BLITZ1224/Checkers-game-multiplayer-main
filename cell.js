function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.x = this.i * cellW;
  this.y = this.j * cellW;

  this.hover = false;
  this.highlight = false;
  this.kill = false;
  this.value = -1;
  this.king = false;

  this.color = (this.i + this.j) % 2 === 0 ? "white" : "black";
  this.nativeColor = this.color;

  this.show = function() {
    // နေရာလွတ်နှင့် Highlight ပြကွက်များ
    if (this.highlight) {
      fill(0, 255, 242, 180); // ရွှေ့လို့ရသောနေရာ (Neon Cyan)
    } else if (this.kill) {
      fill(255, 46, 99, 180);  // စားလို့ရသောနေရာ (Neon Pink/Red)
    } else {
      if (this.color === "white") fill(30, 40, 50); 
      else fill(15, 25, 35);
    }
    
    if (this.hover) {
      strokeWeight(2);
      stroke(0, 255, 242);
    } else {
      noStroke();
    }
    rect(this.x, this.y, cellW, cellW);

    // ကျားကောင်များ ဆွဲခြင်း (Neon Glow Effect)
    if (this.value !== -1) {
      push();
      if (this.value === 0) {
        fill(255); // အဖြူ
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = "white";
      } else {
        fill(233, 69, 96); // အမည်း/အနီ (Neon Red)
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = "#e94560";
      }
      noStroke();
      ellipseMode(CENTER);
      ellipse(this.x + cellW/2, this.y + cellW/2, cellW * 0.75);
      pop();

      // King ဖြစ်လျှင် သရဖူပြရန်
      if (this.king) {
        fill(255, 215, 0);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("👑", this.x + cellW/2, this.y + cellW/2);
      }
    }
  };

  this.contains = function(x, y) {
    return x > this.x && x < this.x + cellW && y > this.y && y < this.y + cellW;
  };

  this.checkMoves = function(onlyKills = false) {
    // Player 1 သို့မဟုတ် King ဖြစ်လျှင် အပေါ်တက်၍ စစ်ဆေးမည်
    if (this.value === 1 || this.king) {
      this.checkDirection(-1, -1, onlyKills);
      this.checkDirection(1, -1, onlyKills);
    }
    // Player 0 သို့မဟုတ် King ဖြစ်လျှင် အောက်ဆင်း၍ စစ်ဆေးမည်
    if (this.value === 0 || this.king) {
      this.checkDirection(-1, 1, onlyKills);
      this.checkDirection(1, 1, onlyKills);
    }
  };

  this.checkDirection = function(di, dj, onlyKills) {
    let target = grid[index(this.i + di, this.j + dj)];
    if (target) {
      if (target.value === -1 && !onlyKills) {
        target.highlight = true;
      } else if (target.value !== -1 && target.value !== this.value) {
        // စားလို့ရမရ ထပ်စစ်သည်
        let jump = grid[index(target.i + di, target.j + dj)];
        if (jump && jump.value === -1) {
          target.kill = true;
        }
      }
    }
  };

  // ဆင့်စားရန် အကွက်ရှိမရှိ စစ်ဆေးခြင်း (Chain Kill Logic)
  this.canCaptureMore = function() {
    let directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    for (let d of directions) {
      let di = d[0];
      let dj = d[1];
      
      // ရိုးရိုးအကွက်ဆိုလျှင် ရှေ့ဘက်ကိုပဲ စစ်မည်
      if (!this.king) {
        if (this.value === 0 && dj === -1) continue;
        if (this.value === 1 && dj === 1) continue;
      }

      let target = grid[index(this.i + di, this.j + dj)];
      if (target && target.value !== -1 && target.value !== this.value) {
        let jump = grid[index(target.i + di, target.j + dj)];
        if (jump && jump.value === -1) return true;
      }
    }
    return false;
  };
}
