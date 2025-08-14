class Character {
  constructor(config) {
    this.name = config.name || "Unnamed";
    this.background = config.background || "—";
    this.archetype = config.archetype || "—";

    // Experience tracking
    this.experience = {
      current: config.experience?.current || 0,
      total: config.experience?.total || 0,
    };

    // Core Attributes (Body, Mind, Soul)
    const { BDY = 1, MND = 1, SOL = 1 } = config.attributes || {};
    this.attributes = { BDY, MND, SOL };

    // Approaches (Force, Focus, Finesse)
    const { FRC = 1, FOC = 1, FNS = 1 } = config.approaches || {};
    this.approaches = { FRC, FOC, FNS };

    // Equipment (One of each type)
    this.equipment = {
      weapon: config.equipment?.weapon || null,
      armor: config.equipment?.armor || null,
      accessory: config.equipment?.accessory || null,
    };

    // Hope Pool
    this.maxHP = Math.floor((BDY + MND + SOL) / 2 + 6);
    this.HP = this.maxHP;

    // Energy Pools (Stamina, Concentration, Resolve)
    this.maxSTA = (BDY * 2 + FOC) * 4;
    this.STA = this.maxSTA;

    this.maxCON = (MND * 2 + FOC) * 4;
    this.CON = this.maxCON;

    this.maxRES = (SOL * 2 + FOC) * 4;
    this.RES = this.maxRES;

    // Offensive Power (Might, Technique, Influence)
    this.MIG = BDY + FRC * 2;
    this.TEC = MND + FRC * 2;
    this.INF = SOL + FRC * 2;

    // Defensive Mitigation (Agility, Wisdom, Charisma)
    this.AGI = Math.max(1, Math.floor((BDY * 3 + FNS * 2) / 3));
    this.WIS = Math.max(1, Math.floor((MND * 3 + FNS * 2) / 3));
    this.CHA = Math.max(1, Math.floor((SOL * 3 + FNS * 2) / 3));

    // Initiative and Speed
    this.SPD = Math.max(1, Math.floor((FRC + FOC + FNS) / 2 + 3));
    this.IM = 0; // Initiative Meter

    // Recovery rates
    this.REC = {
      STA: Math.max(1, 1 + FOC + Math.floor(BDY / 2)),
      CON: Math.max(1, 1 + FOC + Math.floor(MND / 2)),
      RES: Math.max(1, 1 + FOC + Math.floor(SOL / 2)),
    };

    this.actionMemory = {
      strike: [],
      craft: [],
      talk: [],
    };
    this.bestAction = null; // Stores the best performing action
    this.actionCycle = ["strike", "craft", "talk"]; // Track actions tried
  }

  // Offense Actions
  strike() {
    return { attack: this.MIG, defense: "AGI", target: "STA" };
  }

  craft() {
    return { attack: this.TEC, defense: "WIS", target: "CON" };
  }

  talk() {
    return { attack: this.INF, defense: "CHA", target: "RES" };
  }

  // Defense Actions
  guard() {
    this._guarded = true;
    this.AGI *= 2;
    this.WIS *= 2;
    this.CHA *= 2;
    return "Guarding: boosted mitigation stats for 1 turn.";
  }

  resetGuard() {
    if (this._guarded) {
      this.AGI /= 2;
      this.WIS /= 2;
      this.CHA /= 2;
      this._guarded = false;
    }
  }

  // Generic Damage Logic
  takeDamage(pool, amount) {
    if (this[pool] >= amount) {
      this[pool] -= amount;
    } else {
      const overflow = amount - this[pool];
      this[pool] = 0;
      this.HP -= Math.max(1, Math.floor(overflow / 2));
    }
  }

  // Recovery Logic
  recover(pool, amount) {
    const maxMap = {
      HP: this.maxHP,
      STA: this.maxSTA,
      CON: this.maxCON,
      RES: this.maxRES,
    };

    if (this[pool] !== undefined) {
      this[pool] = Math.min(this[pool] + amount, maxMap[pool] || Infinity);
    }
  }

  isDefeated() {
    return this.HP <= 0;
  }

  // Check player states based on energy pools
  getStates() {
    const states = [];
    if (this.STA <= 0) states.push("EXH"); // Exhausted
    if (this.CON <= 0) states.push("DIS"); // Distracted
    if (this.RES <= 0) states.push("SHA"); // Shaken
    if (this.HP <= 0) states.push("HPL"); // Hopeless
    return states;
  }

  isExhausted() {
    return this.STA <= 0;
  }
  isDistracted() {
    return this.CON <= 0;
  }
  isShaken() {
    return this.RES <= 0;
  }
  isHopeless() {
    return this.HP <= 0;
  }

  statusReport() {
    return {
      name: this.name,
      background: this.background,
      archetype: this.archetype,
      experience: this.experience,
      attributes: this.attributes,
      approaches: this.approaches,
      equipment: this.equipment,
      resources: {
        HP: this.HP,
        maxHP: this.maxHP,
        STA: this.STA,
        maxSTA: this.maxSTA,
        CON: this.CON,
        maxCON: this.maxCON,
        RES: this.RES,
        maxRES: this.maxRES,
      },
      stats: {
        MIG: this.MIG,
        TEC: this.TEC,
        INF: this.INF,
        AGI: this.AGI,
        WIS: this.WIS,
        CHA: this.CHA,
        SPD: this.SPD,
        IM: this.IM,
      },
      recovery: this.REC,
      states: this.getStates(),
    };
  }
}

// characters.js
export default Character;
