import type { DrizzleItemEditorRepository } from "../repositories/item-editor-repository";

interface ImportOptions {
  projectId?: number;
  nameOverride?: string;
}

export class ItemImporter {
  constructor(private repo: DrizzleItemEditorRepository) {}

  async importFromJson(importedBy: number, jsonData: string, opts: ImportOptions = {}) {
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(jsonData); }
    catch { throw new Error("Invalid JSON"); }

    const srcItem = (parsed["item"] ?? parsed) as Record<string, unknown>;
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...itemFields } = srcItem as Record<string, unknown>;

    const newItem = await this.repo.createItem({
      ...(itemFields as Parameters<typeof this.repo.createItem>[0]),
      name: String(opts.nameOverride ?? itemFields["name"] ?? "Imported Item"),
      createdBy: importedBy,
      projectId: opts.projectId ?? (itemFields["projectId"] as number | undefined),
      isPublished: false,
      version: 1,
    });

    const errors: string[] = [];
    const sections = ["stats", "attributes", "effects", "pricing", "restrictions", "visuals"] as const;

    for (const section of sections) {
      const rows = parsed[section] as Record<string, unknown>[] | undefined;
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        try {
          const { id: _, itemId: __, ...rest } = row;
          if (section === "stats") await this.repo.upsertStat(newItem.id, rest as Parameters<typeof this.repo.upsertStat>[1]);
          if (section === "attributes") await this.repo.upsertAttribute(newItem.id, rest as Parameters<typeof this.repo.upsertAttribute>[1]);
          if (section === "effects") await this.repo.createEffect(newItem.id, rest as Parameters<typeof this.repo.createEffect>[1]);
          if (section === "pricing") await this.repo.upsertPricing(newItem.id, rest as Parameters<typeof this.repo.upsertPricing>[1]);
          if (section === "restrictions") await this.repo.createRestriction({ ...rest, itemId: newItem.id } as Parameters<typeof this.repo.createRestriction>[0]);
          if (section === "visuals") await this.repo.createVisual({ ...rest, itemId: newItem.id } as Parameters<typeof this.repo.createVisual>[0]);
        } catch (e) {
          errors.push(`${section}: ${String(e)}`);
        }
      }
    }

    await this.repo.saveImport({
      itemId: newItem.id,
      importedBy,
      sourceFormat: "json",
      status: errors.length ? "partial" : "success",
      errors: errors.length ? errors : null,
    });

    return { item: newItem, errors };
  }

  async importFromTemplate(importedBy: number, templateId: number, opts: ImportOptions & { name: string }) {
    const templates = await this.repo.listTemplates(100, 0);
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) throw new Error(`Template ${templateId} not found`);

    const snap = tpl.snapshot as Record<string, unknown> | null;
    const payload = JSON.stringify(snap ?? {});
    const result = await this.importFromJson(importedBy, payload, { ...opts, nameOverride: opts.name });
    await this.repo.incrementTemplateUse(templateId);
    return result;
  }
}
