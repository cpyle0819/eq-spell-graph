/**
 * Migration 362: Add missing connects_to routes for 8 zones that had zero
 * route edges at all (issue #43 audit). Sourced from each zone's own
 * eqlwiki.com page ("Adjacent Zones" / "Traveling To and From" sections).
 *
 * Cobalt Scar's wiki page also names Siren's Grotto as adjacent, but that
 * zone doesn't exist in the graph yet -- skipped here rather than stubbing
 * it in without map/bestiary data; still missing until Siren's Grotto is
 * added as its own zone.
 *
 * Plane of Fear, Plane of Sky, and Plane of Mischief are the special-access
 * (Wizard Port) zones from issue #43's Wizard Port ask -- Plane of Mischief
 * picks up ordinary routes here (Cobalt Scar, Temple of Veeshan), but the
 * Wizard Port transport modeling itself is separate follow-up work.
 */

import { loadGraph } from "./_lib";

const { addEdge, save } = loadGraph(import.meta.dir);

function connectBidirectional(a: string, b: string): void {
  addEdge(a, b, "connects_to");
  addEdge(b, a, "connects_to");
}

connectBidirectional("zone:swamp-of-no-hope", "zone:east-cabilis");
connectBidirectional("zone:swamp-of-no-hope", "zone:field-of-bone");
connectBidirectional("zone:swamp-of-no-hope", "zone:firiona-vie");
connectBidirectional("zone:swamp-of-no-hope", "zone:trakanon-s-teeth");

connectBidirectional("zone:cobalt-scar", "zone:skyshrine");
connectBidirectional("zone:cobalt-scar", "zone:plane-of-mischief");

connectBidirectional("zone:temple-of-veeshan", "zone:plane-of-mischief");
connectBidirectional("zone:temple-of-veeshan", "zone:western-wastes");

connectBidirectional("zone:icewell-keep", "zone:thurgadin");

connectBidirectional("zone:sleeper-s-tomb", "zone:eastern-wastes");

connectBidirectional("zone:dreadlands", "zone:burning-wood");
connectBidirectional("zone:dreadlands", "zone:frontier-mountains");
connectBidirectional("zone:dreadlands", "zone:firiona-vie");
connectBidirectional("zone:dreadlands", "zone:karnor-s-castle");

connectBidirectional("zone:city-of-mist", "zone:emerald-jungle");

save();

console.log("Migration 362 complete.");
