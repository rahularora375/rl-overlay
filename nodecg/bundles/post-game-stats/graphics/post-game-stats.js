// Replicants Init
// const teamLeftNameReplicant = nodecg.Replicant('teamLeftName', 'match-overlay');
// const teamRightNameReplicant = nodecg.Replicant('teamRightName', 'match-overlay');
// const bestOfReplicant = nodecg.Replicant('bestOf', 'match-overlay');
// const gameNumberReplicant = nodecg.Replicant('gameNumber', 'match-overlay');
// const teamLogoObjectsReplicant = nodecg.Replicant('assets:team-logos', 'shared');
// const iconsReplicant = nodecg.Replicant('assets:other-icons', 'shared');

// Divs that change value dynamically
const table = document.getElementById("post-game-stats-table");

function findHighestScorer(arrayOfPlayerObjects, teamNum) {
    const teamPlayers = arrayOfPlayerObjects.filter(player => player.team === teamNum);
    
    let highestScore = -1;
    let highestScorePlayerId = null;
  
    for (const player of teamPlayers) {
        if (player["score"] > highestScore) {
            highestScore = player["score"];
            highestScorePlayerId = player["id"];
        }
    }
  
    return highestScorePlayerId;
}

function populateTable(playerData, tableId) {
    // Get the table element by its ID
    const table = document.getElementById(tableId);

    table.innerHTML = "";

    // Extract headers from the first player object
    const headers = Object.keys(playerData[0]);

    // Create table headers
    const headerRow = table.insertRow();
    headers.forEach(headerText => {
        const header = document.createElement("th");
        header.textContent = headerText;
        headerRow.appendChild(header);
    });

    // Populate table with player data
    playerData.forEach(player => {
        const row = table.insertRow();
        headers.forEach(header => {
            const cell = row.insertCell();
            cell.textContent = player[header];
        });
    });
}

WsSubscribers.init(49322, true);

let arrayOfPlayerObjects = [];

WsSubscribers.subscribe("game", "update_state", (data) => {
    arrayOfPlayerObjects = Object.values(data["players"]).map((value, index) => {
        return { id: Object.keys(data["players"])[index], ...value };
    });
});

WsSubscribers.subscribe("game", "match_ended", (matchEnded) => {
    const winnerTeamNum = matchEnded['winner_team_num'];
    let finalArrayOfPlayerObjects = arrayOfPlayerObjects.map(player => {
        return {
            ...player,
            isMvp: 0
        };
    });

    const highestScorePlayerId = findHighestScorer(arrayOfPlayerObjects, winnerTeamNum);

    finalArrayOfPlayerObjects = finalArrayOfPlayerObjects.map(player => {
        if (player.id === highestScorePlayerId) {
            return {
                ...player,
                isMvp: 1
            };
        } else {
            return player;
        }
    });

    finalArrayOfPlayerObjects = finalArrayOfPlayerObjects.map(player => ({
        // id: player.id,
        name: player.name,
        team: player.team,
        isMvp: player.isMvp,
        score: player.score,
        goals: player.goals,
        assists: player.assists,
        shots: player.shots,
        saves: player.saves,
        demos: player.demos,
    }));

    populateTable(finalArrayOfPlayerObjects, "post-game-stats-table");

});