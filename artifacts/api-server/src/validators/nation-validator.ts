import { NationRepository } from "../repositories/nation-repository";

const nationRepository = new NationRepository();

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class NationValidator {
  async validate(nationId: number): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const [nation, governments, laws, taxRules, borders, passports, diplomaticRelations, treaties] = await Promise.all([
      nationRepository.findNationById(nationId),
      nationRepository.findGovernmentsByNation(nationId),
      nationRepository.findLawsByNation(nationId),
      nationRepository.findTaxRulesByNation(nationId),
      nationRepository.findBordersByNation(nationId),
      nationRepository.findPassportsByNation(nationId),
      nationRepository.findDiplomaticRelationsByNation(nationId),
      nationRepository.findAllTreaties(),
    ]);

    if (!nation) { errors.push("Nation not found"); return { valid: false, errors, warnings }; }

    // Missing capital city
    if (!nation.capitalCityId) { warnings.push("Nation has no capital city assigned"); }

    // Missing flag asset
    if (!nation.flagAssetId) { warnings.push("Nation has no flag asset assigned"); }

    // Missing emblem asset
    if (!nation.emblemAssetId) { warnings.push("Nation has no emblem asset assigned"); }

    // No government
    if (governments.length === 0) { errors.push("Nation has no government defined"); }

    // Duplicate borders
    const borderPairs = new Set<string>();
    const duplicateBorders: string[] = [];
    for (const border of borders) {
      const pair = border.adjacentNationId ? [nationId, border.adjacentNationId].sort().join("-") : null;
      if (pair && borderPairs.has(pair)) {
        duplicateBorders.push(`Nation ${border.adjacentNationId}`);
      } else if (pair) {
        borderPairs.add(pair);
      }
    }
    if (duplicateBorders.length > 0) { errors.push(`Duplicate borders detected with: ${duplicateBorders.join(", ")}`); }

    // Border gaps (no borders defined)
    if (borders.length === 0) { warnings.push("Nation has no borders defined"); }

    // Circular treaties
    const treatySignatories = treaties.filter(t => {
      const signatories = t.signatories as number[] || [];
      return signatories.includes(nationId);
    });
    const circularTreaties: string[] = [];
    for (const treaty of treatySignatories) {
      const signatories = treaty.signatories as number[] || [];
      if (signatories.length > 2) {
        circularTreaties.push(treaty.name);
      }
    }
    if (circularTreaties.length > 0) { warnings.push(`Potential circular treaties: ${circularTreaties.join(", ")}`); }

    // Invalid diplomacy references
    const invalidDiplomacy = diplomaticRelations.filter(d => !d.targetNationId);
    if (invalidDiplomacy.length > 0) { errors.push(`${invalidDiplomacy.length} diplomatic relation(s) have invalid target nation references`); }

    // Duplicate passport codes
    const passportNumbers = passports.map(p => p.passportNumber).filter(Boolean);
    const duplicatePassports = passportNumbers.filter((code, i) => passportNumbers.indexOf(code) !== i);
    if (duplicatePassports.length > 0) { errors.push(`Duplicate passport numbers detected: ${[...new Set(duplicatePassports)].join(", ")}`); }

    // Broken government references
    const ministries = await nationRepository.findMinistriesByNation(nationId);
    const brokenMinistryGovRefs = ministries.filter(m => !m.governmentId);
    if (brokenMinistryGovRefs.length > 0) { errors.push(`${brokenMinistryGovRefs.length} ministry/ies have broken government references`); }

    // Duplicate ministries
    const ministryNames = ministries.map(m => m.name);
    const duplicateMinistries = ministryNames.filter((name, i) => ministryNames.indexOf(name) !== i);
    if (duplicateMinistries.length > 0) { errors.push(`Duplicate ministry names: ${[...new Set(duplicateMinistries)].join(", ")}`); }

    // Illegal tax values
    const illegalTaxRules = taxRules.filter(t => t.rate !== undefined && (t.rate < 0 || t.rate > 100));
    if (illegalTaxRules.length > 0) { errors.push(`${illegalTaxRules.length} tax rule(s) have invalid rates (must be 0-100)`); }

    // Negative tax values
    const negativeTaxRules = taxRules.filter(t => t.rate !== undefined && t.rate < 0);
    if (negativeTaxRules.length > 0) { errors.push(`${negativeTaxRules.length} tax rule(s) have negative rates`); }

    // General warnings
    if (laws.length === 0) { warnings.push("Nation has no laws defined"); }
    if (taxRules.length === 0) { warnings.push("Nation has no tax rules defined"); }
    if (diplomaticRelations.length === 0) { warnings.push("Nation has no diplomatic relations established"); }

    return { valid: errors.length === 0, errors, warnings };
  }
}

export const nationValidator = new NationValidator();
