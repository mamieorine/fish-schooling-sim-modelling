const mutationRate = 0.5;

class AgentRenderer {
  render(ctx) {
    const angle = this.vel.heading();

    ctx.beginPath();
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(this.radius, this.radius - 15);
    ctx.lineTo(this.radius + 15, this.radius);
    ctx.lineTo(this.radius, this.radius + 15);
    ctx.fillStyle = `rgba(43,82,97,0.8)`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.radius - 10, this.radius);
    ctx.lineTo(this.radius, this.radius);
    ctx.lineTo(this.radius + 5, this.radius + 5);
    ctx.fillStyle = `rgba(43,82,97,0.8})`;
    ctx.fill();


    ctx.restore();
    ctx.closePath();
  }
}

class BaseAgent extends AgentRenderer {
  constructor(x, y, radius = 5, builder = {}) {
    super();
    this.pos = new Vector(x, y);
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, -2);

    this.builder = builder;
    this.radius = radius || 5;
    this.maxSpeed = builder.maxSpeed || 1.5;
    this.maxForce = builder.maxForce || 0.05;
    this.hasReproduced = 0;

    this.flock = new Flock(this);
    this.flockMultiplier = {
      separate: -0.1,
      align: 0.8,
      cohesion: 0.7
    };

    this.type = builder.type;
    this.color = [255, 39, 201];
    this.maxRadius = builder.maxRadius;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.radius = clamp(this.radius, 0, this.maxRadius);
  }

  applyForce(f) { this.acc.add(f) }

  boundaries() {
    let maxDist = 100;
    let desire = null;
    if (this.pos.x < maxDist) {
      desire = new Vector(this.maxSpeed, this.vel.y);
    }
    else if (this.pos.x > WIDTH - maxDist) {
      desire = new Vector(-this.maxSpeed, this.vel.y);
    }
    if (this.pos.y < maxDist) {
      desire = new Vector(this.vel.x, this.maxSpeed);
    }
    else if (this.pos.y > HEIGHT - maxDist) {
      desire = new Vector(this.vel.x, -this.maxSpeed);
    }
    if (desire !== null) {
      desire.normalize();
      desire.mult(this.maxSpeed);
      let steer = Vector.sub(desire, this.vel);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  applyFlock(agents) {
    let sep = this.flock.separate(agents);
    let ali = this.flock.align(agents);
    let coh = this.flock.cohesion(agents);

    sep.mult(this.flockMultiplier.separate);
    ali.mult(this.flockMultiplier.align);
    coh.mult(this.flockMultiplier.cohesion);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  updateFlockBehavior(separate, align, cohesion) {
    this.flockMultiplier = {
      separate: parseFloat(separate),
      align: parseFloat(align),
      cohesion: parseFloat(cohesion)
    };
  }


  clone(probability) {
    if (Math.random() < probability) {
      return this.builder.setPos(this.pos.x, this.pos.y).setRadius(5).build();
    }
    return null;
  }

  reproduce(boids) {
    let maxDist = Infinity;
    for (let i = 0; i < boids.length - 1; i++) {
      let agentA = boids[i];
      maxDist = dist(agentA.pos.x, agentA.pos.y, this.pos.x, this.pos.y);
    }
  }
}

class AgentBuilder {
  constructor(type) {
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, -2);
    this.type = type;
  }

  setPos(x, y) {
    this.pos = new Vector(x, y);
    return this;
  }
  setMaxRadius(r = 20) {
    this.maxRadius = r;
    return this;
  }
  setRadius(r = 5) {
    this.radius = r;
    return this;
  }
  setMaxSpeed(val = 1.5) {
    this.maxSpeed = val;
    return this;
  }
  setMaxForce(val = 0.05) {
    this.maxForce = val;
    return this;
  }

  build() {
    return new BaseAgent(
      this.pos.x, this.pos.y,
      this.radius, this.dna,
      this.color, this
    );
  }
}

