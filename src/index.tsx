import { ActionPanel, Action, List, Detail, Image, Icon, useNavigation, showToast, Toast } from "@raycast/api";
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

async function getFullTeamData(teamNumber: string) {
  const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`, {
    headers: {
      'X-TBA-Auth-Key': API_KEY
    }
  });
  return response.data;
}

let page = 0;

export default function Command() {
  const [teamData, setTeamData] = useState<string[][]>([[]]);
  const [isLoading, setIsLoading] = useState(true);
  const { pop, push } = useNavigation();

  const nextPage = async () => {
    if (page === 19) {
      showToast({ title: "You are already on the last page", style: Toast.Style.Failure });
      return;
    }
    showToast({ title: `You are now on page ${++page}`, style: Toast.Style.Success });
    pop();
    push(<Command />);
  }

  const lastPage = async () => {
    if (page === 0) {
      showToast({ title: "You are already on the first page", style: Toast.Style.Failure });
      return;
    };
    showToast({ title: `You are now on page ${--page}`, style: Toast.Style.Success });
    pop();
    push(<Command />);
  }

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
    fetchTeamData(page);

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
              {/* <Action.Push title="See team info" target={<TeamInfo data={async () => await getFullTeamData(teamNumber)} />} /> */}
              <Action.OpenInBrowser title="See in The Blue Alliance" url={`https://www.thebluealliance.com/team/${teamNumber}`} />
              <Action.CopyToClipboard title="Copy Team Number" content={teamNumber} />
            </ActionPanel>} />
        );
      }));
      // setItems(items);
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
      <List.Item
        title={"Go to last page"}
        icon={Icon.ArrowLeft}
        actions={<ActionPanel>
          <Action icon={Icon.ArrowRight} title="Last Page" onAction={lastPage} />
        </ActionPanel>
        }
      />
      {(teamNumbers).map((teamNumber, index) => {
        return (
          <List.Item
            key={teamNumber}
            title={teamNumber}
            subtitle={teamNames[index]} // Use the team name from state
            keywords={[teamNumber, teamNames[index], ...teamNames[index].split(" "), teamCity[index] !== null ? teamCity[index] : "N/A", teamCountry[index] !== null ? teamCountry[index] : "N/A"]}
            accessories={[
              { text: (teamCity[index] !== null ? teamCity[index] : "N/A") + ", " + (teamCountry[index] !== null ? teamCountry[index] : "N/A") }
            ]}
            icon={{ source: teamLogos[index] }}
            actions={
              <ActionPanel>
                <Action.Push title="See team info" target={<TeamInfo teamNumber={teamNumber}/>} />
                <Action.OpenInBrowser title="See in The Blue Alliance" url={`https://www.thebluealliance.com/team/${teamNumber}`} />
                <Action.CopyToClipboard title="Copy Team Number" content={teamNumber} />
              </ActionPanel>
            }
          />
        );
      }
      )}
      <List.Item
        title={"Go to next page"}
        icon={Icon.ArrowRight}
        actions={<ActionPanel>
          <Action icon={Icon.ArrowRight} title="Next Page" onAction={nextPage} />
        </ActionPanel>
        }
      />
    </List>
  );
}

function TeamInfo(props: { teamNumber: string }) {
  const [teamData, setTeamData] = useState<any>();
  const [teamLogo, setTeamLogo] = useState<string>();
  const [detailmetadata, setMetadata] = useState<any>();
  const [championships, setChamp] = useState<string[][]>([])

  useEffect(() => {
    const fetchTeamData = async () => {
      const teamData = (await getFullTeamData(props.teamNumber));
      setTeamData(teamData);
    }
    fetchTeamData();

    const fetchTeamLogo = async () => {
      let teamLogo = (await getTeamLogo(props.teamNumber))
      teamLogo = teamLogo === "FIRST_Vertical_RGB_DarkMode.png" ? "" : teamLogo
      setTeamLogo(teamLogo)
    }
    fetchTeamLogo()

    const fetchChamps = async () => {
      const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc${props.teamNumber}/events/simple`, {
        headers:{
          'X-TBA-Auth-Key': API_KEY
        }
      })

      let champs: string[] = [];
      let final: string[] = [];
      response.data.forEach((eventDat: any) => {
        if(eventDat.event_type === 4) {
          champs.push(eventDat.key.substring(0, 4));
          final.push("true");
        }else if(eventDat.event_type === 3){
          champs.push(eventDat.key.substring(0, 4))
          final.push("false")
        }
      })

      // Remove duplicates from champs
      const uniqueChamps:string[] = [];
      for (let champ of champs) {
        if (!uniqueChamps.includes(champ)) {
          uniqueChamps.push(champ);
        }
      }
      champs = uniqueChamps;

      setChamp([champs, final])
      return [champs, final]
    }
    fetchChamps()

    const fetchMetadata = async () => {
      const teamData = (await getFullTeamData(props.teamNumber));
      const championships = await fetchChamps();

      console.debug("Generating Metadata...")

      const meta = () => {
        return(
          <Detail.Metadata>
            <Detail.Metadata.Label title="Rookie Year" text={"" + teamData.rookie_year} />
            <Detail.Metadata.TagList title="Championships">
              {(championships[0] ?? []).map((championship: string, i) =>{
                console.debug("adding:" + championship)
                return(
                  <Detail.Metadata.TagList.Item text={(championship).substring(0, 4)} color={championships[1][i] == "true" ? "#22c55e": "#eab308"}/>
                )
              })
              }
            </Detail.Metadata.TagList>
            <Detail.Metadata.Separator />
            <Detail.Metadata.Link title="website" target={teamData.website} text={teamData.website}/>
            <Detail.Metadata.Separator/>
            <Detail.Metadata.Label title="Location" text={teamData.city + ", " + teamData.state_prov + ", " + teamData.country}/>
            <Detail.Metadata.Label title="School" text={teamData.school_name}/>
            {
              <Detail.Metadata.Label title="Address" text={teamData.address !== null ? teamData.address : "N/A"}/>
            }
            <Detail.Metadata.Label title="Postal Code" text={teamData.postal_code  !== null ? teamData.postal_code : "N/A"} />
          </Detail.Metadata>
        )
      }
      setMetadata(meta())
    }
    fetchMetadata()
  }, [])
  
  let markdown = "";
  try {
  markdown = `
  # ${teamLogo !== "" ? `![Team Logo](${teamLogo})  `: ""}Team #${props.teamNumber}, ${teamData.nickname}
  ###### *${teamData.name}*
  ${teamData.moto !== undefined ? "\"" + teamData.moto + "\"" : ""}
  `;
  }
  catch(error) {console.log("Loading..."); markdown = "# Loading..."}
 
  return (
    <Detail markdown={markdown} metadata={detailmetadata} />
    // <ActionPanel>
    //   <Action.Push title="Events participated" target={<Events />} />
    // </ActionPanel>
  )
}

function Events(){
  return(
    <Detail markdown={"Events"}/>
  )
}