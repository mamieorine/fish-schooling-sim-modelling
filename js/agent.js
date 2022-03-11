class AgentRenderer {
  render(ctx) {
    const angle = this.vel.heading();
    const mobile = window.innerWidth <= 812 || window.innerHeight <= 400;

    ctx.beginPath();
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(angle);

    ctx.beginPath();
    if (mobile) {
      ctx.moveTo(this.radius, this.radius - 10);
      ctx.lineTo(this.radius + 10, this.radius);
      ctx.lineTo(this.radius, this.radius + 10);
    } else {
      ctx.moveTo(this.radius, this.radius - 15);
      ctx.lineTo(this.radius + 15, this.radius);
      ctx.lineTo(this.radius, this.radius + 15);
    }

    ctx.fillStyle = `rgba(43,82,97,0.8)`;
    ctx.fill();

    ctx.beginPath();

    if (mobile) {
      ctx.moveTo(this.radius - 5, this.radius);
      ctx.lineTo(this.radius, this.radius);
      ctx.lineTo(this.radius + 2, this.radius + 2);
    } else {
      ctx.moveTo(this.radius - 10, this.radius);
      ctx.lineTo(this.radius, this.radius);
      ctx.lineTo(this.radius + 5, this.radius + 5);
    }
    ctx.fillStyle = `rgba(43,82,97,0.8})`;
    ctx.fill();

    ctx.restore();
    ctx.closePath();
  }
}

class BaseAgent extends AgentRenderer {
  constructor(x, y, radius, builder = {}) {
    super();

    // position, velocity, and acceleration
    this.pos = new Vector(x, y);
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, -2);

    this.builder = builder;
    this.radius = 8;
    this.maxSpeed = 1.5;
    this.maxForce = 0.05;

    this.flock = new Flock(this);
    this.flockMultiplier = {
      separate: -0.1,
      align: 0.8,
      cohesion: 0.7
    };

    this.color = [255, 39, 201];
  }

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

    if (!desire) return;

    desire.normalize();
    desire.mult(this.maxSpeed);

    let controller = Vector.sub(desire, this.vel);
    controller.limit(this.maxForce);

    this.acc.add(controller)
  }

  updateCommon() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  updateFlockBehavior(separate, align, cohesion) {
    this.flockMultiplier = {
      separate: parseFloat(separate),
      align: parseFloat(align),
      cohesion: parseFloat(cohesion)
    };
  }

  applyFlock(agents) {
    let sep = this.flock.separate(agents);
    let ali = this.flock.align(agents);
    let coh = this.flock.cohesion(agents);

    sep.mult(this.flockMultiplier.separate);
    ali.mult(this.flockMultiplier.align);
    coh.mult(this.flockMultiplier.cohesion);

    this.acc.add(sep)
    this.acc.add(ali)
    this.acc.add(coh)
  }
}

class AgentBuilder {
  constructor() {
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, -2);
  }

  setPos(x, y) {
    this.pos = new Vector(x, y);
    return this;
  }

  build() {
    return new BaseAgent(this.pos.x, this.pos.y, this.radius, this);
  }
}

