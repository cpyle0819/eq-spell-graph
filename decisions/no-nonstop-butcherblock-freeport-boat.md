# There is no non-stop Butcherblock<->Freeport boat

Migration 014 removed a direct `connects_to` edge between Butcherblock Mountains and East Freeport. Per eqlwiki.com/Ocean_of_Tears, that boat makes real stops at two islands inside Ocean of Tears (Zachariah Reigh Isle, then Sister Isle) — actual zone transitions, not a pass-through. The only route between them is via Ocean of Tears (two boat hops), which migration 010 already models. Worth remembering when auditing other "direct" boat edges: a boat connecting two named zones doesn't necessarily mean the trip is non-stop — check the wiki's actual route description, not just whether an edge exists.

