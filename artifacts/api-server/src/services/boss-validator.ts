import { BossRepository } from "../repositories/boss-repository";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export class BossValidator {
  private repo = new BossRepository();

  async validate(bossId: number): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];
    const boss = await this.repo.getFull(bossId);
    if (!boss) {
      return { valid: false, issues: [{ field: "boss", message: "Boss not found", severity: "error" }] };
    }

    // Missing phases
    if (boss.totalPhases > 1 && boss.phases.length === 0) {
      issues.push({ field: "phases", message: "Boss has multiple phases defined but no phase records exist", severity: "error" });
    }

    // Phase count mismatch
    if (boss.phases.length > 0) {
      const phaseNums = boss.phases.map(p => p.phaseNumber);
      const expected = Array.from({ length: boss.totalPhases }, (_, i) => i + 1);
      const missing = expected.filter(n => !phaseNums.includes(n));
      if (missing.length > 0) {
        issues.push({ field: "phases", message: `Missing phase records for: ${missing.join(", ")}`, severity: "error" });
      }

      // Duplicate phase numbers
      const seen = new Set<number>();
      for (const p of boss.phases) {
        if (seen.has(p.phaseNumber)) {
          issues.push({ field: "phases", message: `Duplicate phase number: ${p.phaseNumber}`, severity: "error" });
        }
        seen.add(p.phaseNumber);
      }

      // Circular phase transitions check — hp thresholds must be descending
      const sorted = [...boss.phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].hpThreshold >= sorted[i - 1].hpThreshold) {
          issues.push({ field: "phases", message: `Phase ${sorted[i].phaseNumber} HP threshold must be lower than Phase ${sorted[i - 1].phaseNumber}`, severity: "error" });
        }
      }
    }

    // Duplicate skills
    const skillRefs = boss.skills.map(s => s.skillRef);
    const skillDupes = skillRefs.filter((r, i) => skillRefs.indexOf(r) !== i);
    if (skillDupes.length > 0) {
      issues.push({ field: "skills", message: `Duplicate skill refs: ${[...new Set(skillDupes)].join(", ")}`, severity: "warning" });
    }

    // Arena validation
    if (boss.arenas.length === 0) {
      issues.push({ field: "arenas", message: "No arena defined for this boss", severity: "warning" });
    }

    // Loot validation
    for (const l of boss.loot) {
      if (l.dropChance < 0 || l.dropChance > 1) {
        issues.push({ field: "loot", message: `Loot "${l.name}" drop chance must be between 0 and 1`, severity: "error" });
      }
    }

    // Rewards validation
    if (boss.rewards.length === 0) {
      issues.push({ field: "rewards", message: "Boss has no rewards defined", severity: "warning" });
    }

    // Invalid weak points — damage multiplier should be > 1
    for (const wp of boss.weakpoints) {
      if (wp.damageMultiplier <= 1) {
        issues.push({ field: "weakpoints", message: `Weak point "${wp.name}" should have damage multiplier > 1`, severity: "warning" });
      }
    }

    // Broken assets check
    if (!boss.portraitAssetId) {
      issues.push({ field: "assets", message: "No portrait asset assigned", severity: "warning" });
    }
    if (!boss.modelAssetId) {
      issues.push({ field: "assets", message: "No 3D model asset assigned", severity: "warning" });
    }

    // Rage mode without enrage config
    if (boss.hasRageMode && boss.enrage.length === 0) {
      issues.push({ field: "enrage", message: "Rage mode is enabled but no enrage configuration exists", severity: "error" });
    }

    return {
      valid: issues.filter(i => i.severity === "error").length === 0,
      issues,
    };
  }
}
