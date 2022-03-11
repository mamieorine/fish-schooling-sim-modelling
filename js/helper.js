class Helper {
  constructor() {
    this.groups = {};     // agents
    this.agents = {};     // agent classes
    this.behaviors = {};  // calculated behaviors
  }

  random(min, max) {
    if (max === undefined) return Math.random() * min;
    return min + Math.random() * max
  }

  getDistance(px, py, qx, qy) {
    let dx = px - qx;
    let dy = py - qy;
    return Math.sqrt(dx * dx + dy * dy);
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
      let x = this.random(WIDTH);
      let y = this.random(HEIGHT);
      if (name instanceof AgentBuilder) {
        list.push(name.setPos(x, y).build());
      }
    }
  }

  addBehavior(config) {
    const agents = this.groups[config.name];
    const callback = config.callback;

    if (!agents) return;
    this.behaviors[config.name] = { agents, callback }
  }

  batchUpdateAgents(list, callback) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].updateCommon();
      list[i].updateFlockBehavior(0.7, 0.7, 0);
      list[i].applyFlock(list);
      list[i].boundaries();

      callback && callback.call(list[i], list, i);
    }
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

  render() {
    for (const i in this.groups) {
      if (this.groups[i][0] instanceof BaseAgent) {
        for (let j = 0; j < this.groups[i].length; j++) {
          this.groups[i][j].render(ctx);
        }
      }
    }
  }
}

