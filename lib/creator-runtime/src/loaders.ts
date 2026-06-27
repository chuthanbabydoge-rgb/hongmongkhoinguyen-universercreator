import type { RuntimeDocument, RuntimeModule, RuntimePackage } from "./types";

export class DocumentLoader {
  private cache = new Map<string, RuntimeDocument>();

  async load(id: string, source: Record<string, unknown>): Promise<RuntimeDocument> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const doc: RuntimeDocument = {
      id,
      type: (source["type"] as RuntimeDocument["type"]) ?? "world",
      name: (source["name"] as string) ?? id,
      version: (source["version"] as number) ?? 1,
      content: (source["content"] as Record<string, unknown>) ?? {},
    };
    this.cache.set(id, doc);
    return doc;
  }

  unload(id: string): void {
    this.cache.delete(id);
  }

  getAll(): RuntimeDocument[] {
    return Array.from(this.cache.values());
  }
}

export class PackageLoader {
  private packages = new Map<string, RuntimePackage>();

  async load(pkg: RuntimePackage): Promise<void> {
    this.packages.set(`${pkg.name}@${pkg.version}`, pkg);
  }

  get(name: string, version: string): RuntimePackage | undefined {
    return this.packages.get(`${name}@${version}`);
  }

  getAll(): RuntimePackage[] {
    return Array.from(this.packages.values());
  }

  unload(name: string, version: string): void {
    this.packages.delete(`${name}@${version}`);
  }
}

export class ModuleLoader {
  private modules = new Map<string, RuntimeModule>();

  register(module: RuntimeModule): void {
    this.modules.set(module.id, module);
  }

  async loadAll(): Promise<void> {
    await Promise.all(Array.from(this.modules.values()).map((m) => m.load()));
  }

  async unloadAll(): Promise<void> {
    await Promise.all(Array.from(this.modules.values()).map((m) => m.unload()));
  }

  get(id: string): RuntimeModule | undefined {
    return this.modules.get(id);
  }
}
