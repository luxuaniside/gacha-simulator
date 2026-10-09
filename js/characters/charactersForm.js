import { handleCharacterErrorMessage, handleCharacterSuccessMessage } from "./charactersMessage.js";
import {
    deleteCharacters,
    saveCharacters
} from "../storage/characters.js";
import {
    LimitedFiveCharacterList,
    StandardFiveCharacterList,
    LimitedFourCharacterList,
    StandardFourCharacterList
} from "../inventory.js";
import { renderCharacterRoster } from "./characterRoster.js";

const CHARACTER_BY_KEY = new Map([
    ...LimitedFiveCharacterList.map(character => [
        character.value,
        { rarity: "five", name: character.display }
    ]),
    ...StandardFiveCharacterList.map(character => [
        character.value,
        { rarity: "five", name: character.display }
    ]),
    ...LimitedFourCharacterList.map(character => [
        character.value,
        { rarity: "four", name: character.display }
    ]),
    ...StandardFourCharacterList.map(character => [
        character.value,
        { rarity: "four", name: character.display }
    ])
]);

function shouldSkipCharacter(key) {
    return key === "Aloy" ||
        key === "Manekina" ||
        key === "Manekin" ||
        key.startsWith("Traveler");
}

function convertCharacterExport(jsonData) {
    if (!jsonData || typeof jsonData !== "object" || Array.isArray(jsonData)) {
        handleCharacterErrorMessage("The file must contain a JSON object.");
        return null;
    }

    if (!Array.isArray(jsonData.characters) || jsonData.characters.length === 0) {
        handleCharacterErrorMessage(
            'The file must contain a non-empty "characters" array.'
        );
        return null;
    }

    const characters = { four: {}, five: {} };
    const seenKeys = new Set();
    const unknownKeys = new Set();
    const skippedKeys = new Set();

    for (const [index, character] of jsonData.characters.entries()) {
        if (!character || typeof character !== "object" || Array.isArray(character)) {
            handleCharacterErrorMessage(
                `Character entry ${index + 1} must be an object.`
            );
            return null;
        }

        const { key, constellation } = character;
        if (typeof key !== "string" || key.trim() === "") {
            handleCharacterErrorMessage(
                `Character entry ${index + 1} must have a non-empty string "key".`
            );
            return null;
        }

        if (seenKeys.has(key)) {
            handleCharacterErrorMessage(
                `The export contains the character key "${key}" more than once.`
            );
            return null;
        }
        seenKeys.add(key);

        if (!Number.isInteger(constellation) || constellation < 0 || constellation > 6) {
            handleCharacterErrorMessage(
                `The constellation for "${key}" must be a whole number from 0 to 6.`
            );
            return null;
        }

        if (shouldSkipCharacter(key)) {
            skippedKeys.add(key);
            continue;
        }

        const characterInfo = CHARACTER_BY_KEY.get(key);
        if (!characterInfo) {
            unknownKeys.add(key);
            continue;
        }

        if (Object.hasOwn(characters[characterInfo.rarity], characterInfo.name)) {
            handleCharacterErrorMessage(
                `The export contains multiple entries that map to "${characterInfo.name}".`
            );
            return null;
        }

        characters[characterInfo.rarity][characterInfo.name] = constellation;
    }

    if (unknownKeys.size > 0) {
        handleCharacterErrorMessage(
            `Could not determine the rarity for these character keys: ${[...unknownKeys].join(", ")}.`
        );
        return null;
    }

    return { characters, skippedKeys: [...skippedKeys] };
}

export function validateCharacterData(jsonData) {
    return convertCharacterExport(jsonData) !== null;
}

export function getJsonValues() {
    const fileInput = document.getElementById(
        "characters-form-json-input"
    );
    const loadButton = document.getElementById("load-character-data");
    const deleteButton = document.getElementById("delete-character-data");

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        handleCharacterSuccessMessage("Detected a file. Press Load File to submit.")

    });

    loadButton.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            handleCharacterErrorMessage("Choose a character export file first.");
            return;
        }

        let fileContents;
        try {
            fileContents = await file.text();
        } catch (error) {
            handleCharacterErrorMessage(
                `Could not read the selected file: ${error.message}`
            );
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(fileContents);
        } catch (error) {
            if (!(error instanceof SyntaxError)) {
                throw error;
            }
            handleCharacterErrorMessage("The selected file does not contain valid JSON.");
            return;
        }

        const convertedData = convertCharacterExport(jsonData);
        if (!convertedData) {
            return;
        }

        try {
            saveCharacters(convertedData.characters);
        } catch (error) {
            handleCharacterErrorMessage(
                `Could not save character data: ${error.message}`
            );
            return;
        }
        const fourCount = Object.keys(convertedData.characters.four).length;
        const fiveCount = Object.keys(convertedData.characters.five).length;
        handleCharacterSuccessMessage(
            `Loaded ${fourCount} 4✦ and ${fiveCount} 5✦ characters.`
        );
        renderCharacterRoster();
    });

    deleteButton.addEventListener("click", () => {
        try {
            deleteCharacters();
            handleCharacterSuccessMessage("Character data deleted.");
            renderCharacterRoster();
        } catch (error) {
            handleCharacterErrorMessage(
                `Could not delete character data: ${error.message}`
            );
        }
    });
}

export function initializeCharactersForm() {
    getJsonValues();
}
