import type { DrizzlePetRepository } from "../repositories/pet-repository";

export class PetRuntimeBridge {
  constructor(private repo: DrizzlePetRepository) {}

  async spawnPet(petId: number) {
    const runtime = await this.repo.upsertRuntime({ petId, isSpawned: true, isSummoned: false, runtimeState: "idle", currentHp: 100, currentExp: 0, currentLoyalty: 50, currentHunger: 100 });
    return { spawned: true, runtime };
  }

  async despawnPet(petId: number) {
    const runtime = await this.repo.upsertRuntime({ petId, isSpawned: false, isSummoned: false, runtimeState: "idle", currentHp: 0, currentExp: 0, currentLoyalty: 50, currentHunger: 100 });
    return { despawned: true, runtime };
  }

  async summon(petId: number, ownerId: number) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const stats = await this.repo.getStats(petId);
    const runtime = await this.repo.upsertRuntime({ petId, isSpawned: true, isSummoned: true, ownerId, runtimeState: "following", currentHp: stats?.hp ?? 100, currentExp: pet.experience, currentLoyalty: pet.loyalty, currentHunger: pet.hunger });
    return { summoned: true, pet, runtime };
  }

  async dismiss(petId: number) {
    const runtime = await this.repo.upsertRuntime({ petId, isSpawned: true, isSummoned: false, runtimeState: "idle", currentHp: 100, currentExp: 0, currentLoyalty: 50, currentHunger: 100 });
    return { dismissed: true, runtime };
  }

  async feed(petId: number, foodType: string, amount = 20) {
    const hunger = await this.repo.getHunger(petId);
    const loyalty = await this.repo.getLoyalty(petId);
    const pet = await this.repo.getPet(petId);
    const hungerGain = amount;
    const loyaltyGain = loyalty?.loyaltyPerFeed ?? 5;
    const newHunger = Math.min((hunger?.currentHunger ?? 80) + hungerGain, hunger?.maxHunger ?? 100);
    const newLoyalty = Math.min((loyalty?.currentLoyalty ?? 50) + loyaltyGain, loyalty?.maxLoyalty ?? 100);
    await this.repo.upsertHunger({ petId, currentHunger: newHunger, maxHunger: hunger?.maxHunger ?? 100, hungerDecayRate: hunger?.hungerDecayRate ?? 1.0, preferredFood: "meat", feedCooldown: hunger?.feedCooldown ?? 300 });
    await this.repo.upsertLoyalty({ petId, currentLoyalty: newLoyalty, maxLoyalty: loyalty?.maxLoyalty ?? 100, minLoyalty: loyalty?.minLoyalty ?? 0, loyaltyPerFeed: loyalty?.loyaltyPerFeed ?? 5, loyaltyPerCombat: loyalty?.loyaltyPerCombat ?? 3, loyaltyDecayRate: loyalty?.loyaltyDecayRate ?? 0.1 });
    if (pet) await this.repo.updatePet(petId, { hunger: newHunger, loyalty: newLoyalty });
    return { fed: true, foodType, hungerRestored: hungerGain, loyaltyGained: loyaltyGain, newHunger, newLoyalty };
  }

  async gainExp(petId: number, amount: number) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const growth = await this.repo.getGrowth(petId);
    const multiplier = growth?.expMultiplier ?? 1.0;
    const gained = Math.floor(amount * multiplier);
    const newExp = pet.experience + gained;
    await this.repo.updatePet(petId, { experience: newExp });
    await this.repo.upsertStatistics({ petId, totalExpGained: gained } as any);
    return { expGained: gained, totalExp: newExp, pet };
  }

  async levelUp(petId: number) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const growth = await this.repo.getGrowth(petId);
    if (pet.level >= (growth?.maxLevel ?? 100)) throw new Error("Pet is already at max level");
    const newLevel = pet.level + 1;
    await this.repo.updatePet(petId, { level: newLevel, experience: 0 });
    const levels = await this.repo.getLevels(petId);
    const levelData = levels.find(l => l.level === newLevel);
    return { leveledUp: true, newLevel, levelData };
  }

  async evolve(petId: number, targetSpeciesId: number) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const evolutions = await this.repo.getEvolutions(petId);
    const evo = evolutions.find(e => e.targetSpeciesId === targetSpeciesId);
    if (!evo) throw new Error("Evolution path not found");
    if (pet.level < evo.requiredLevel) throw new Error(`Requires level ${evo.requiredLevel}`);
    await this.repo.updatePet(petId, { speciesId: targetSpeciesId });
    await this.repo.addHistory({ petId, action: "evolved", detail: `Evolved to species ${targetSpeciesId}`, changedBy: 0 });
    await this.repo.upsertStatistics({ petId, totalEvolutions: 1 } as any);
    return { evolved: true, targetSpeciesId, pet };
  }

  async breed(petId: number, partnerId: number) {
    const pet = await this.repo.getPet(petId);
    const partner = await this.repo.getPet(partnerId);
    if (!pet || !partner) throw new Error("Pet or partner not found");
    const breeding = await this.repo.getBreeding(petId);
    if (breeding && breeding.currentBreeds >= (breeding.maxBreeds ?? 10)) throw new Error("Pet has reached max breed count");
    if (breeding) await this.repo.upsertBreeding({ petId, partnerId, currentBreeds: (breeding.currentBreeds ?? 0) + 1, lastBredAt: new Date(), maxBreeds: breeding.maxBreeds ?? 10, breedingCooldown: breeding.breedingCooldown ?? 3600 });
    await this.repo.upsertStatistics({ petId, totalBreeds: 1 } as any);
    return { bred: true, petId, partnerId, offspringSpeciesId: breeding?.offspringSpeciesId ?? pet.speciesId };
  }

  async simulateCombat(petId: number, opponentData: object) {
    const pet = await this.repo.getPet(petId);
    const stats = await this.repo.getStats(petId);
    if (!pet || !stats) throw new Error("Pet or stats not found");
    const opponent = opponentData as { hp?: number; attack?: number; defense?: number };
    const rounds: { round: number; petAction: string; opponentAction: string; petHp: number; opponentHp: number }[] = [];
    let petHp = stats.hp;
    let oppHp = opponent.hp ?? 100;
    let round = 1;
    while (petHp > 0 && oppHp > 0 && round <= 20) {
      const petDmg = Math.max(1, stats.attack - (opponent.defense ?? 5));
      const oppDmg = Math.max(1, (opponent.attack ?? 10) - stats.defense);
      oppHp -= petDmg;
      petHp -= oppDmg;
      rounds.push({ round, petAction: `Attack for ${petDmg}`, opponentAction: `Attack for ${oppDmg}`, petHp: Math.max(0, petHp), opponentHp: Math.max(0, oppHp) });
      round++;
    }
    const won = petHp > 0;
    await this.repo.upsertStatistics({ petId, totalBattles: 1, totalWins: won ? 1 : 0 } as any);
    return { won, rounds, finalPetHp: Math.max(0, petHp), finalOpponentHp: Math.max(0, oppHp) };
  }

  async simulateGrowth(petId: number, levels: number) {
    const pet = await this.repo.getPet(petId);
    const stats = await this.repo.getStats(petId);
    const growth = await this.repo.getGrowth(petId);
    if (!pet) throw new Error("Pet not found");
    const snapshots = [];
    let currentLevel = pet.level;
    let hp = stats?.hp ?? 100;
    let attack = stats?.attack ?? 10;
    const multiplier = growth?.statMultiplier ?? 1.0;
    for (let i = 0; i < levels; i++) {
      currentLevel++;
      hp = Math.floor(hp * (1 + 0.05 * multiplier));
      attack = Math.floor(attack * (1 + 0.03 * multiplier));
      snapshots.push({ level: currentLevel, hp, attack });
    }
    return { petId, startLevel: pet.level, endLevel: currentLevel, snapshots };
  }

  async simulateLoyalty(petId: number, actions: string[]) {
    const loyalty = await this.repo.getLoyalty(petId);
    let current = loyalty?.currentLoyalty ?? 50;
    const events: { action: string; delta: number; result: number }[] = [];
    for (const action of actions) {
      let delta = 0;
      if (action === "feed") delta = loyalty?.loyaltyPerFeed ?? 5;
      else if (action === "combat_win") delta = loyalty?.loyaltyPerCombat ?? 3;
      else if (action === "neglect") delta = -5;
      else if (action === "battle_loss") delta = -2;
      current = Math.max(0, Math.min(current + delta, loyalty?.maxLoyalty ?? 100));
      events.push({ action, delta, result: current });
    }
    return { petId, finalLoyalty: current, events };
  }
}
