# The Blue Alliance Raycast
A raycast extendion that incorporates the blue alliance

## What is raycast?
[Raycast](raycast.com) is an application for mac that improves the spotlight feature.

The cool thing about raycast is its versatility as it allows extensions and has a really friendly API.

---

## What is the blue alliance?
[The Blue Alliance](https://www.thebluealliance.com) is a web page that has a very complete database on [FRC](https://www.firstinspires.org/robotics/frc) teams

> The Blue Alliance is the best way to scout, watch, and relive the FIRST Robotics Competition. Learn more about FIRST at [firstinspires.org](firstinspires.org).  

^- [The Blue Alliance](https://www.thebluealliance.com)^

TBA (The Blue Alliance) also has an [API](https://www.thebluealliance.com/apidocs) that lets you retrieve team and event data.

## TBA Raycast
TBA Raycast is the extension I'm building for raycast that right now has two commands:

### Browse FRC Teams
The Browse FRC Teams Command shows a list of FRC Teams along with their logo (if available).  
Right now it loads from team 1 to team 499, I'm planning on adding pagination and optimizing the search as it takes a while to load the teams.  
When clicking enter or double clicking on a team it will show a team info page that displays:
- Team Logo
- Team Nickname
- Team Number
- Team name
- Rookie year
- Championships
- Website
- Location
- School
- Addres
- Postal Code

On championships, the color the year is diplayed in is supposed to represent wether or not the team made it to einstein or something like that, but it is broken, as you can see for team 254 marks 2024 as yellow but it should be green.

### Search for an FRC Team

The Search for an FRC Team Command lets you enter a team number directly and shows the same team info page.

I still need to handle when a team number submited does not exist, right now it shows a blank page

## Why did I do this?

I form part of an FRC team and often find myself searching for a team in TBA and after I installed raycast I felt it could be waaay faster to have an extension instead of doing the whole opening a tab opening TBA blah blah blah. And with the inscentive of getting tickents on [Hack Club Arcade](https://hackclub.com/arcade/) I decided to go for it.