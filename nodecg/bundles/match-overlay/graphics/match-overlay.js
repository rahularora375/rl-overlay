// Replicants Init
const teamLeftNameReplicant = nodecg.Replicant('teamLeftName');
const teamRightNameReplicant = nodecg.Replicant('teamRightName');
const bestOfReplicant = nodecg.Replicant('bestOf');
const gameNumberReplicant = nodecg.Replicant('gameNumber');
const teamLogoObjectsReplicant = nodecg.Replicant('assets:team-logos', 'shared');
const iconsReplicant = nodecg.Replicant('assets:other-icons', 'shared');

// Divs that change value dynamically
const scoreboardTeamLeftNameDiv = document.getElementById('team-left-name');
const scoreboardTeamLeftScoreDiv = document.getElementById('team-left-score');
const scoreboardTeamLeftLogoDiv = document.getElementById('team-left-logo');
const scoreboardTeamRightNameDiv = document.getElementById('team-right-name');
const scoreboardTeamRightScoreDiv = document.getElementById('team-right-score');
const scoreboardTeamRightLogoDiv = document.getElementById('team-right-logo');
const gameTimeDiv = document.getElementById('game-time');
const bestOfDiv = document.getElementById('best-of');
const gameNumberDiv = document.getElementById('game-number');
const speedNumberDiv = document.getElementById('speed-number');
const boostNumberDiv = document.getElementById('boost-number');
const speedMeterDiv = document.getElementById('speed-meter');
const teamLeftNameDiv = document.getElementById('team-left-names');
const teamRightNameDiv = document.getElementById('team-right-names');
const currentPlayerDiv = document.getElementById('current-player');
const speedometerDiv = document.getElementById('speedometer');
const replayCardDiv = document.getElementById('replay-card');
const replayCardContainerDiv = document.getElementById('replay-card-container');
const replayImg = document.getElementById('replay-img');

function updateTeamLogo(teamNameReplicant, div) {
    const teamLogoElement = typeof div === "string" ? document.getElementById(div) : div;

	teamNameReplicant.on('change', (newVal) => {

        const matchedObject = teamLogoObjectsReplicant.value.find(teamLogoObject => teamLogoObject["name"].toLowerCase() === newVal.toLowerCase());
		let teamLogoUrl = ""
		if (matchedObject) 
			teamLogoUrl = matchedObject.url;

		const teamLogoImg = document.createElement('img');
        teamLogoImg.src = teamLogoUrl;
		teamLogoImg.alt = newVal;
        
        teamLogoElement.innerHTML = "";
        teamLogoElement.appendChild(teamLogoImg);
	});
}

// Function to update the number displays and boost meter
function updateSpeedometer(speed, boost) {
    const maxBoost = 100;
    const maxOffset = 74; 

    const percentage = (boost / maxBoost) * 100;
    const offset = maxOffset * (1 - (percentage / 100));

    // Update the speed display
    speedNumberDiv.textContent = speed + " KPH" ;
    // Update the boost display
    boostNumberDiv.textContent = boost ;
    // Update the meter display
    speedMeterDiv.style.strokeDashoffset = offset;
}

function makePlayerInfoContainerDiv(reverseOrder = false) {

    const playerInfoContainerDiv = document.createElement('div');
    playerInfoContainerDiv.classList.add('player-info-container');

    const boostBarDiv = document.createElement('div');
    boostBarDiv.classList.add('boost-bar');

    const playerInfoDiv = document.createElement('div');
    playerInfoDiv.classList.add('player-info');

    const playerNameDiv = document.createElement('div');
    playerNameDiv.classList.add('player-name');

    const playerBoostDiv = document.createElement('div');
    playerBoostDiv.classList.add('player-boost');

    if (reverseOrder) {
        playerInfoDiv.appendChild(playerBoostDiv);
        playerInfoDiv.appendChild(playerNameDiv);
    }
    else {
        playerInfoDiv.appendChild(playerNameDiv);
        playerInfoDiv.appendChild(playerBoostDiv);
    }

    playerInfoContainerDiv.appendChild(playerInfoDiv);
    playerInfoContainerDiv.appendChild(boostBarDiv);

    return playerInfoContainerDiv;
}

function makePlayerInfoContainerDivs(parentDiv, reverseOrder = false, numberDivs = 3) {
    parentDiv.innerHTML="";
    for(i=0; i < numberDivs; i++) {
        parentDiv.appendChild(makePlayerInfoContainerDiv(reverseOrder));
    }
}

function updateReplayCardData(goalData) {
    replayCardContainerDiv.children[0].children[1].innerHTML = goalData['scorer']['name'];
    replayCardContainerDiv.children[1].children[1].innerHTML = goalData['assister']['name'];
    replayCardContainerDiv.children[2].children[1].innerHTML = Math.floor(goalData['goalspeed'])+' KPH';
    replayCardContainerDiv.children[3].children[1].innerHTML = convertTime(goalData['goaltime']);
};

function addReplayCardIcons() {
    addImageInsideDiv(replayCardContainerDiv.children[0].children[0], getImageUrl(iconsReplicant, "Goal_points_icon"));
    addImageInsideDiv(replayCardContainerDiv.children[1].children[0], getImageUrl(iconsReplicant, "loyalty"));
    addImageInsideDiv(replayCardContainerDiv.children[2].children[0], getImageUrl(iconsReplicant, "football"));
    addImageInsideDiv(replayCardContainerDiv.children[3].children[0], getImageUrl(iconsReplicant, "stopwatch"));
    replayImg.src = getImageUrl(iconsReplicant, "200w");
};

function slideOutDivs(...divs) {
    divs.forEach(div => {
        div.classList.remove("slide-in-bottom")
        div.classList.add("slide-out-bottom");
    })
}

function slideInDivs(...divs) {
    divs.forEach(div => {
        div.classList.remove("slide-out-bottom")
        div.classList.add("slide-in-bottom");
    })
}

// Updating Team Names In Scoreboard When Replicant Changes
updateDivTextValueOnReplicantChange(teamLeftNameReplicant, scoreboardTeamLeftNameDiv, undefined, undefined, true);
updateDivTextValueOnReplicantChange(teamRightNameReplicant , scoreboardTeamRightNameDiv, undefined, undefined, true);

// Updating Other Values In Scoreboard When Replicant Changes
updateDivTextValueOnReplicantChange(bestOfReplicant, bestOfDiv, "BEST OF");
updateDivTextValueOnReplicantChange(gameNumberReplicant , gameNumberDiv, "GAME");

// Updating Team Logos In Scoreboard When Replicant Changes
NodeCG.waitForReplicants(teamLogoObjectsReplicant, iconsReplicant).then(() => {
    updateTeamLogo(teamLeftNameReplicant, scoreboardTeamLeftLogoDiv);
    updateTeamLogo(teamRightNameReplicant, scoreboardTeamRightLogoDiv);
    addReplayCardIcons();
});

makePlayerInfoContainerDivs(teamLeftNameDiv);
makePlayerInfoContainerDivs(teamRightNameDiv, true);
makePlayerInfoContainerDivs(currentPlayerDiv.children[0], false, 1);

// slideOutDivs(speedometerDiv, currentPlayerDiv);
slideOutDivs(replayCardDiv);

WsSubscribers.init(49322, true);

WsSubscribers.subscribe("game", "update_state", (data) => {
    const arrayOfPlayerObjects = Object.values(data["players"]).map((value, index) => {
        return { id: Object.keys(data["players"])[index], ...value };
    });
    const team0Players = arrayOfPlayerObjects.filter(player => player["team"] === 0);
    const team1Players = arrayOfPlayerObjects.filter(player => player["team"] === 1);

    const currentPlayer =  arrayOfPlayerObjects.find(obj => obj.id === data["game"]["target"]) ;
    
    const gameTime = convertTime(data["game"]["time_seconds"]);

    const teams = data["game"]["teams"];

    // Adding Team Scores To Scoreboard
    scoreboardTeamLeftScoreDiv.innerHTML = teams["0"]["score"];
    scoreboardTeamRightScoreDiv.innerHTML = teams["1"]["score"];

    // Adding Game Time To Scoreboard
    gameTimeDiv.innerHTML = gameTime;

    const team0PlayerInfoContainers = teamLeftNameDiv.getElementsByClassName("player-info-container");
    const team1PlayerInfoContainers = teamRightNameDiv.getElementsByClassName("player-info-container");

    // Updating Name and Boost for team 1
    for (let i = 0; i < team0Players.length; i++) {
        const playerName = team0Players[i]['name'];
        const playerNameDiv = team0PlayerInfoContainers[i].children[0].children[0];
        playerNameDiv.innerHTML = playerName;
        
        const playerBoost = team0Players[i]['boost'];
        const playerBoostDiv = team0PlayerInfoContainers[i].children[0].children[1];
        playerBoostDiv.innerHTML = playerBoost;

        const playerBoostBarDiv = team0PlayerInfoContainers[i].children[1];
        playerBoostBarDiv.style.width = playerBoost+"%";
    }

    // Updating Name and Boost for team 2
    for (let i = 0; i < team1Players.length; i++) {
        const playerBoost = team1Players[i]['boost'];
        const playerBoostDiv = team1PlayerInfoContainers[i].children[0].children[0];
        playerBoostDiv.innerHTML = playerBoost;

        const playerName = team1Players[i]['name'];
        const playerNameDiv = team1PlayerInfoContainers[i].children[0].children[1];
        playerNameDiv.innerHTML = playerName;

        const playerBoostBarDiv = team1PlayerInfoContainers[i].children[1];
        playerBoostBarDiv.style.width = playerBoost+"%";
    }
    
    // Updating Current Player Stats
    if (data["game"]["hasTarget"]) {
        currentPlayerDiv.getElementsByClassName('player-name')[0].innerHTML=currentPlayer['name'];
        currentPlayerDiv.getElementsByClassName('player-boost')[0].innerHTML=currentPlayer['boost'];
        currentPlayerDiv.getElementsByClassName('boost-bar')[0].style.width = currentPlayer['boost']+'%';
        currentPlayerDiv.getElementsByClassName('goals')[0].innerHTML=currentPlayer['goals'];
        currentPlayerDiv.getElementsByClassName('shots')[0].innerHTML=currentPlayer['shots'];
        currentPlayerDiv.getElementsByClassName('saves')[0].innerHTML=currentPlayer['saves'];

        updateSpeedometer(currentPlayer['speed'], currentPlayer['boost']);
    }
    else
        updateSpeedometer(0, 0);
});

WsSubscribers.subscribe("game", "goal_scored", (data) => {
    slideOutDivs(speedometerDiv, currentPlayerDiv);
    updateReplayCardData(data);
})

WsSubscribers.subscribe("game", "replay_start", (data) => {
    slideInDivs(replayCardDiv);
})

WsSubscribers.subscribe("game", "pre_countdown_begin", (data) => {
    slideOutDivs(replayCardDiv);
})

WsSubscribers.subscribe("game", "round_started_go", (data) => {
    slideInDivs(speedometerDiv, currentPlayerDiv);
})