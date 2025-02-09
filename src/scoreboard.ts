interface MatchInfo {
  homeTeamName: string;
  homeTeamScore: number;
  awayTeamName: string;
  awayTeamScore: number;
}

class MatchTeam {
  private _name: string;
  private _score: number;

  constructor(teamName: string) {
    this._name = teamName;
    this._score = 0;
  }

  public get name(): string {
    return this._name;
  }

  public get score(): number {
    return this._score;
  }

  public set score(value: number) {
    this._score = value;
  }
}

class Match {
  private _sequenceNum: number;
  private _homeTeam: MatchTeam;
  private _awayTeam: MatchTeam;

  constructor(sequenceNum: number, homeTeamName: string, awayTeamName: string) {
    this._sequenceNum = sequenceNum;
    this._homeTeam = new MatchTeam(homeTeamName);
    this._awayTeam = new MatchTeam(awayTeamName);
  }

  public get sequenceNum(): number {
    return this._sequenceNum;
  }

  public get homeTeam(): MatchTeam {
    return this._homeTeam;
  }

  public get awayTeam(): MatchTeam {
    return this._awayTeam;
  }

  public getTotalScore(): number {
    return this.homeTeam.score + this.awayTeam.score;
  }

  public getHash(): string {
    return `${this.homeTeam.name}_${this.awayTeam.name}`;
  }

  public static getHashFromNames(
    homeTeamName: string,
    awayTeamName: string,
  ): string {
    return `${homeTeamName}_${awayTeamName}`;
  }

  public toString(): string {
    return `sequenceNum=${this.sequenceNum} homeTeamName=${this.homeTeam.name} homeTeamScore=${this.homeTeam.score} awayTeamName=${this.awayTeam.name} awayTeamScore=${this.awayTeam.score}`;
  }
}

export class Scoreboard {
  private sequenceCounter: number;
  private teamToMatchMapping: Record<string, Match>;
  private matchIndexMapping: Record<string, number>;
  private matches: Match[];
  private readonly MAX_TEAM_NAME_LEN = 1024;

  constructor() {
    this.sequenceCounter = 0;
    this.teamToMatchMapping = {};
    this.matchIndexMapping = {};
    this.matches = [];
  }

  public startNewMatch(homeTeamName: string, awayTeamName: string): Match {
    this.validateTeam(homeTeamName, "home team");
    this.validateTeam(awayTeamName, "away team");
    const match = new Match(this.sequenceCounter++, homeTeamName, awayTeamName);
    this.teamToMatchMapping[homeTeamName] = match;
    this.teamToMatchMapping[awayTeamName] = match;
    this.matchIndexMapping[match.getHash()] = this.matches.length;
    this.matches.push(match);
    this.bubbleUpMatch(this.matches.length - 1);
    return match;
  }

  public updateMatchScore(
    homeTeamName: string,
    awayTeamName: string,
    homeTeamScore: number,
    awayTeamScore: number,
  ) {
    const index =
      this.matchIndexMapping[
      Match.getHashFromNames(homeTeamName, awayTeamName)
      ];
    if (index === undefined) {
      throw new Error(
        `Match between homeTeam=${homeTeamName} and awayTeam=${awayTeamName} does not exist on the scoreboard`,
      );
    }

    const match = this.matches[index];
    this.validateScore(homeTeamScore, match.homeTeam.score, "home team");
    this.validateScore(awayTeamScore, match.awayTeam.score, "away team");
    match.homeTeam.score = homeTeamScore;
    match.awayTeam.score = awayTeamScore;
    this.bubbleUpMatch(index);
  }

  public finishMatch(homeTeamName: string, awayTeamName: string) {
    const index =
      this.matchIndexMapping[
      Match.getHashFromNames(homeTeamName, awayTeamName)
      ];
    if (index === undefined) {
      throw new Error(
        `Match between homeTeam=${homeTeamName} and awayTeam=${awayTeamName} does not exist on the scoreboard`,
      );
    }

    const match = this.matches[index];
    delete this.teamToMatchMapping[homeTeamName];
    delete this.teamToMatchMapping[awayTeamName];
    delete this.matchIndexMapping[match.getHash()];
    for (let i = index + 1; i < this.matches.length; i++) {
      const followingMatch = this.matches[i];
      this.matchIndexMapping[followingMatch.getHash()]--;
    }
    this.matches.splice(index, 1);
  }

  private bubbleUpMatch(matchIndex: number) {
    if (matchIndex === 0) return;
    const match = this.matches[matchIndex];
    for (let i = matchIndex - 1; i >= 0; i--) {
      const nextMatch = this.matches[i];
      if (this.compareMatches(match, this.matches[i]) === -1) {
        this.matches[i + 1] = nextMatch;
        this.matchIndexMapping[nextMatch.getHash()]++;
      } else {
        this.matches[i + 1] = match;
        this.matchIndexMapping[match.getHash()] = i + 1;
        return;
      }
    }

    this.matchIndexMapping[match.getHash()] = 0;
    this.matches[0] = match;
  }

  private compareMatches(a: Match, b: Match): number {
    if (a.getTotalScore() > b.getTotalScore()) {
      return -1;
    } else if (a.getTotalScore() < b.getTotalScore()) {
      return 1;
    }
    if (a.sequenceNum > b.sequenceNum) {
      return -1;
    }
    if (a.sequenceNum < b.sequenceNum) {
      return 1;
    }
    throw new Error(
      `Unexpected scoreboard state matchA=(${a.toString()}), matchB=(${b.toString()})`,
    );
  }

  public getSummary(): MatchInfo[] {
    return this.matches.map((match) => ({
      homeTeamName: match.homeTeam.name,
      homeTeamScore: match.homeTeam.score,
      awayTeamName: match.awayTeam.name,
      awayTeamScore: match.awayTeam.score,
    }));
  }

  private validateTeamName(teamName: string, errString: string) {
    if (
      typeof teamName !== "string" ||
      teamName.length > this.MAX_TEAM_NAME_LEN ||
      !/^[a-zA-Z ]+$/.test(teamName)
    ) {
      throw new Error(`Team name of ${errString} is invalid`);
    }
  }

  private validateTeam(teamName: string, errString: string) {
    this.validateTeamName(teamName, errString);

    const teamMatch = this.teamToMatchMapping[teamName];
    if (teamMatch) {
      throw new Error(
        `Team=${teamName} is already playing a match=(${teamMatch.toString()})`,
      );
    }
  }

  private validateScore(
    newScore: number,
    currentScore: number,
    errString: string,
  ) {
    if (!Number.isSafeInteger(newScore)) {
      throw new Error(`Score of ${errString} must be a valid integer number`);
    }
    if (newScore < currentScore) {
      throw new Error(
        `New score of ${errString} cannot be smaller than current score`,
      );
    }
  }
}
