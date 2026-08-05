/**
 * Migration 444 (issue #49, batch 3/N): Fletching's bow components -- 5 bow
 * staffs (Hickory/Elm/Ashwood/Oak/Darkwood; Shadewood is deliberately
 * excluded, see the Bow Recipes batch's own docblock), 3 strings (Hemp
 * Twine/Linen String/Silk String), 2 tools (Whittling Blade/Planing Tool),
 * and Standard Bow Cam -- plus every vendor eqlwiki lists selling each, per
 * issue #49's own "no capped subset" ask.
 *
 * This roster is a smaller, almost entirely distinct set of ~10 vendors
 * from the arrow-component roster (migration 443) -- only Argash and Tin
 * Merchant XI overlap between the two. Every vendor here except Sojan the
 * Sleepless (Iceclad Ocean) already existed in this graph by the time this
 * migration ran (added either pre-existing, or by migrations 442/443).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let npcsAdded = 0;
let sellsEdgesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", size: "Small", ...opts });
  itemsAdded++;
}

function addItemVendors(itemId: string, vendors: [string, string, string][]) {
  for (const [id, label, zoneId] of vendors) {
    if (!hasNode(id)) {
      addNode({ id, label, type: "npc", roles: ["vendor"] });
      addEdge(id, zoneId, "located_in");
      npcsAdded++;
    }
    addEdge(id, itemId, "sells");
    sellsEdgesAdded++;
  }
}

addItem("item:hickory-bow-staff", "Hickory Bow Staff", { weight: 4.0, size: "Large" });
addItem("item:elm-bow-staff", "Elm Bow Staff", { weight: 4.0, size: "Large" });
addItem("item:ashwood-bow-staff", "Ashwood Bow Staff", { weight: 4.0, size: "Large" });
addItem("item:oak-bow-staff", "Oak Bow Staff", { weight: 4.0, size: "Large" });
addItem("item:darkwood-bow-staff", "Darkwood Bow Staff", { weight: 4.0, size: "Large" });
addItem("item:hemp-twine", "Hemp Twine", { weight: 0.1 });
addItem("item:linen-string", "Linen String", { weight: 0.1 });
addItem("item:silk-string", "Silk String", { weight: 0.1 });
addItem("item:whittling-blade", "Whittling Blade", { weight: 0.1 });
addItem("item:planing-tool", "Planing Tool", { weight: 0.5 });
addItem("item:standard-bow-cam", "Standard Bow Cam", { weight: 0.3 });

const bowStaffVendors: [string, string, string][] = [
  ["npc:east-cabilis:klok-gogon", "Klok Gogon", "zone:east-cabilis"],
  ["npc:the-feerrott:fugla", "Fugla", "zone:the-feerrott"],
  ["npc:firiona-vie:jessica-winter", "Jessica Winter", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-sylnis", "Merchant Sylnis", "zone:greater-faydark"],
  ["npc:iceclad-ocean:sojan-the-sleepless", "Sojan the Sleepless", "zone:iceclad-ocean"],
  ["npc:neriak-commons:dianax-c-luzz", "Dianax C`Luzz", "zone:neriak-commons"],
  ["npc:surefall-glade:tonsia", "Tonsia", "zone:surefall-glade"],
  ["npc:rivervale:gerb-jinklebelly", "Gerb Jinklebelly", "zone:rivervale"],
  ["npc:thurgadin:argash", "Argash", "zone:thurgadin"],
];
const bowStaffVendorsWithFreeport: [string, string, string][] = [
  ...bowStaffVendors,
  ["npc:north-freeport:timor-strongbranch", "Timor Strongbranch", "zone:north-freeport"],
];

// Elm/Oak/Ashwood: 10 vendors (includes North Freeport); Hickory/Darkwood: 9 (no North Freeport)
addItemVendors("item:hickory-bow-staff", bowStaffVendors);
addItemVendors("item:elm-bow-staff", bowStaffVendorsWithFreeport);
addItemVendors("item:oak-bow-staff", bowStaffVendorsWithFreeport);
addItemVendors("item:ashwood-bow-staff", bowStaffVendorsWithFreeport);
addItemVendors("item:darkwood-bow-staff", bowStaffVendors);

// Hemp Twine/Linen String/Silk String/Standard Bow Cam: same roster as staffs plus North Freeport, minus Iceclad for the Cam
addItemVendors("item:hemp-twine", bowStaffVendorsWithFreeport);
addItemVendors("item:linen-string", bowStaffVendorsWithFreeport);
addItemVendors("item:silk-string", bowStaffVendorsWithFreeport);
addItemVendors("item:standard-bow-cam", [
  ["npc:east-cabilis:klok-gogon", "Klok Gogon", "zone:east-cabilis"],
  ["npc:the-feerrott:fugla", "Fugla", "zone:the-feerrott"],
  ["npc:firiona-vie:jessica-winter", "Jessica Winter", "zone:firiona-vie"],
  ["npc:north-freeport:timor-strongbranch", "Timor Strongbranch", "zone:north-freeport"],
  ["npc:greater-faydark:merchant-sylnis", "Merchant Sylnis", "zone:greater-faydark"],
  ["npc:neriak-commons:dianax-c-luzz", "Dianax C`Luzz", "zone:neriak-commons"],
  ["npc:surefall-glade:tonsia", "Tonsia", "zone:surefall-glade"],
  ["npc:rivervale:gerb-jinklebelly", "Gerb Jinklebelly", "zone:rivervale"],
  ["npc:thurgadin:argash", "Argash", "zone:thurgadin"],
]);

// Whittling Blade: staff roster minus North Freeport's Timor, plus Southern Desert of Ro's Smith Tv`ysa
addItemVendors("item:whittling-blade", [
  ...bowStaffVendors,
  ["npc:north-freeport:timor-strongbranch", "Timor Strongbranch", "zone:north-freeport"],
  ["npc:southern-desert-of-ro:smith-tv-ysa", "Smith Tv`ysa", "zone:southern-desert-of-ro"],
]);

// Planing Tool: same roster as Hickory/Darkwood Bow Staff
addItemVendors("item:planing-tool", bowStaffVendors);

save();
console.log(
  `Migration 444 complete: ${itemsAdded} items added, ${npcsAdded} new npc(s), ${sellsEdgesAdded} sells edges`
);
