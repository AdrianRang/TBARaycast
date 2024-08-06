import { Action, ActionPanel, Detail, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import axios from "axios";
import { useEffect, useState } from "react";

const API_KEY = "4FmWpc7JdnQpxdAmng6DVVQ8MMuD9qtIzU6T7auUQViDt6ZJK3v28SIbwurR2J7n";

async function getFullTeamData(teamNumber: string) {
  const response = await axios.get(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`, {
    headers: {
      'X-TBA-Auth-Key': API_KEY
    }
  });
  return response.data;
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

interface FormValues {
  teamNumber: string;
}


export default function Command() {
  const [error, setError] = useState<boolean>(false);
  const { push, pop } = useNavigation();

  const handleSubmit = async (data: FormValues) => {
    try {
      showToast({ title: "Loading...", style: Toast.Style.Animated });
      push(<TeamInfo teamNumber={data.teamNumber} />);
    } catch (error: any) {
      console.error("Error: ", error);
      showToast({ title: "Error", message: error, style: Toast.Style.Failure });
    }
  };


return (
  <Form
    actions={
      <ActionPanel>
        <Action.SubmitForm title="Search" onSubmit={handleSubmit} />
        {/* <Action.Push title="Go" target={<TeamInfo teamNumber={itemProps.teamNumber.value as string} />} /> */}
      </ActionPanel>
    }
  > 
    <Form.TextField
      id="teamNumber"
      title="Team Number"
      placeholder="e.g. 3526"
      onChange={(value) => {
        const isNumber = /^\d+$/.test(value);
        setError(!isNumber && value.length > 0);
      }}
      error={error ? "Please enter a valid number" : undefined}
    />
  </Form>
);
}

function TeamInfo(props: { teamNumber: string }) {
  const [teamData, setTeamData] = useState<any>();
  const [teamLogo, setTeamLogo] = useState<string>();
  const [detailmetadata, setMetadata] = useState<any>();
  const [championships, setChamp] = useState<string[][]>([])

  console.log("Team Number: ", props.teamNumber);
  if (!props.teamNumber) {
    return <Detail markdown={`# Please enter a team number \n entered: ${props.teamNumber}`} metadata={detailmetadata} />
  }
  try {
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
          headers: {
            'X-TBA-Auth-Key': API_KEY
          }
        })

        let champs: string[] = [];
        let final: string[] = [];
        response.data.forEach((eventDat: any) => {
          if (eventDat.event_type === 4) {
            champs.push(eventDat.key.substring(0, 4));
            final.push("true");
          } else if (eventDat.event_type === 3) {
            champs.push(eventDat.key.substring(0, 4))
            final.push("false")
          }
        })

        // Remove duplicates from champs
        const uniqueChamps: string[] = [];
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
          return (
            <Detail.Metadata>
              <Detail.Metadata.Label title="Rookie Year" text={"" + teamData.rookie_year} />
              <Detail.Metadata.TagList title="Championships">
                {(championships[0] ?? []).map((championship: string, i) => {
                  console.debug("adding:" + championship)
                  return (
                    <Detail.Metadata.TagList.Item text={(championship).substring(0, 4)} color={championships[1][i] == "true" ? "#22c55e" : "#eab308"} />
                  )
                })
                }
              </Detail.Metadata.TagList>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Link title="website" target={teamData.website} text={teamData.website} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="Location" text={teamData.city + ", " + teamData.state_prov + ", " + teamData.country} />
              <Detail.Metadata.Label title="School" text={teamData.school_name} />
              {
                <Detail.Metadata.Label title="Address" text={teamData.address !== null ? teamData.address : "N/A"} />
              }
              <Detail.Metadata.Label title="Postal Code" text={teamData.postal_code !== null ? teamData.postal_code : "N/A"} />
            </Detail.Metadata>
          )
        }
        setMetadata(meta())
        showToast({ title: "Loaded", style: Toast.Style.Success });
      }
      fetchMetadata()
    }, [])

    let markdown = "";
    try {
      markdown = `
  # ${teamLogo !== "" ? `![Team Logo](${teamLogo})  ` : ""}Team #${props.teamNumber}, ${teamData.nickname}
  ###### *${teamData.name}*
  ${teamData.moto !== undefined ? "\"" + teamData.moto + "\"" : ""}
    `;
    }
    catch (error) {
      // markdown = `Error: Team #${props.teamNumber} might not exists`; 
      // showToast({ title: "Error", message: "Team not found", style: Toast.Style.Failure })
    }; 

    return (
      <Detail markdown={markdown} metadata={detailmetadata} />
      // <ActionPanel>
      //   <Action.Push title="Events participated" target={<Events />} />
      // </ActionPanel>
    )
  } catch (error) {
    console.error("Error: ", error);
    return <Detail markdown={`# Data not available for team ${props.teamNumber}`} metadata={detailmetadata} />
  }
}