import assert from "node:assert";
import { describe, it } from "node:test";
import { Scoreboard } from "../src/scoreboard";

describe("scoreboard tests", () => {
  it("start new match on the scoreboard", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
  });

  it("start new match on the scoreboard with the home team with invalid name", () => {
    const scoreboard = new Scoreboard();
    const awayTeam = "team B";
    assert.throws(
      () => scoreboard.startNewMatch("Invalid Name_", awayTeam),
      /Team name of home team is invalid/,
    );
    assert.throws(
      () => scoreboard.startNewMatch("a".repeat(1025), awayTeam),
      /Team name of home team is invalid/,
    );
  });

  it("start new match on the scoreboard with the away team with invalid name", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    assert.throws(
      () => scoreboard.startNewMatch(homeTeam, "Invalid Name_"),
      /Team name of away team is invalid/,
    );
    assert.throws(
      () => scoreboard.startNewMatch(homeTeam, "a".repeat(1025)),
      /Team name of away team is invalid/,
    );
  });

  it("start new match on the scoreboard with the same team as existing match", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
    assert.throws(
      () => scoreboard.startNewMatch(homeTeam, "team C"),
      /Team=.+ is already playing a match/,
    );
  });

  it("most recently added matches with same score are first on the scoreboard summary", () => {
    const scoreboard = new Scoreboard();
    const teamA = "team A";
    const teamB = "team B";
    const teamC = "team C";
    const teamD = "team D";
    scoreboard.startNewMatch(teamA, teamB);
    scoreboard.startNewMatch(teamC, teamD);
    const summary = scoreboard.getSummary();
    assert.equal(summary.length, 2);
    assert.equal(summary[0].homeTeamName, teamC);
    assert.equal(summary[0].awayTeamName, teamD);
    assert.equal(summary[1].homeTeamName, teamA);
    assert.equal(summary[1].awayTeamName, teamB);
    assert.equal(summary[0].homeTeamScore, 0);
    assert.equal(summary[0].awayTeamScore, 0);
    assert.equal(summary[1].homeTeamScore, 0);
    assert.equal(summary[1].awayTeamScore, 0);
  });

  it("update score of non-existing match", () => {
    const scoreboard = new Scoreboard();
    assert.throws(
      () => scoreboard.updateMatchScore("t", "c", 1, 1),
      /Match between homeTeam=.+ and awayTeam=.+ does not exist on the scoreboard/,
    );
  });

  it("match goals cannot be updated to a non-integer number", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
    assert.throws(
      () => scoreboard.updateMatchScore(homeTeam, awayTeam, 1.1, 1),
      /Score of .+ must be a valid integer number/,
    );
  });

  it("match goals cannot be updated to a lower number", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
    assert.throws(
      () => scoreboard.updateMatchScore(homeTeam, awayTeam, -1, 1),
      /New score of .+ cannot be smaller than current score/,
    );
  });

  it("finish a non-existing match throws", () => {
    const scoreboard = new Scoreboard();
    assert.throws(
      () => scoreboard.finishMatch("t", "c"),
      /Match between homeTeam=.+ and awayTeam=.+ does not exist on the scoreboard/,
    );
  });

  it("finish a already finished match throws", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
    scoreboard.finishMatch(homeTeam, awayTeam);
    assert.throws(
      () => scoreboard.finishMatch(homeTeam, awayTeam),
      /Match between homeTeam=.+ and awayTeam=.+ does not exist on the scoreboard/,
    );
  });

  it("update score of a already finished match throws", () => {
    const scoreboard = new Scoreboard();
    const homeTeam = "team A";
    const awayTeam = "team B";
    scoreboard.startNewMatch(homeTeam, awayTeam);
    scoreboard.finishMatch(homeTeam, awayTeam);
    assert.throws(
      () => scoreboard.updateMatchScore(homeTeam, awayTeam, 1, 1),
      /Match between homeTeam=.+ and awayTeam=.+ does not exist on the scoreboard/,
    );
  });

  it("team that finished a match can start another match", () => {
    const scoreboard = new Scoreboard();
    const teamA = "team A";
    const teamB = "team B";
    const teamC = "team C";
    scoreboard.startNewMatch(teamA, teamB);
    scoreboard.finishMatch(teamA, teamB);
    scoreboard.startNewMatch(teamA, teamC);
  });

  it("add matches update scores and check scores", () => {
    const scoreboard = new Scoreboard();
    const teamA = "team A";
    const teamB = "team B";
    const teamC = "team C";
    const teamD = "team D";
    const teamE = "team E";
    const teamF = "team F";
    const teamG = "team G";
    const teamH = "team H";
    const teamI = "team I";
    const teamJ = "team J";
    scoreboard.startNewMatch(teamA, teamB);
    scoreboard.startNewMatch(teamC, teamD);
    scoreboard.startNewMatch(teamE, teamF);
    scoreboard.startNewMatch(teamG, teamH);
    scoreboard.startNewMatch(teamI, teamJ);
    scoreboard.updateMatchScore(teamA, teamB, 0, 5);
    scoreboard.updateMatchScore(teamC, teamD, 10, 2);
    scoreboard.updateMatchScore(teamE, teamF, 2, 2);
    scoreboard.updateMatchScore(teamG, teamH, 6, 6);
    scoreboard.updateMatchScore(teamI, teamJ, 3, 1);

    const summary = scoreboard.getSummary();
    assert.equal(summary.length, 5);
    assert.equal(summary[0].homeTeamName, teamG);
    assert.equal(summary[0].awayTeamName, teamH);
    assert.equal(summary[0].homeTeamScore, 6);
    assert.equal(summary[0].awayTeamScore, 6);
    assert.equal(summary[1].homeTeamName, teamC);
    assert.equal(summary[1].awayTeamName, teamD);
    assert.equal(summary[1].homeTeamScore, 10);
    assert.equal(summary[1].awayTeamScore, 2);
    assert.equal(summary[2].homeTeamName, teamA);
    assert.equal(summary[2].awayTeamName, teamB);
    assert.equal(summary[2].homeTeamScore, 0);
    assert.equal(summary[2].awayTeamScore, 5);
    assert.equal(summary[3].homeTeamName, teamI);
    assert.equal(summary[3].awayTeamName, teamJ);
    assert.equal(summary[3].homeTeamScore, 3);
    assert.equal(summary[3].awayTeamScore, 1);
    assert.equal(summary[4].homeTeamName, teamE);
    assert.equal(summary[4].awayTeamName, teamF);
    assert.equal(summary[4].homeTeamScore, 2);
    assert.equal(summary[4].awayTeamScore, 2);

    scoreboard.finishMatch(teamA, teamB);
    scoreboard.finishMatch(teamC, teamD);
    scoreboard.finishMatch(teamE, teamF);
    scoreboard.finishMatch(teamG, teamH);
    scoreboard.finishMatch(teamI, teamJ);
  });
});
