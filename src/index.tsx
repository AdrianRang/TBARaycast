import { ActionPanel, Action, List, Detail, Image, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import axios from "axios";


const API_KEY = "4FmWpc7JdnQpxdAmng6DVVQ8MMuD9qtIzU6T7auUQViDt6ZJK3v28SIbwurR2J7n";
const TEAM_LIMIT = 500;


async function getAllTeamData(start: number, end: number) {
  let teamData: any[] = [];
  for (let i = start; i < end; i++) {
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
  }
  return teamData;
}

async function getTeamLogo(teamNumber: string) {
  try {

    const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/media/2024`, {
      headers: {
        'X-TBA-Auth-Key': API_KEY
      }
    });
    try {
      await response.data[0].details.base64Image;
    } catch (error) {
      return "FIRST_Vertical_RGB_DarkMode.png";
    }
    let img = "data:image/png;base64,"
    img += await response.data[0].details.base64Image;
    return img;
  } catch (error) {
    console.error("Error: ", error);
    return "FIRST_Vertical_RGB_DarkMode.png";
  }
}

async function getAllTeamLogos(teamNumbers: string[]) {
  let teamLogos: string[] = [];
  teamLogos = await Promise.all(teamNumbers.map(async (teamNumber) => await getTeamLogo(teamNumber)))

  // teamLogos.forEach((teamLogo, i) => {
  //   console.debug(i, teamLogo.charAt(0));
  // });

  return teamLogos;
}

let currPage = 0;

function setPage(page: number) {
  currPage = page;
  return page;
}

export default function Command() {
  const [teamData, setTeamData] = useState<string[][]>([[]]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Fetch team numbers and update state
    const fetchTeamData = async (page: number) => {
      const teamData = await getAllTeamData(page, page + 1);

      const numbers = await Promise.all((teamData ?? []).map((teamData) => teamData.key.substring(3)));
      const names = await Promise.all((teamData ?? []).map((teamData) => teamData.nickname));
      const city = await Promise.all((teamData ?? []).map((teamData) => teamData.city));
      const country = await Promise.all((teamData ?? []).map((teamData) => teamData.country));

      const teamLogos = await Promise.all(((await getAllTeamLogos((numbers ?? []))).map((numbers) => numbers)));

      const base64Logo = await Promise.all((teamLogos ?? []).map((teamLogo) => teamLogo));

      // console.debug("base64: ", base64Logo);

      setTeamData([numbers, names, city, country, base64Logo]);
      setIsLoading(false);
    };
    fetchTeamData(currPage);

    const fetchItems = async () => {
      // console.debug("teamData: ", teamData.length);
      const items = await Promise.all(await (teamData[0] ?? []).map((teamNumber, index) => {
        return (
          <List.Item
            key={teamNumber}
            title={teamNumber}
            subtitle={teamData[1][index]} // Use the team name from state
            keywords={[teamNumber, teamData[1][index], ...teamData[1][index].split(" "), teamData[2][index] !== null ? teamData[2][index] : "N/A", teamData[3][index] !== null ? teamData[3][index] : "N/A"]}
            accessories={[
              { text: (teamData[2][index] !== null ? teamData[2][index] : "N/A") + ", " + (teamData[3][index] !== null ? teamData[3][index] : "N/A") },
            ]}
            icon={{ source: teamData[4][index] }}
            actions={<ActionPanel>
              <Action.Push title="See team info" target={<TeamInfo teamNumber={teamNumber} />} />
              <Action.OpenInBrowser title="See in The Blue Alliance" url={`https://www.thebluealliance.com/team/${teamNumber}`} />
              <Action.CopyToClipboard title="Copy Team Number" content={teamNumber} />
            </ActionPanel>} />
        );
      }));
      setItems(items);
    }
    fetchItems();
  }, []); // Run effect only once on component mount

  const teamNumbers = teamData[0];
  const teamNames = teamData[1];
  const teamCity = teamData[2];
  const teamCountry = teamData[3];
  const teamLogos = teamData[4];
  // Function to parse base64 to Image.ImageLike

  // console.debug("base64: ", teamLogos);
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
            keywords={[teamNumber, teamNames[index], ...teamNames[index].split(" "), teamCity[index] !== null ? teamCity[index] : "N/A", teamCountry[index] !== null ? teamCountry[index] : "N/A"]}
            accessories={[
              { text: (teamCity[index] !== null ? teamCity[index] : "N/A") + ", " + (teamCountry[index] !== null ? teamCountry[index] : "N/A") },
            ]}
            icon={{ source: teamLogos[index] }}
            actions={<ActionPanel>
              <Action.Push title="See team info" target={<TeamInfo teamNumber={teamNumber} />} />
              <Action.OpenInBrowser title="See in The Blue Alliance" url={`https://www.thebluealliance.com/team/${teamNumber}`} />
              <Action.CopyToClipboard title="Copy Team Number" content={teamNumber} />
            </ActionPanel>} />
        );
      })}

      <List.Item
        title={"Go to next page"}
        icon={Icon.ArrowRight}
        actions={<ActionPanel>
          {/* <Action title="Go to next page" onAction={setPage(currPage + 1)} /> */}
        </ActionPanel>} 
      />

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