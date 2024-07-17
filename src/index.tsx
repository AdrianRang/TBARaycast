import { ActionPanel, Action, List, Detail, Image } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from "axios";


const API_KEY = "4FmWpc7JdnQpxdAmng6DVVQ8MMuD9qtIzU6T7auUQViDt6ZJK3v28SIbwurR2J7n";
const TEAM_LIMIT = 250;


async function getAllTeamData() {
  let teamData: any[] = [];
  for (let i = 0; i < 1; i++) {
    const response = axios.get(`https://www.thebluealliance.com/api/v3/teams/${i}/simple`, {
      headers: {
        'X-TBA-Auth-Key': API_KEY
      }
    });
    await response.then((response) => {
      response.data.forEach((teamdata: any, i: number) => {
        if (i > TEAM_LIMIT) return;
        teamData.push(teamdata);
      });
    });;
    return teamData;
  }
}

async function getTeamLogo(teamNumber: string) {
  const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc254/media/2024`, {
    headers: {
      'X-TBA-Auth-Key': API_KEY
    }
  });
  console.debug("response: ", response.data[0].base64Image);
  return response.data[0].base64Image;
  // return "https://www.thebluealliance.com/images/team_logos/2024.png";
}

async function getAllTeamLogos(teamNumbers: string[]) {
  let teamLogos: string[] = [];
  teamLogos.forEach(async (teamNumber) => {
    teamLogos.push(await getTeamLogo(teamNumber))
  });
  return teamLogos;

}

export default function Command() {
  const [teamData, setTeamData] = useState<string[][]>([[]]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch team numbers and update state
    const fetchTeamData = async () => {
      const teamData = await getAllTeamData();
      const teamLogos = await getAllTeamLogos((teamData ?? []).map((teamData) => teamData.key.substring(3)));

      const numbers = await Promise.all((teamData ?? []).map((teamData) => teamData.key.substring(3)));
      const names = await Promise.all((teamData ?? []).map((teamData) => teamData.nickname));
      const city = await Promise.all((teamData ?? []).map((teamData) => teamData.city));
      const country = await Promise.all((teamData ?? []).map((teamData) => teamData.country));
      const base64Logo = await Promise.all(teamLogos.map((teamLogo) => teamLogo));
      console.debug("base64: ", base64Logo);
      setTeamData([numbers, names, city, country, base64Logo]);
      setIsLoading(false);
    }; 
    fetchTeamData();
  }, []); // Run effect only once on component mount

  const teamNumbers = teamData[0];
  const teamNames = teamData[1];
  const teamCity = teamData[2];
  const teamCountry = teamData[3];
  const teamLogos = teamData[4];
  // Function to parse base64 to Image.ImageLike
  
  console.debug("base64: ", teamLogos);
  return (
    <List isLoading={isLoading} searchBarPlaceholder="Serch FRC Teams">
      {/* <List.Item
        icon="list-icon.png"
        title="All Teams"
        subtitle={teamNumbers.length + " teams"}
        actions={<ActionPanel>
          <Action.OpenInBrowser title="See in The Blue Alliance" url="https://www.thebluealliance.com" />
        </ActionPanel>} /> */}
      {(teamNumbers).map((teamNumber, index) => {
        return (
          <List.Item
            key={teamNumber}
            title={teamNumber}
            subtitle={teamNames[index]} // Use the team name from state
            keywords={[teamNumber, teamNames[index]]}
            accessories={[
              { text: teamCity[index] + ", " + teamCountry[index] },
            ]}
            // icon={{ value: teamLogos[index], tintColor: "#000000", tooltip: "" }}
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