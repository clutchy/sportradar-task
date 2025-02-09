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

  public toString(): string {
    return `sequenceNum=${this.sequenceNum} homeTeamName=${this.homeTeam.name} homeTeamScore=${this.homeTeam.score} awayTeamName=${this.awayTeam.name} awayTeamScore=${this.awayTeam.score}`;
  }
}

export class Scoreboard {
  private sequenceCounter: number;
  private teamToMatchMapping: Record<string, Match>;
  private matches: Match[];
  private readonly MAX_TEAM_NAME_LEN = 1024;

  constructor() {
    this.sequenceCounter = 0;
    this.teamToMatchMapping = {};
    this.matches = [];
  }

  public startNewMatch(homeTeamName: string, awayTeamName: string): Match {
    this.validateTeam(homeTeamName, "home team");
    this.validateTeam(awayTeamName, "away team");
    const match = new Match(this.sequenceCounter++, homeTeamName, awayTeamName);
    this.teamToMatchMapping[homeTeamName] = match;
    this.teamToMatchMapping[awayTeamName] = match;
    this.matches.push(match);
    return match;
  }

  public updateMatchScore(
    homeTeamName: string,
    awayTeamName: string,
    homeTeamScore: number,
    awayTeamScore: number,
  ) {
    const match = this.matches.find(
      (match) =>
        match.homeTeam.name === homeTeamName &&
        match.awayTeam.name === awayTeamName,
    );
    if (!match) {
      throw new Error(
        `Match between homeTeam=${homeTeamName} and awayTeam=${awayTeamName} does not exist on the scoreboard`,
      );
    }

    this.validateScore(homeTeamScore, match.homeTeam.score, "home team");
    this.validateScore(awayTeamScore, match.awayTeam.score, "away team");
    match.homeTeam.score = homeTeamScore;
    match.awayTeam.score = awayTeamScore;
  }

  public finishMatch(homeTeamName: string, awayTeamName: string) {
    const index = this.matches.findIndex(
      (match) =>
        match.homeTeam.name === homeTeamName &&
        match.awayTeam.name === awayTeamName,
    );
    if (index < 0) {
      throw new Error(
        `Match between homeTeam=${homeTeamName} and awayTeam=${awayTeamName} does not exist on the scoreboard`,
      );
    }

    delete this.teamToMatchMapping[homeTeamName];
    delete this.teamToMatchMapping[awayTeamName];
    this.matches.splice(index, 1);
  }

  public getSummary(): MatchInfo[] {
    this.matches.sort((a, b) => {
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
    });

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
