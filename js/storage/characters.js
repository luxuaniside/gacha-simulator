const EMPTY_CHARACTER_DATA = { four: {}, five: {} };

export function getExistingCharacters() {
    const characterData = localStorage.getItem("characters");

    return characterData
        ? JSON.parse(characterData)
        : structuredClone(EMPTY_CHARACTER_DATA);
}

export function saveCharacters(characters) {
    localStorage.setItem("characters", JSON.stringify(characters));
}

export function deleteCharacters() {
    localStorage.removeItem("characters");
}
