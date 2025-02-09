import { Scoreboard } from "./src/scoreboard";

const scoreboard = new Scoreboard();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto");
const uuids = [];
const randoms = [];
for (let i = 0; i < 2000; i++) {
  uuids.push(crypto.randomUUID().replaceAll("-", " "));
  randoms.push();
}

const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  scoreboard.startNewMatch(uuids[i * 2], uuids[i * 2 + 1]);
}
const timeAfterMatchStarts = performance.now();

const summary = scoreboard.getSummary();
for (let i = 0; i < summary.length; i++) {
  const match = summary[i];
  scoreboard.updateMatchScore(
    match.homeTeamName,
    match.awayTeamName,
    Math.floor(Math.random() * 10000),
    Math.floor(Math.random() * 10000),
  );
}
const timeAfterScoreboardUpdate = performance.now();

for (let i = 0; i < 10000; i++) {
  scoreboard.getSummary();
}
const timeAfterSummary = performance.now();

for (let i = 0; i < summary.length; i++) {
  const match = summary[i];
  scoreboard.finishMatch(match.homeTeamName, match.awayTeamName);
}
const timeAfterFinishMatches = performance.now();

console.log(
  `Match start time: ${timeAfterMatchStarts - startTime}ms\nUpdate score time: ${timeAfterScoreboardUpdate - timeAfterMatchStarts}ms\nSummary time: ${timeAfterSummary - timeAfterScoreboardUpdate}ms\nFinish time: ${timeAfterFinishMatches - timeAfterSummary}ms\nTotal time: ${timeAfterSummary - startTime}ms`,
);
