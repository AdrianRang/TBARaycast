import { ActionPanel, Action, List, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from "axios";


const API_KEY = "4FmWpc7JdnQpxdAmng6DVVQ8MMuD9qtIzU6T7auUQViDt6ZJK3v28SIbwurR2J7n";
const TEAM_LIMIT = 50;


async function getAllTeamNumbersPromise() {
  console.debug("Fetching team numbers...");
  let teamNumbers: string[] = [];
  for (let i = 0; i < 1; i++) {
    console.debug(`Fetching team numbers for page ${i}...`);
    const response = axios.get(`https://www.thebluealliance.com/api/v3/teams/${i}/keys`, {
      headers: {
        'X-TBA-Auth-Key': API_KEY
      }
    });
    await response.then((response) => {
      response.data.forEach((teamNumber: string, i: number) => {
        if (i > TEAM_LIMIT) return;
        teamNumbers.push(teamNumber.replace("frc", ""));
      });
      console.debug(`Found ${teamNumbers.length} team numbers.`);
    });
    console.debug(`Team numbers: ${teamNumbers}`);
    return teamNumbers;
  }
}

let tm = getAllTeamNumbersPromise()
function getAllTeamNumbers() {
  let n = (tm).then((teamNumbers) => {
    return teamNumbers as string[];
  });
  let teamNumbers = [] as string[];
  n.then((teamNumbers) => {
    teamNumbers.forEach((teamNumber) => {
      teamNumbers.push(teamNumber);
    });
  });
  console.debug("success")
  return teamNumbers;
}


async function getTeamName(teamNumber: string): Promise<string> {
  try {
    const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`, {
      headers: {
        'X-TBA-Auth-Key': API_KEY
      }
    });
    return response.data.nickname;
  } catch (error) {
    console.error(`Failed to get team name for team ${teamNumber}:`, error);
    return "Unknown";
  }
}


export default function Command() {
  const [teamNumbers, setTeamNumbers] = useState<string[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  useEffect(() => {
    // Fetch team numbers and update state
    const fetchTeamNumbers = async () => {
      const teamNumbersPromise = await getAllTeamNumbersPromise();
      const numbers = await Promise.all((teamNumbersPromise ?? []).map((teamNumber) => teamNumber));
      console.debug("numbers: ", numbers);
      setTeamNumbers(numbers);
    };
    fetchTeamNumbers();

    // Fetch team names and update state
    const fetchTeamNames = async () => {
      const names = await Promise.all((await (teamNumbers)).map((teamNumber) => getTeamName(teamNumber)));
      setTeamNames(names);
    };

    fetchTeamNames();
  }, []); // Run effect only once on component mount

  // console.debug("teamNames: ", teamNames);
  return (
    <List>
      <List.Item
        icon="list-icon.png"
        title="All Teams"
        subtitle={teamNumbers.length + " teams"}
        actions={<ActionPanel>
          <Action.OpenInBrowser title="See in The Blue Alliance" url="https://www.thebluealliance.com" />
        </ActionPanel>} />
      {(teamNumbers).map((teamNumber, index) => {
        return (
          console.debug("teamNumber: ", teamNumber, index),
          <List.Item
            key={teamNumber}
            icon="list-icon.png"
            title={teamNumber}
            subtitle={teamNames[index]} // Use the team name from state
            actions={<ActionPanel>
              <Action.Push title="See team info" target={<TeamInfo teamNumber={teamNumber} />} />
              <Action.OpenInBrowser title="See in The Blue Alliance" url={`https://www.thebluealliance.com/team/${teamNumber}`} />
              <Action.CopyToClipboard title="Copy Team Number" content={teamNumber} />
            </ActionPanel>} />
        );
      })}
    </List>
  );
}

function TeamInfo(props: { teamNumber: string }) {
  const markdown = `
  # Team Info ${props.teamNumber}
  `;
  return (
    <Detail markdown={markdown} />
  );
}