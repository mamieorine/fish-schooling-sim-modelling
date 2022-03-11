class Flock {
  constructor(currentAgent) {
    this.currentAgent = currentAgent;
  }

  controller(interactive) {
    interactive.normalize();
    interactive.mult(this.currentAgent.maxSpeed);
    let controller = Vector.sub(interactive, this.currentAgent.vel);
    controller.limit(this.currentAgent.maxForce);
    return controller;
  }

  separate(agents) {
    let desiredSeparation = this.currentAgent.radius * 4;
    let count = 0;
    let interactive = new Vector();

    for (let i = 0; i < agents.length; i++) {
      let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
      if ((d > 0) && (d < desiredSeparation * desiredSeparation)) {
        let diff = Vector.sub(this.currentAgent.pos, agents[i].pos);
        diff.normalize();
        diff.div(d);
        interactive.add(diff);
        count++;
      }
    }
    if (count > 0) {
      interactive.div(count);
      return this.controller(interactive);
    }
    return new Vector(0, 0);
  };

  align(agents) {
    let neighborsDistance = 50;
    let interactive = new Vector(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
      if ((d > 0) && (d < neighborsDistance * neighborsDistance)) {
        interactive.add(agents[i].vel);
        count++;
      }
    }
    if (count > 0) {
      interactive.div(count);
      return this.controller(interactive);
    }
    return new Vector(0, 0);
  }

  cohesion(agents) {
    let neighborsDistance = 30;
    let interactive = new Vector(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
      if ((d > 0) && (d < neighborsDistance * neighborsDistance)) {
        interactive.add(agents[i].pos);
        count++;
      }
    }
    if (count > 0) {
      interactive.div(count);
      interactive.sub(this.currentAgent.pos);
      return this.controller(interactive);
    }
    return new Vector(0, 0);
  }
}