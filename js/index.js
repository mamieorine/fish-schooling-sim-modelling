let canvas = document.querySelector('#c');
let ctx = canvas.getContext('2d');

let isFirstVisit = true;
let isStop = false;
let maxNumFish = 300;
let lastFrame;
let fps;
let frameRate;

const REPRODUCTION_RATE = 0.5;
const FISH = 'FISH';
const WIDTH = canvas.width = window.innerWidth;
const HEIGHT = canvas.height = 600;
const helper = new Helper();

function animate() {
  if (isStop) return;

  const HALF_W = WIDTH / 2;
  const HALF_H = HEIGHT / 2;
  let grd = ctx.createRadialGradient(HALF_W, HALF_H, 0, HALF_W, HALF_H, WIDTH);
  grd.addColorStop(0, "rgba(173, 216, 230,0.5)");
  grd.addColorStop(1, "rgba(125, 249, 255,0.5)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  helper.addBehavior({
    name: FISH,
    cloneItSelf: 0.0015,
    callback: function () {
      if (helper.groups.FISH.length < maxNumFish
        && random(1) < REPRODUCTION_RATE) {
        this.reproduce(helper.groups.FISH);
      }
    }
  });

  helper.render();
  helper.update();

  requestAnimationFrame(animate);

  if (!lastFrame) {
    lastFrame = Date.now();
    fps = 0;
    return;
  }
  delta = (Date.now() - lastFrame) / 1000;
  lastFrame = Date.now();
  fps = (1 / delta).toFixed(2);
}

function start() {
  if (isFirstVisit) {
    window.onload = initAgent();
    isFirstVisit = false;
    return;
  }

  isStop = false;
  animate();
}

function stop() {
  isStop = true;
}

function initAgent() {
  if (typeof window.orientation !== 'undefined') { maxNumFish = 200 }

  let Agent = new AgentBuilder('FISH');
  helper.registerAgents({
    FISH: Agent,
  });

  helper.initialPopulation({
    FISH: 150,
  });

  animate();
  frameRate = window.setInterval(function () {
    renderStats({
      'Good Fish': helper.groups.FISH.length,
      'FPS': fps
    })
  }, 100);
}
