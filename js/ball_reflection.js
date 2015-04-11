var canvas,
  context,

  W = 640,
  H = 500,
  DAMPING_PARAM_BALL = 0.9,
  DAMPING_PARAM_WALL = 0.8,
  FPS = 1000 / 100,
  REFLECT_LIMIT_COUNT = 100,
  balls = [],
  gravityX  = 0.0,
  gravityY  = 0.1,

  COLORS = [
    'rgb(0,0,0)',
    'rgb(128,128,128)',
    'rgb(0,0, 255)',
    'rgb(0,0, 128)',
    'rgb(0,128, 128)',
    'rgb(0,128,0)',
    'rgb(0,255,0)',
    'rgb(0,255,255)',
    'rgb(255,255,0)',
    'rgb(255,0,0)',
    'rgb(255,0,255)',
    'rgb(128,128,0)',
    'rgb(128,0,128)',
    'rgb(128,0,0)'
  ];

  audio = new Audio('sound/reflection.mp3'),
  sound = false;

// Ball class
var Ball = function(x, y, r, leftVelFlg, color) {
  this.x = x,
  this.y = y;
  this.r = r;
  this.vx = leftVelFlg ? 4 : -4,
  this.vy = 3;
  this.cnt = REFLECT_LIMIT_COUNT; // reflect limit count
  this.color = color;
}

Ball.prototype.update = function () {
  this.vx += gravityX; // gravity acceleration
  this.vy += gravityY; // gravity acceleration
  this.x += this.vx;
  this.y += this.vy;
};

Ball.prototype.drawCircle = function () {
  if(!canvas || !canvas.getContext) {
    return false;
  }
  context.beginPath();
  context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  context.fillStyle = this.color;
  context.fill();
};

Ball.prototype.refrectWall = function () {

  if(this.x - this.r < 0 || W < this.x + this.r) {
    this.vx *= -DAMPING_PARAM_WALL;
    if(this.x - this.r <= 0){
      this.x = this.r;
    }
    if(W <= this.x + this.r) {
      this.x = W - (this.r);
    }
    if(Math.abs(this.vx) > 0.5) {
      this.reflectSound();
    }
    if (Math.abs(this.vx) > 0.1) {
      return 'x';
    }
  }
  if(this.y - this.r < 0 || H < this.y + this.r) {
    this.vy *= -DAMPING_PARAM_WALL;
    if(this.y - this.r <= 0){
      this.y = this.r;
    }
    if(H <= this.y + this.r) {
      this.y = H - (this.r);
    }
    if(Math.abs(this.vy) > 0.5) {
      this.reflectSound();
    }
    if (Math.abs(this.vy) > 0.1) {
      return 'y';
    }
  }
};

Ball.prototype.refrectBall = function (ball) {
  if(ball == null) {
    return false;
  }
  // detect reflection between balls
  if(Math.pow(ball.x - this.x, 2) + Math.pow(ball.y - this.y, 2) <= Math.pow(this.r + ball.r, 2)){

      // change volocity to reflected normal direction
      var theta = Math.atan((ball.y - this.y) / (ball.x - this.x)); //radian
      this.v = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
      ball.v = Math.sqrt(Math.pow(ball.vx, 2) + Math.pow(ball.vy, 2));

      // change reflect velocity depending on mass
      var v_sum = (ball.v + this.v);
      this.v = (ball.r) / (this.r + ball.r) *  v_sum;
      ball.v = (this.r) / (this.r + ball.r) *  v_sum;

      this.vx = this.v * Math.abs(Math.cos(theta));
      this.vy = this.v * Math.abs(Math.sin(theta));
      ball.vx = ball.v * Math.abs(Math.cos(theta));
      ball.vy = ball.v * Math.abs(Math.sin(theta));

      if(this.x < ball.x) {
        this.vx *= -DAMPING_PARAM_BALL;
        ball.x = this.x + (this.r + ball.r) * Math.abs(Math.cos(theta));
      } else {
        ball.vx *= -DAMPING_PARAM_BALL;
        ball.x = this.x - (this.r + ball.r) * Math.abs(Math.cos(theta));
      }

      if(this.y < ball.y) {
        this.vy *= -DAMPING_PARAM_BALL;
        ball.y = this.y + (this.r + ball.r) * Math.abs(Math.sin(theta));
      } else {
        ball.vy *= -DAMPING_PARAM_BALL;
        ball.y = this.y - (this.r + ball.r) * Math.abs(Math.sin(theta));
      }
      this.cnt--;
      ball.cnt--;
      if(Math.abs(this.v) > 0.5) {
        this.reflectSound();
      }
      return true;
  }
  return false;
};

Ball.prototype.reflectSound = function() {
  if(sound) {
    audio.play();
    audio = new Audio(audio.src);
  }
};

window.onload = function() {
  canvas = document.getElementById('canvasRect');
  context = canvas.getContext('2d');

  $(canvas).on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    _createBall(e);
    return false;
  });

  function _createBall(e) {
    var leftVelFlg = false;
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;

    var radius = Math.ceil(Math.random() * 3) * 10; //random ball size

    if(balls.length % 2 == 0) {
      leftVelFlg = true
    }

    balls.push(new Ball(x, y, radius, leftVelFlg, COLORS[balls.length % COLORS.length]));
  }


  $('.js-btn').on('click', function(){
      type = $(this).data('type')
      switch(type) {
        case 'top':
          gravityX = 0.0;
          gravityY = -0.2;
          break;
        case 'bottom':
          gravityX = 0.0;
          gravityY = 0.2;
          break;
        case 'left':
          gravityX = -0.2;
          gravityY = 0.0;
          break;
        case 'right':
          gravityX = 0.2;
          gravityY = 0.0;
          break;
        case 'zero':
          gravityX = 0.0;
          gravityY = 0.0;
          break;
      }
      $('.js-btn').removeClass('is-active');
      $(this).addClass('is-active');
  });

  $('.js-reset').on('click', function(){
    balls = [];
  });

  $('.js-sound').on('click', function(){
    var $self = $(this);
    if($self.hasClass('is-active')) {
      sound = false;
      $self.text('sound off');
      $self.removeClass('is-active');
    } else {
      sound = true;
      $self.text('sound on');
      $self.addClass('is-active');
    }
  });

  // loop for each ball
  setInterval(function() {
    context.clearRect(0, 0, W, H);
      for(var i = 0; i < balls.length; i++) {
        for(var j = 0; j < balls.length; j++) {
          if(i !== j) {
            balls[i].refrectBall(balls[j]);
          }
        }

        balls[i].refrectWall();
        balls[i].drawCircle();
        balls[i].update();
        // remove ball which count is 0
        if(balls[i].cnt <= 0){
          balls.splice(i, 1);
        }
      }
  }, FPS);
}
