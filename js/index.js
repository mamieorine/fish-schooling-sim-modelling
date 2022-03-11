let canvas = document.querySelector('#fishTank');
let ctx = canvas.getContext('2d');

let isFirstVisit = true;
let isStop = false;
let lastFrame;
let fps;
let frameRate;

const FISH = 'FISH';
const WIDTH = canvas.width = window.innerWidth;
const HEIGHT = canvas.height = 600;
const HALF_W = WIDTH / 2;
const HALF_H = HEIGHT / 2;

const grd = ctx.createRadialGradient(HALF_W, HALF_H, 0, HALF_W, HALF_H, WIDTH);
const helper = new Helper();

function animate() {
  if (isStop) return;

  grd.addColorStop(0, "rgba(173, 216, 230,0.5)");
  grd.addColorStop(1, "rgba(125, 249, 255,0.5)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  helper.addBehavior({name: FISH});

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
  document.getElementById('start').setAttribute('disabled', 'disabled')
  if (isFirstVisit) {
    window.onload = initAgent();
    isFirstVisit = false;
    return;
  }

  isStop = false;
  animate();
}

function stop() {
  document.getElementById('start').removeAttribute('disabled');
  isStop = true;
}

function initAgent() {
  let Agent = new AgentBuilder('FISH');
  helper.registerAgents({
    FISH: Agent,
  });

  const mobile = window.innerWidth <= 812 || window.innerHeight <= 400;
  helper.initialPopulation({
    FISH: mobile ? 50 : 150,
  });

  animate();
  frameRate = window.setInterval(function () {
    const stats = document.getElementById('stats');
    stats.innerHTML = 'Amount of fish in the tank : ' + helper.groups.FISH.length + '<br>' + 'FPS : ' + fps;
  }, 100);
}
