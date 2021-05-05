var sh = 20; //方块高度
var sw = 20; //方块宽度
var td = 30; //列数 
var tr = 30; //行数

var snake = null,
    food = null,
    game = null;

function Square(x, y, classname) {
    this.x = x*sw
    this.y = y*sh
    this.class = classname;

    this.viewcontent = document.createElement('div');
    this.viewcontent.className = this.class;
    this.parent = document.getElementById("snakeWrap");
}

Square.prototype.create = function() {
    this.viewcontent.style.position = "absolute";
    this.viewcontent.style.width =sw + "px";
    this.viewcontent.style.height = sh + "px";
    this.viewcontent.style.left = this.x + "px";
    this.viewcontent.style.top = this.y +"px";

    this.parent.appendChild(this.viewcontent);
}

Square.prototype.remove = function() {
    this.parent.removeChild(this.viewcontent);
}

function Snake() {
    this.head = null;
    this.tail = null;
    this.pos = [];

    this.directionNum = {
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
}

Snake.prototype.init = function() {
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2,0]);

    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0])

    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0,0])

    // 建立链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    this.direction = this.directionNum.right;

}

Snake.prototype.getNextPos = function() {
    var nextPos = [
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]

    // 撞到自己
    var selfcollied = false;
    this.pos.forEach(function(value) {
        if(value[0]==nextPos[0] && value[1]==nextPos[1]){
            selfcollied = true;
        }
    })
    if(selfcollied){
        console.log("撞到自己了");
        this.strategies.die.call(this);
        return;

    }

    // 撞到围墙
    if(nextPos[0] < 0 || nextPos[0] > td-1 || nextPos[1] < 0 || nextPos[1] > tr-1){
        console.log("撞到墙了");
        this.strategies.die.call(this);
        return;

    }

    // 吃到食物
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        console.log("吃到食物了");
        this.strategies.eat.call(this);
        return;
    }

    // 什么都不是，走
    this.strategies.move.call(this);
    
}

// 处理碰撞后的事
Snake.prototype.strategies={
    move:function(format){
        var newBody = new Square(this.head.x/sw, this.head.y/sh, "snakeBody");

        newBody.last = null;
        newBody.next = this.head.next;
        newBody.next.last = newBody;

        this.head.remove();
        newBody.create();

        var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh +this.direction.y, "snakeHead");

        newHead.last = null;
        newHead.next = newBody;
        newBody.last = newHead;
        newHead.viewcontent.style.transform = "rotate(" + this.direction.rotate + "deg)";
        newHead.create();

        this.pos.splice(0,0,[this.head.x/sw + this.direction.x, this.head.y/sh +this.direction.y]);
        this.head = newHead;

        if(!format){    //format为false时，没吃到食物
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();

        }
    },
    eat:function(){
        this.strategies.move.call(this,true);
        createFood();
        game.score++;

    },
    die:function(){
        game.over();

    }
}
snake = new Snake();

// 创建食物
function createFood(){
    var x = null,
        y = null;
    var include = true;
    while(include){
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));

        snake.pos.forEach(function(value){
            if(x!=value[0] && y!=value[1]){
                include = false;
            }
        });
    }
    food = new Square(x, y, "food");
    food.pos = [x,y];

    var foodDom = document.querySelector(".food");
    if(foodDom){
        foodDom.style.left = x*sw + "px";
        foodDom.style.top = y*sh + "px";
    }else{
        food.create();
    }
}

// 创建游戏逻辑
function Game(){
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function(){
    snake.init();
    createFood();

    document.onkeydown = function(ev){
        if(ev.which==37 && snake.direction!=snake.directionNum.right){
            snake.direction = snake.directionNum.left;
        }else if(ev.which==38 && snake.direction!=snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(ev.which==39 && snake.direction!=snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(ev.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }

    this.strat();
}
Game.prototype.strat = function(){
    this.timer = setInterval(function (){
        snake.getNextPos();
    },100);
}
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert("一共吃了" + this.score + "个苹果！");

    var snakeWrap = document.getElementById("snakeWrap");
    snakeWrap.innerHTML = "";

    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector(".startBtn");
    startBtnWrap.style.display = "block";
}

// 开始游戏
game = new Game();
var startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function(){
    startBtn.parentNode.style.display = "none";
    game.init();
};

// 暂停游戏
var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.querySelector(".pauseBtn button");
snakeWrap.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = "block";
}
pauseBtn.onclick = function(){
    game.strat();
    pauseBtn.parentNode.style.display = "none";
}




