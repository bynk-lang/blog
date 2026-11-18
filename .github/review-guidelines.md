# Review guidelines for the Bynk blog

These are the maintainers' notes for reviewing a pull request here. Most pull
requests add or change a post. A post is read by newcomers and by experienced
developers deciding whether to trust Bynk, so it's judged as writing as well
as content.

Skip what CI already enforces: the site builds (`astro build`), and every
` ```bynk ` block matches the showcase project the post names.

## What matters most

- **The five-part shape.** A *The Problem With…* post has the problem, how
  it's usually handled, Bynk's answer, the trade-offs, and where to see it
  working. See [docs/writing-a-post.md](../docs/writing-a-post.md).
- **Accuracy.** Flag any claim about Bynk that the Book or the showcase
  doesn't support, and any claim about another language that could be wrong.
  Experienced readers check these first.
- **Honest trade-offs.** Flag a trade-offs section that is vague, or that
  presents a cost as a benefit.
- **Tone.** Warm and confident, never smug. Flag lines that mock another
  language or its users.
- **Jargon.** Flag a term a newcomer won't know that isn't explained where it
  first appears.
- **British English**, and the frontmatter fields in writing-a-post.md,
  including a `level` that matches who the post is really for.

## What to leave alone

- Prose choices that are a matter of taste, when the meaning is clear.
- The site's code and workflows, unless the change touches them.
