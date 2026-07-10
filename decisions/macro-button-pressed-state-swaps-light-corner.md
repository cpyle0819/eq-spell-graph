# MacroButton's pressed state swaps which corner catches light

`.macro-btn:active` needs to read as physically depressed, the opposite of the raised default (top+right lit, bottom+left shadowed — see above). Since the button's "border" is really the `::before`(top+right)/`::after`(bottom+left) bevel pair, not a real CSS border, the fix swaps each pseudo-element to the *other one's* background-image/blend-mode on `:active` (top+right goes dark, bottom+left goes light), keeping each one's own `clip-path` so `.square` and non-square each still get their own inset/miter.

