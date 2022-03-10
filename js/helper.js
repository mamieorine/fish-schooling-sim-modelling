function getRandomArrayItem(arr) {
  return arr[Math.floor(random(0, arr.length - 1))];
}

function addCreatures(list, max) {
  for (let i = 0; i < max; i++) {
    let x = random(WIDTH);
    let y = random(HEIGHT);
    let radius = randomInt(5, 7);

    list.push(Agent.setPos(x, y).setRadius(radius).build());
  }
}

function renderItem(list, color, radius, rect) {
  for (let i = 0; i < list.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = color;
    if (rect) {
      ctx.fillRect(list[i].pos.x, list[i].pos.y, radius * 2, radius * 2);
    } else {
      ctx.fillRect(list[i].pos.x, list[i].pos.y, radius * 2, radius * 2);
    }
    ctx.fill();
    ctx.closePath();
  }
}

function batchRenderAgents(list) {
  for (let i = 0; i < list.length; i++) {
    list[i].render(ctx);
  }
}

let stats = document.getElementById('stats');
function renderStats(data) {
  renderData = '';
  for (let i in data) {
    renderData += ' | ' + i + ' : ' + data[i]
  }

  stats.textContent = renderData;
}

function random(min, max) {
  if (max === undefined) return Math.random() * min;
  return min + Math.random() * max
}

function randomInt(min, max) {
  return Math.floor(random(min, max));
}

function clamp(value, min, max) {
  if (value >= max) {
    return max;
  } else if (value <= min) {
    return min;
  }
  return value;
}

function dist(px, py, qx, qy) {
  let dx = px - qx;
  let dy = py - qy;
  return Math.sqrt(dx * dx + dy * dy);
}

function distSq(px, py, qx, qy) {
  let dx = px - qx;
  let dy = py - qy;
  return (dx * dx + dy * dy);
}
const TWO_PI = Math.PI * 2;

class Helper {
  constructor() {
    this.groups = {};     // agents
    this.agents = {};     // agent classes
    this.behaviors = {};  // calculated behaviors
  }

  registerAgents(agents) {
    this.agents = agents;
    for (const i in agents) {
      this.groups[i] = []
    }
  }

  initialPopulation(init) {
    this.initPopulation = init;
    for (const i in this.initPopulation) {
      if (this.groups[i] !== undefined) {
        this.addAgent(this.agents[i], this.groups[i], this.initPopulation[i]);
      }
    }
  }

  addAgent(name, list, max) {
    for (let i = 0; i < max; i++) {
      let x = random(WIDTH);
      let y = random(HEIGHT);
      const radius = random(4, 5);
      if (name instanceof AgentBuilder) {
        list.push(name.setPos(x, y).setRadius(radius).build());
      }
    }
  }

  addBehavior(config) {
    const agents = this.groups[config.name];
    const callback = config.callback;

    if (!agents) return;
    this.behaviors[config.name] = { agents, callback }
  }

  update() {
    for (const a in this.behaviors) {
      const behave = this.behaviors[a];
      this.batchUpdateAgents(behave.agents, (list, i) => {
        let current = list[i];
        behave.callback && behave.callback.call(current);
      })
    }
  }


  batchUpdateAgents(list, callback) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].update();
      list[i].updateFlockBehavior(0.7, 0.7, 0);
      list[i].applyFlock(list);
      list[i].boundaries();

      callback && callback.call(list[i], list, i);
    }
  }

  render() {
    for (const i in this.groups) {
      if (this.groups[i][0] instanceof BaseAgent) {
        batchRenderAgents(this.groups[i]);
      }
    }
  }
}

