function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.x = this.i * cellW;
  this.y = this.j * cellW;

  this.hover = false;
  this.highlight = false;
  this.kill = false;
  this.value = -1;
  this.king = false; // King ဖြစ်မဖြစ် မှတ်ရန်

  this.color = "black";
  this.nativeColor;

  // Board အရောင်သတ်မှတ်ခြင်း
  if ((this.i + this.j) % 2 === 0) {
    this.color = "white";
    this.nativeColor = "white";
  } else {
    this.color = "black";
    this.nativeColor = "black";
  }

  this.show = function() {
    if (this.highlight) {
      fill(125, 255, 5); // ရွှေ့လို့ရသည့်နေရာ (အစိမ်း)
    } else if (this.kill) {
      fill(255, 45, 45); // စားလို့ရသည့်နေရာ (အနီ)
    } else {
      if (this.hover) {
        fill(255, 100);
      } else {
        if (this.color === "white") fill(255);
        else if (this.color === "black") fill(0);
        else if (this.color == "gray") fill(51);
      }
    }
    noStroke();
    rect(this.x, this.y, cellW, cellW);

    // ကျားကောင်များ ဆွဲခြင်း
    if (this.value !== -1) {
      if (this.value === 0) {
        fill(255); // အဖြူ
        stroke(0);
      } else {
        fill(0); // အမည်း
        stroke(255);
      }
      ellipseMode(CORNER);
      ellipse(this.x + 6, this.y + 6, cellW - 12);

      // King ဖြစ်ရင် "K" စာသားပြရန်
      if (this.king) {
        fill(255, 215, 0); // ရွှေရောင်
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(24);
        text("K", this.x + cellW / 2, this.y + cellW / 2);
      }
    }
  };

  this.contains = function(x, y) {
    return x > this.x && x < this.x + cellW && y > this.y && y < this.y + cellW;
  };

  this.checkMoves = function() {
    // Player 1 (အမည်း) သို့မဟုတ် King ဖြစ်ရင် အပေါ်တက်ခွင့်ရှိသည်
    if (this.value === 1 || this.king) {
      this.checkDirection(-1, -1); // top-left
      this.checkDirection(1, -1);  // top-right
    }
    // Player 0 (အဖြူ) သို့မဟုတ် King ဖြစ်ရင် အောက်ဆင်းခွင့်ရှိသည်
    if (this.value === 0 || this.king) {
      this.checkDirection(-1, 1);  // bottom-left
      this.checkDirection(1, 1);   // bottom-right
    }
  };

  this.checkDirection = function(di, dj) {
    let target = grid[index(this.i + di, this.j + dj)];
    if (target) {
      if (target.value === -1) {
        target.highlight = true;
      } else if (target.value !== this.value) {
        // တစ်ဖက်လူရှိရင် ကျော်စားလို့ရမလား စစ်မည်
        let jump = grid[index(target.i + di, target.j + dj)];
        if (jump && jump.value === -1) {
          target.kill = true;
        }
      }
    }
  };
}
