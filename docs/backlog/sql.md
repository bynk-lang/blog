---
slug: sql
series: the-problem-with
workingTitle: "The column that only fails in production"
level: building
showcase: sql-databases
tags: [data, security, errors]
status: ready
pr:
published:
video: none
---

## Brief

For developers who write SQL by hand in a service. Queries built from strings
invite injection, and a misspelt column waits quietly for the first real
request. The reader leaves knowing how Bynk checks every statement against the
migrations at compile time, reads rows into typed records, and what that
check can't see.

## Hook

The deploy went fine, the tests passed, and the first customer to open their
reading list gets a 500: `no such column: finshed`. Every test used a mock.

## Outline

### The problem

- Two failures of SQL in strings: injection, when request data is spliced
  in; and drift, when a statement and the schema disagree and nothing notices
  until it runs.
- A third, quieter one: the row comes back as an untyped object, and the
  code trusts its shape.

### How it's usually handled

- Parameterised queries (by discipline), query builders and ORMs (Knex,
  Prisma, Drizzle), and compile-time checked SQL (sqlx in Rust, sqlc in Go).
  Treat each with respect; sqlx is the closest relative and deserves a fair
  description.
- Where each stops short: discipline lapses; builders hide the SQL; checked
  SQL often needs a live database at build time.

### Bynk's answer

- Every statement is a literal, so request data reaches it only as a bound
  parameter; a variable is `bynk.types.sql_not_literal`.
- `bynk check` applies `migrations/` to an empty SQLite and prepares every
  statement against it: `bynk.d1.sql_invalid`, `bynk.d1.sql_param_count`,
  `bynk.d1.select_field_missing`, as compile errors.
- `select[Book]` and `firstAs[Book]` write the column list from the record,
  so it's never spelt twice.
- Failure is a value: `Constraint` for a broken key, and a `Sql` or `Decode`
  error for a read, each with its own type.
- The migration repeats the record's refinements as `CHECK`s, so no writer can
  store a row the record would refuse.

### The trade-offs

- The check sees the migrations, not the live database: a database that has
  drifted still fails at run time (as a `Decode` or `Sql` error).
- Every statement must be a literal, so dynamic queries (an optional filter,
  a sort column chosen by the user) need a different shape.
- D1 is SQLite: say what that means for types (no boolean; `0` and `1`).

### See it working

- `bynk test .` runs against a real in-memory SQLite with the migration
  applied; `bynk dev` and the README's `curl` lines.
- End on the column: misspelt, it's a red line in the editor, not a 500.

## Code to quote

- `src/shelf/library.bynk`: the tagged `INSERT` with four bound parameters and
  its `Constraint` arm; the `select[Book]` read with the `Sql` and `Decode`
  arms.
- `migrations/shelf-library-books/0001_create_books.sql` is SQL, not Bynk:
  quote it in a ` ```sql ` block if needed (not checked by CI).
- `tests/shelf/library.bynk`: the case that writes a zero-page book and gets
  `Constraint`.

## Facts to check

- sqlx's and sqlc's compile-time checking: what each needs at build time
  (sqlx's offline mode, for instance).
- What D1 and SQLite `STRICT` tables enforce.
- How the editor shows `bynk.d1.sql_invalid` (a screenshot would help, but
  isn't required).

## Sources

- Book: [Query rows into a record](https://bynk-lang.org/book/guides/effects-and-capabilities/query-rows-into-a-record/)
- Book: [SQL databases: `D1`](https://bynk-lang.org/reference/bynk-capabilities/#sql-databases-d1) and its schema migrations section
- Showcase README: `sql-databases`

## Video angle

A statement written on a card is held up against a stencil of the schema; a
misspelt column doesn't fit and lights up before the card ever leaves the
desk. About 2:30.

1. Title
2. The 500 on the first real request
3. Injection and drift
4. The usual answers
5. Literal SQL only
6. Checked against the migrations
7. Rows into records
8. Failure as a value
9. The trade-offs: a drifted database
10. Close
