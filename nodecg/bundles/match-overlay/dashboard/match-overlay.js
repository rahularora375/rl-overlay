const teamLeftNameReplicant = nodecg.Replicant('teamLeftName');
const teamRightNameReplicant = nodecg.Replicant('teamRightName');
const bestOfReplicant = nodecg.Replicant('bestOf');
const gameNumberReplicant = nodecg.Replicant('gameNumber');

NodeCG.waitForReplicants(teamLeftNameReplicant, teamRightNameReplicant, bestOfReplicant, gameNumberReplicant).then(() => {
    setDefaultReplicantValueToInputElement(teamLeftNameReplicant,'team-left-name');
    setDefaultReplicantValueToInputElement(teamRightNameReplicant,'team-right-name');
    setDefaultReplicantValueToInputElement(bestOfReplicant,'best-of');
    setDefaultReplicantValueToInputElement(gameNumberReplicant,'game-number');
});

function updateData() {
    setInputElementValueToReplicantValue(teamLeftNameReplicant,'team-left-name');
    setInputElementValueToReplicantValue(teamRightNameReplicant,'team-right-name');
    setInputElementValueToReplicantValue(bestOfReplicant,'best-of');
    setInputElementValueToReplicantValue(gameNumberReplicant,'game-number');
};