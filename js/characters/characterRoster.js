import {
    LimitedFiveCharacterList,
    StandardFiveCharacterList,
    LimitedFourCharacterList,
    StandardFourCharacterList
} from "../inventory.js";
import { getExistingBanners } from "../storage/banners.js";
import { getExistingGoals } from "../storage/goals.js";
import { getExistingCharacters, saveCharacters } from "../storage/characters.js";
import {
    handleCharacterErrorMessage,
    handleCharacterSuccessMessage
} from "./charactersMessage.js";

const characterLists = [
    { rarity: "five", items: LimitedFiveCharacterList },
    { rarity: "five", items: StandardFiveCharacterList },
    { rarity: "four", items: LimitedFourCharacterList },
    { rarity: "four", items: StandardFourCharacterList }
];

const characters = characterLists.flatMap(({ rarity, items }) =>
    items.map(item => ({ ...item, rarity }))
);

const characterPresetGroups = {
    all: characters,
    five: characters.filter(character => character.rarity === "five"),
    four: characters.filter(character => character.rarity === "four"),
    "standard-five": StandardFiveCharacterList.map(character => ({
        ...character,
        rarity: "five"
    })),
    "limited-five": LimitedFiveCharacterList.map(character => ({
        ...character,
        rarity: "five"
    })),
    "standard-four": StandardFourCharacterList.map(character => ({
        ...character,
        rarity: "four"
    })),
    "limited-four": LimitedFourCharacterList.map(character => ({
        ...character,
        rarity: "four"
    }))
};

const characterNameByKey = new Map(
    characters.flatMap(character => [
        [character.value, character.display],
        [character.display, character.display]
    ])
);

function getRecommendedCharacters() {
    const recommended = new Set(
        StandardFiveCharacterList.map(character => character.display)
    );

    for (const goal of getExistingGoals()) {
        if (goal.item_type === "character" && characterNameByKey.has(goal.item_name)) {
            recommended.add(characterNameByKey.get(goal.item_name));
        }
    }

    for (const banner of getExistingBanners()) {
        if (banner.item_type !== "character") {
            continue;
        }

        for (const key of [
            banner.banner_five_item_primary,
            banner.banner_five_item_secondary,
            ...(banner.banner_four_items ?? [])
        ]) {
            if (characterNameByKey.has(key)) {
                recommended.add(characterNameByKey.get(key));
            }
        }
    }

    return recommended;
}

function createCharacterChip(character, constellation) {
    const chip = document.createElement("article");
    const isOwned = constellation !== undefined;
    chip.className = `character-chip character-chip-${character.rarity}${isOwned ? "" : " character-chip-unowned"}`;
    chip.dataset.characterName = character.display;

    if (!isOwned) {
        chip.tabIndex = 0;
        chip.setAttribute("role", "button");
        chip.setAttribute("aria-label", `Add ${character.display} at C0`);
    }

    const portrait = document.createElement("div");
    portrait.className = "character-chip-portrait";
    const image = document.createElement("img");
    image.className = "character-chip-image";
    image.src = `assets/characterIcons/${encodeURIComponent(character.display)}.png`;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
        image.src = "assets/characterIcons/Unknown.png";
    }, { once: true });
    portrait.appendChild(image);
    chip.appendChild(portrait);

    const footer = document.createElement("div");
    footer.className = "character-chip-footer";
    const name = document.createElement("span");
    name.className = `character-chip-name${character.display.length > 12 ? " character-chip-name-long" : ""}`;
    name.textContent = character.display;
    footer.appendChild(name);

    if (!isOwned) {
        const addHint = document.createElement("span");
        addHint.className = "character-chip-add-hint";
        addHint.textContent = "Click to add at C0";
        footer.appendChild(addHint);
        chip.appendChild(footer);
        return chip;
    }

    const controls = document.createElement("div");
    controls.className = "character-chip-constellations";

    const decrementButton = document.createElement("button");
    decrementButton.type = "button";
    decrementButton.dataset.characterName = character.display;
    decrementButton.dataset.action = "decrement";
    decrementButton.textContent = "−";
    decrementButton.setAttribute(
        "aria-label",
        constellation === 0
            ? `Remove ${character.display} from owned characters`
            : `Decrease ${character.display} constellation`
    );

    const level = document.createElement("span");
    level.className = "character-chip-level";
    level.textContent = `C${constellation}`;
    level.setAttribute("aria-label", `${character.display} constellation ${constellation}`);

    const incrementButton = document.createElement("button");
    incrementButton.type = "button";
    incrementButton.dataset.characterName = character.display;
    incrementButton.dataset.action = "increment";
    incrementButton.textContent = "+";
    incrementButton.disabled = constellation === 6;
    incrementButton.setAttribute("aria-label", `Increase ${character.display} constellation`);

    controls.append(decrementButton, level, incrementButton);
    footer.appendChild(controls);
    chip.appendChild(footer);
    return chip;
}

function getCharacterOrder(container) {
    return new Map(
        [...container.querySelectorAll(".character-chip")].map(
            (chip, index) => [chip.dataset.characterName, index]
        )
    );
}

function renderCharacterGroup(container, groupCharacters, ownedCharacters, previousOrder) {
    container.replaceChildren();

    if (groupCharacters.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No characters to show.";
        container.appendChild(emptyMessage);
        return;
    }

    const orderedCharacters = groupCharacters
        .map((character, index) => ({
            character,
            index,
            constellation: ownedCharacters[character.rarity][character.display]
        }))
        .sort((left, right) => {
            if (previousOrder) {
                return (previousOrder.get(left.character.display) ?? Infinity) -
                    (previousOrder.get(right.character.display) ?? Infinity) ||
                    left.index - right.index;
            }

            return (right.constellation ?? -1) - (left.constellation ?? -1) ||
                left.index - right.index;
        });

    for (const { character, constellation } of orderedCharacters) {
        container.appendChild(createCharacterChip(character, constellation));
    }
}

export function renderCharacterRoster({ preserveOrder = false } = {}) {
    const recommendedContainer = document.getElementById("recommended-characters");
    const otherContainer = document.getElementById("other-characters");
    if (!recommendedContainer || !otherContainer) {
        return;
    }

    try {
        const recommendedOrder = preserveOrder
            ? getCharacterOrder(recommendedContainer)
            : null;
        const otherOrder = preserveOrder ? getCharacterOrder(otherContainer) : null;
        const ownedCharacters = getExistingCharacters();
        const recommended = getRecommendedCharacters();

        renderCharacterGroup(
            recommendedContainer,
            characters.filter(character => recommended.has(character.display)),
            ownedCharacters,
            recommendedOrder
        );
        renderCharacterGroup(
            otherContainer,
            characters.filter(character => !recommended.has(character.display)),
            ownedCharacters,
            otherOrder
        );
    } catch (error) {
        handleCharacterErrorMessage(`Could not load character roster: ${error.message}`);
    }
}

export function applyCharacterPreset(section, group, constellation) {
    const groupCharacters = Object.hasOwn(characterPresetGroups, group)
        ? characterPresetGroups[group]
        : null;
    let sectionCharacters = null;

    if (section === "all-sections") {
        sectionCharacters = characters;
    } else if (section === "recommended" || section === "other") {
        const recommended = getRecommendedCharacters();
        sectionCharacters = characters.filter(character =>
            section === "recommended"
                ? recommended.has(character.display)
                : !recommended.has(character.display)
        );
    }

    if (
        !groupCharacters ||
        !sectionCharacters ||
        !Number.isInteger(constellation) ||
        constellation < 0 ||
        constellation > 6
    ) {
        throw new Error("Choose a valid character section, group, and constellation.");
    }

    const sectionNames = new Set(
        sectionCharacters.map(character => character.display)
    );
    const selectedCharacters = groupCharacters.filter(character =>
        sectionNames.has(character.display)
    );
    const ownedCharacters = getExistingCharacters();
    for (const character of selectedCharacters) {
        ownedCharacters[character.rarity][character.display] = constellation;
    }

    saveCharacters(ownedCharacters);
    return selectedCharacters.length;
}

export function initializeCharacterRoster() {
    const roster = document.getElementById("characters-form-roster");
    if (!roster) {
        return;
    }

    const presetDialog = document.getElementById("character-presets-dialog");
    const presetSection = document.getElementById("character-presets-section");
    const presetGroup = document.getElementById("character-presets-group");
    const presetConstellation = document.getElementById(
        "character-presets-constellation"
    );

    document.getElementById("open-character-presets")?.addEventListener(
        "click",
        () => presetDialog?.showModal()
    );
    document.getElementById("cancel-character-preset")?.addEventListener(
        "click",
        () => presetDialog?.close()
    );
    document.getElementById("apply-character-preset")?.addEventListener(
        "click",
        () => {
            if (!presetDialog || !presetSection || !presetGroup || !presetConstellation) {
                handleCharacterErrorMessage("Character presets are unavailable.");
                return;
            }

            const constellation = Number(presetConstellation.value);
            const selectedSection = presetSection.value;
            const selectedGroup = presetGroup.value;
            try {
                const count = applyCharacterPreset(
                    selectedSection,
                    selectedGroup,
                    constellation
                );
                handleCharacterSuccessMessage(
                    `${count} characters in the selected group set to C${constellation}.`
                );
                presetDialog.close();
                renderCharacterRoster({ preserveOrder: true });
            } catch (error) {
                handleCharacterErrorMessage(
                    `Could not apply character preset: ${error.message}`
                );
            }
        }
    );

    function updateCharacter(characterName, action) {
        const character = characters.find(
            item => item.display === characterName
        );
        if (!character) {
            handleCharacterErrorMessage("Could not update the selected character.");
            return;
        }

        try {
            const ownedCharacters = getExistingCharacters();
            const owned = Object.hasOwn(
                ownedCharacters[character.rarity],
                character.display
            );

            if (action === "add" && !owned) {
                ownedCharacters[character.rarity][character.display] = 0;
            } else if (action === "increment" && owned) {
                ownedCharacters[character.rarity][character.display] = Math.min(
                    6,
                    ownedCharacters[character.rarity][character.display] + 1
                );
            } else if (action === "decrement" && owned) {
                const currentConstellation =
                    ownedCharacters[character.rarity][character.display];
                if (currentConstellation <= 0) {
                    delete ownedCharacters[character.rarity][character.display];
                } else {
                    ownedCharacters[character.rarity][character.display] =
                        currentConstellation - 1;
                }
            } else {
                return;
            }

            saveCharacters(ownedCharacters);
            renderCharacterRoster({ preserveOrder: true });
        } catch (error) {
            handleCharacterErrorMessage(
                `Could not save ${character.display}: ${error.message}`
            );
        }
    }

    roster.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest("button[data-action]");
        if (button && roster.contains(button)) {
            updateCharacter(button.dataset.characterName, button.dataset.action);
            return;
        }

        const unownedChip = target.closest(
            ".character-chip-unowned[data-character-name]"
        );
        if (!unownedChip || !roster.contains(unownedChip)) {
            return;
        }

        updateCharacter(unownedChip.dataset.characterName, "add");
    });

    roster.addEventListener("keydown", event => {
        if (
            (event.key !== "Enter" && event.key !== " ") ||
            !(event.target instanceof Element)
        ) {
            return;
        }

        const unownedChip = event.target.closest(
            ".character-chip-unowned[data-character-name]"
        );
        if (!unownedChip || !roster.contains(unownedChip)) {
            return;
        }

        event.preventDefault();
        updateCharacter(unownedChip.dataset.characterName, "add");
    });

    document.getElementById("characters-tab")?.addEventListener(
        "click",
        renderCharacterRoster
    );
    renderCharacterRoster();
}
