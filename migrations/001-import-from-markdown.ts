/**
 * Parses eq_shaman_spells.md and generates a Cytoscape-compatible graph JSON.
 *
 * Node types: spell, vendor, zone
 * Edge types: sells (vendor -> spell), located_in (vendor -> zone)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

interface CyNode {
  data: {
    id: string;
    label: string;
    type: "spell" | "vendor" | "zone";
    level?: number;
  };
}

interface CyEdge {
  data: {
    id: string;
    source: string;
    target: string;
    type: "sells" | "located_in";
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseSpellsFile(text: string) {
  const nodes = new Map<string, CyNode>();
  const edges: CyEdge[] = [];
  const edgeSet = new Set<string>();

  let currentSpell: string | null = null;
  let currentLevel = 0;
  let currentZone: string | null = null;

  for (const line of text.split("\n")) {
    const spellMatch = line.match(/^## (.+?) \(Level (\d+)\)/);
    if (spellMatch) {
      currentSpell = spellMatch[1];
      currentLevel = parseInt(spellMatch[2], 10);
      currentZone = null;

      const spellId = `spell:${slugify(currentSpell)}`;
      if (!nodes.has(spellId)) {
        nodes.set(spellId, {
          data: {
            id: spellId,
            label: currentSpell,
            type: "spell",
            level: currentLevel,
          },
        });
      }
      continue;
    }

    const zoneMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (zoneMatch) {
      currentZone = zoneMatch[1];
      const zoneId = `zone:${slugify(currentZone)}`;
      if (!nodes.has(zoneId)) {
        nodes.set(zoneId, {
          data: { id: zoneId, label: currentZone, type: "zone" },
        });
      }
      continue;
    }

    const vendorMatch = line.match(/^- (.+)$/);
    if (vendorMatch && currentSpell && currentZone) {
      const vendorLabel = vendorMatch[1];
      const vendorId = `vendor:${slugify(currentZone)}:${slugify(vendorLabel)}`;

      if (!nodes.has(vendorId)) {
        nodes.set(vendorId, {
          data: { id: vendorId, label: vendorLabel, type: "vendor" },
        });
      }

      // Edge: vendor sells spell
      const sellsKey = `${vendorId}->sells->${`spell:${slugify(currentSpell)}`}`;
      if (!edgeSet.has(sellsKey)) {
        edgeSet.add(sellsKey);
        edges.push({
          data: {
            id: `e-sells-${edges.length}`,
            source: vendorId,
            target: `spell:${slugify(currentSpell)}`,
            type: "sells",
          },
        });
      }

      // Edge: vendor located_in zone
      const zoneId = `zone:${slugify(currentZone)}`;
      const locKey = `${vendorId}->located_in->${zoneId}`;
      if (!edgeSet.has(locKey)) {
        edgeSet.add(locKey);
        edges.push({
          data: {
            id: `e-loc-${edges.length}`,
            source: vendorId,
            target: zoneId,
            type: "located_in",
          },
        });
      }
    }
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}

const inputPath = resolve(import.meta.dir, "../../../../eq_shaman_spells.md");
const outputDir = resolve(import.meta.dir, "../data");
mkdirSync(outputDir, { recursive: true });

const text = readFileSync(inputPath, "utf-8");
const graph = parseSpellsFile(text);

const stats = {
  spells: graph.nodes.filter((n) => n.data.type === "spell").length,
  vendors: graph.nodes.filter((n) => n.data.type === "vendor").length,
  zones: graph.nodes.filter((n) => n.data.type === "zone").length,
  edges: graph.edges.length,
};

writeFileSync(
  resolve(outputDir, "graph.json"),
  JSON.stringify(graph, null, 2)
);

console.log("Graph generated:");
console.log(`  Spells: ${stats.spells}`);
console.log(`  Vendors: ${stats.vendors}`);
console.log(`  Zones: ${stats.zones}`);
console.log(`  Edges: ${stats.edges}`);
console.log(`  Written to: ${resolve(outputDir, "graph.json")}`);
