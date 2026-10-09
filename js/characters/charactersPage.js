import { initializeCharactersForm } from "./charactersForm.js";
import { initializeCharacterRoster } from "./characterRoster.js";

export function initializeCharactersPage() {
    initializeCharactersForm();
    initializeCharacterRoster();
}