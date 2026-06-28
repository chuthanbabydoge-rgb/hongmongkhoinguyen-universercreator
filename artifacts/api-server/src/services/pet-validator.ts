import type { DrizzlePetRepository } from "../repositories/pet-repository";

export class PetValidator {
  constructor(private repo: DrizzlePetRepository) {}

  async validate(petId: number) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const pet = await this.repo.getPet(petId);
    if (!pet) return { valid: false, errors: ["Pet not found"], warnings };

    if (!pet.speciesId) errors.push("Pet has no species assigned");
    if (!pet.name || pet.name.trim().length === 0) errors.push("Pet name is required");

    const stats = await this.repo.getStats(petId);
    if (!stats) warnings.push("Pet has no stats configured");
    else {
      if (stats.hp <= 0) errors.push("HP must be greater than 0");
      if (stats.attack < 0) errors.push("Attack cannot be negative");
      if (stats.defense < 0) errors.push("Defense cannot be negative");
      if (stats.speed < 0) errors.push("Speed cannot be negative");
      if (stats.critRate < 0 || stats.critRate > 1) errors.push("Crit rate must be between 0 and 1");
      if (stats.evasion < 0 || stats.evasion > 1) errors.push("Evasion must be between 0 and 1");
      if (stats.accuracy < 0 || stats.accuracy > 1) errors.push("Accuracy must be between 0 and 1");
    }

    const growth = await this.repo.getGrowth(petId);
    if (!growth) warnings.push("Pet has no growth configuration");
    else {
      if (growth.maxLevel < pet.level) errors.push("Max level is less than current level");
      if (growth.expMultiplier <= 0) errors.push("EXP multiplier must be positive");
      if (growth.statMultiplier <= 0) errors.push("Stat multiplier must be positive");
    }

    const skills = await this.repo.getSkills(petId);
    const skillRefs = skills.map(s => s.skillRef);
    const duplicateSkills = skillRefs.filter((r, i) => skillRefs.indexOf(r) !== i);
    if (duplicateSkills.length > 0) errors.push(`Duplicate skills: ${duplicateSkills.join(", ")}`);
    if (skills.length > 8) warnings.push("Pet has more than 8 skills; only first 8 may be active");

    const evolutions = await this.repo.getEvolutions(petId);
    const targetIds = evolutions.map(e => e.targetSpeciesId);
    const circularEvolutions = targetIds.filter(id => id === pet.speciesId);
    if (circularEvolutions.length > 0) errors.push("Circular evolution detected — target species is same as current species");

    const hunger = await this.repo.getHunger(petId);
    if (hunger) {
      if (hunger.hungerDecayRate < 0) errors.push("Hunger decay rate cannot be negative");
      if (hunger.feedCooldown < 0) errors.push("Feed cooldown cannot be negative");
    }

    const equipment = await this.repo.getEquipment(petId);
    const slots = equipment.map(e => e.slot);
    const duplicateSlots = slots.filter((s, i) => slots.indexOf(s) !== i);
    if (duplicateSlots.length > 0) errors.push(`Duplicate equipment slots: ${duplicateSlots.join(", ")}`);

    if (!pet.iconAssetId) warnings.push("Pet has no icon asset");
    if (!pet.modelAssetId) warnings.push("Pet has no model asset");

    return { valid: errors.length === 0, errors, warnings };
  }
}
