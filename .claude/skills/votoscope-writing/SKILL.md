---
name: votoscope-writing
description: |
  How to write for Votoscope, in French and in English: posts, site pages, dashboard text,
  methodology, figure captions and code comments. Use whenever you write or correct prose or
  comments in this project, and before handing any text back to the author. Covers clarity
  (explain the mechanism, define every term, one idea per sentence), numbers, French and English
  typography, the scientific register of the dashboards, and what Claude may and may not write in
  the author's posts. Works with the humanizer skill, which removes AI writing patterns.
---

# Writing for Votoscope

Votoscope publishes election forecasts and posts about elections, in French and in English. Its
readers are curious but are not political scientists or statisticians. The author writes the posts
and must be able to read, understand and correct every sentence Claude produces. A sentence the
author cannot correct is a failed sentence, however accurate it is.

## Who writes what

- **Posts** (`posts/<lang>/<slug>/source.js`) are written by the author. Claude does not write
  their prose. Claude may write:
  - notes for the author (`// À écrire : …` or `// To write: …`), listing points and figures, not sentences to paste;
  - figure captions and table column names;
  - code and code comments;
  - corrections the author asked for, applied to the author's sentences with as few changed words as
    possible, and listed in the reply (before and after) so the author can review them.
- **Site pages, dashboards and methodology** may be written by Claude, in the scientific register
  below, in both languages.
- Never reword the author's text "while you are at it". Flag instead.

## State the fact directly

Write the fact with its real subject, in the shortest true sentence. No run-up, no announcement,
no colon that sets up what follows.

- Bad: « L'Allemagne est la plus haute du groupe, pour une raison simple : un parti doit y obtenir
  au moins 5 % des votes pour avoir des sièges. »
- Good: « En Allemagne, un parti ne peut accéder à l'assemblée que s'il obtient au moins 5 % des
  votes. »

The bad version puts a ranking first, announces a reason, then gives the fact with "y" pointing
back. The good version starts where the fact happens and says it once.

Patterns to remove on sight:

- announcing a reason or a point: « pour une raison simple : », « on part d'un constat : »,
  « le fait est que », « il faut savoir que », "here's why:";
- a subject set up then repeated: « Le Québec, lui, … », « Les États-Unis sont aussi en bas, même
  s'ils… »;
- describing the figure when the sentence should describe the world: « X est le plus haut du
  groupe » when the point is why X is high;
- a colon or « donc » joining two sentences that each stand alone;
- a caption that narrates the chart (« Chaque flèche part de… et pointe vers… ») when a short
  legend says it (« Point : sièges obtenus. Pointe : sièges à la proportionnelle. »).

When a sentence is longer than the fact it carries, cut until it is not.

## Name institutions and rules precisely

Never compare loosely (« votent comme nous », « un système semblable », "like us"). Name the
institution and the rule: which chamber, which election, which jurisdiction, which threshold.

- Bad: « Les États-Unis votent comme nous. »
- Good: « Pour la Chambre des représentants des États-Unis, la plupart des États élisent une
  personne par circonscription, comme au Québec. »
- Bad: « accéder à l'assemblée » for Germany. Good: « obtenir des sièges au Bundestag ».

Countries often use several systems at once (one per chamber, per level of government, per state).
Say which one the figure or the claim is about, and say when a rule has exceptions.

## Explain, do not assert

Every claim carries its mechanism. A reader must be able to answer "why?" from the sentence itself.

- Bad: « l'indice dépend du seuil d'entrée et de la taille des circonscriptions ».
- Good: « Un parti doit obtenir au moins 5 % des votes pour avoir des sièges. Les votes des partis
  sous cette barre n'élisent personne, et l'indice monte. »

Define every technical term the first time, in plain words, or avoid it. Terms that need a
definition here include: seuil, circonscription plurinominale (« une circonscription qui élit
plusieurs personnes »), indice de Gallagher, médoïde, intervalle à 90 %, log-ratio, pouvoir de pivot,
scrutin uninominal majoritaire à un tour. If a term is not needed to follow the point, drop it.

Watch words with two everyday meanings. « Siège » can be read as furniture: say « député.es »,
« élu.es » or « circonscriptions » in general text; keep « sièges » in charts and methodology where
the context is clear. « Taille d'une circonscription » means population to most readers: if you mean
the number of seats it elects, say that.

## Sentences

- One idea per sentence. Subject, verb, complement.
- Short sentences, with some variation. If a sentence needs a semicolon, make two sentences.
- No lists inside parentheses. No chains of clauses joined by colons.
- Say why a number is there: what it shows, compared with what.
- Prefer the concrete case to the general rule: « En 2025, deux partis sont restés juste sous
  5 %. » before « Les seuils excluent des partis. »

## Numbers

- In prose, round and drop decimals: « environ 14 % », « 1 sur 34 000 », « près de 60 ans ». In
  French, the decimal comma collides with the punctuation; in both languages, decimals in prose
  suggest a precision the reader does not need. Keep decimals in tables, figures and methodology.
- Give the comparison point with the number: « 13 % des votes et aucun siège », not « 13 % ».
- Probabilities as « 1 sur N » / "1 in N" for small values, percentages otherwise.
- Avoid acronyms where a reader could stumble. Spell out the first time: « Parti québécois (PQ) ».
  Party acronyms in charts are fine.

## French

- Guillemets « » with non-breaking spaces inside. This overrides humanizer's rule on curly quotes.
- Non-breaking space before « : », « ? », « ! » and « % ». Thin or regular non-breaking spaces as
  thousands separators: « 34 000 ».
- Gender-inclusive forms with a regular period: « élu.es », « candidat.es », « député.es ». No
  middle dot: it is not on the keyboard. (In Notebook Kit markdown, write `élu\.es` if a form turns
  into a link.)
- Posts address the reader as « tu », consistently. Site pages use no direct address.
- Official names in full: « Directeur général des élections du Québec », « Élections Québec ».

## English

- Canadian spelling, as on the site: favourite, colour, centre.
- Party acronyms as used in English media: LPC, CPC, NDP, BQ, GPC; for Quebec, QLP and CPQ.
- Same rules on rounding, mechanisms and definitions.

## Scientific register (dashboards, methodology, figure captions)

From the project's CLAUDE.md, non-negotiable:

- Describe the model as it runs. No history of its development, no debugging story, no comparison
  with an earlier version ("previously", "was replaced", "found by the review").
- Impersonal and plain: the method, the formula, the source, the validation figure.
- No em dash (—), no bold in displayed text.
- Figures cited (coverage, R², counts) must match the model in production.
- The development log belongs in TODO.md and commit messages, nowhere else.

## Figure captions

One or two sentences: what the figure shows, then how to read it (what a point, an arrow, a dashed
line means). Include the one or two numbers the reader should take away. No method details: those
go in a note.

## Code comments

- One line saying what the block does, in plain words. Two lines at most.
- No theory, no derivation, no history. Method details go in a single note at the end of the post,
  or in the README.
- Name things in the comment the way the code names them.
- Example. Bad: « Approximation à deux candidats : l'écart suit une loi normale de moyenne m et
  d'écart-type s ; la densité en zéro divisée par N donne… ». Good:
  ```js
  // Chance qu'un seul vote change le gagnant de chaque circonscription en 2030.
  ```
- Code identifiers and comments in the site's code are in English; code inside a French post may
  be commented in French, the post's language.

## Before handing text back

1. Reread each sentence and ask: would a reader who does not know the subject understand it? Could
   the author correct it without asking what it means? Does it add a fact the reader did not have?
   Rewrite or cut any sentence that fails.
2. Check numbers: rounded in prose, comparison point given, consistent with the data.
3. Run the humanizer skill's checks on the prose (§1 contrasts, §2 closers, §6 triads, §8 dashes,
   §12 to §17 inflation), with the French guillemets exception above. For the author's voice, use the
   author's own paragraphs as the sample: the opening of
   `posts/fr/un-mode-de-scrutin-distordu/source.js` for French posts.
4. In the reply, list what you changed in the author's text, before and after.
