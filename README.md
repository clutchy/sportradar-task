# Live Football World Cup Score Board Library

A scoreboard library for managing live matches and their scores. The library keeps track of the match scores in-memory and it can update the scores and retrieve the score with high performance.

## Getting Started

Copy the [src/scoreboard.ts](src/scoreboard.ts) into your project and use it to track the match scores.

```
const scoreboard = new Scoreboard();
const teamA = "team A";
const teamB = "team B";
scoreboard.startNewMatch(teamA, teamB);
scoreboard.updateMatchScore(teamA, teamB, 0, 5);

const summary = scoreboard.getSummary();
scoreboard.finishMatch(teamA, teamB);
```

## Development

To compile Typescript to Javascript in watch mode run `npm run watch`.

Run tests using `npm run test` command.

## Assumptions

- The goals cannot be disallowed after they have been added to the scoreboard (goal count can only increase)
- Maximum team name length is 1024 characters
- Team name can only contain letters, numbers and spaces
- Maximum number of goals in a single increment is not limited

## Caveats

In the commit (6b008cdc1e7792d3f9b6d45f150318d4a5050028) a performance enhancement was added for fetching the scoreboard summary, this performance enhancement only improves the summary operation performance, but it makes the other operations slower.

