function setDefaultReplicantValueToInputElement(replicant,inputElementDivId) {
    const inputElement = document.getElementById(inputElementDivId);
    inputElement.value = replicant.value;
}

function setInputElementValueToReplicantValue(replicant, inputElementDivId) {
    const inputElement = document.getElementById(inputElementDivId);
    replicant.value = inputElement.value;
}