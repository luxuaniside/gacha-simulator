import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "../inventory.js";
import { editGoal } from "./goalService.js";


import { getBanner, getExistingBanners } from "../storage/banners.js";
let editingGoalUuid;

export function initializeGoalEditor() {
    const editDialog = document.getElementById("edit-goal-dialog");
    const saveEditedGoalButton = document.getElementById("save-edited-goal");
    const cancelEditedGoalButton = document.getElementById("cancel-editing-goal");

    saveEditedGoalButton.addEventListener("click", () => {
        editDialog.close();
        editGoal();
    });

    cancelEditedGoalButton.addEventListener("click", () => {
        editDialog.close();
    });

    // Initialize forms
    const itemTypeSelect = document.getElementById("edit-goal-item-type");
    const itemRaritySelect = document.getElementById("edit-goal-item-rarity");
    const characterTargetCountForm = document.getElementById(
        "edit-goal-character-target-count"
    );
    const weaponTargetCountForm = document.getElementById(
        "edit-goal-weapon-target-count"
    );

    // Limit Constellation and Refinements to C0-C6 and R1-R5 respectively
    characterTargetCountForm.addEventListener(
        "input",
        limitEditItemTargetCount
    );

    weaponTargetCountForm.addEventListener(
        "input",
        limitEditItemTargetCount
    );

    // Change item type form
    updateEditGoalItemForm();

    itemTypeSelect.addEventListener(
        "change",
        updateEditGoalItemForm
    );

    itemRaritySelect.addEventListener(
        "change",
        updateEditGoalItemForm
    );

    document.getElementById("edit-goal-character-item-name").addEventListener(
        "change",
        event => populateEditGoalBanner(event.currentTarget.value)
    );
    document.getElementById("edit-goal-weapon-item-name").addEventListener(
        "change",
        event => populateEditGoalBanner(event.currentTarget.value)
    );
}

export function populateEditGoalForm(goal) {
    editingGoalUuid = goal.goal_uuid;

    const itemTypeSelect = document.getElementById("edit-goal-item-type");
    const itemRaritySelect = document.getElementById("edit-goal-item-rarity");

    document.getElementById("edit-goal-name").value = goal.goal_name;

    itemTypeSelect.value = goal.item_type;
    itemRaritySelect.value = goal.item_rarity;

    // This populates the item select based on type + rarity
    updateEditGoalItemForm();

    const isCharacter = goal.item_type === "character";

    const itemSelect = document.getElementById(
        isCharacter
            ? "edit-goal-character-item-name"
            : "edit-goal-weapon-item-name"
    );

    const targetCount = document.getElementById(
        isCharacter
            ? "edit-goal-character-target-count"
            : "edit-goal-weapon-target-count"
    );

    const highPriority = document.getElementById(
        isCharacter
            ? "edit-goal-character-item-high-priority"
            : "edit-goal-weapon-item-high-priority"
    );

    // These options now exist because updateEditGoalItemForm()
    // populated the select first.
    itemSelect.value = goal.item_name;
    targetCount.value = goal.item_target_count;
    highPriority.checked = goal.item_high_priority;
    populateEditGoalBanner(
        goal.item_name,
        goal.goal_banner?.banner_uuid ?? ""
    );
}


// Per item type functions
function updateEditGoalItemForm() {
    const itemType = getEditGoalFormValues().item_type;
    const itemRarity = getEditGoalFormValues().item_rarity;

    switchEditGoalItemTypeFieldset(itemType);
    renderEditHighPriorityOption(itemRarity);
    populateEditGoalItem(itemType, itemRarity);
    populateEditGoalBanner(getCurrentEditGoalItemName());
}


// Per item type fieldset
function switchEditGoalItemTypeFieldset(itemType) {
    const characterFieldset = document.getElementById(
        "edit-goal-character-fieldset"
    );

    const weaponFieldset = document.getElementById(
        "edit-goal-weapon-fieldset"
    );

    if (itemType === "character") {
        characterFieldset.hidden = false;
        weaponFieldset.hidden = true;
    } else {
        characterFieldset.hidden = true;
        weaponFieldset.hidden = false;
    }
}


function renderEditHighPriorityOption(itemRarity) {
    const highPriorityForms = document.getElementsByClassName(
        "item-high-priority-checkbox-field"
    );

    /*
    Scrapped idea of not letting 5* Items be low priority

    for (const form of highPriorityForms) {
        form.hidden = itemRarity !== "four";
    }
    */

    for (const form of highPriorityForms) {
        form.hidden = false;
    }
}


// Populates the item list depending on item type and rarity
function populateEditGoalItem(itemType, itemRarity) {
    const isCharacter = itemType === "character";

    const select = document.querySelector(
        isCharacter
            ? "#edit-goal-character-item-name"
            : "#edit-goal-weapon-item-name"
    );

    const items = isCharacter
        ? (itemRarity === "five"
            ? LimitedFiveCharacterList
            : LimitedFourCharacterList)
        : (itemRarity === "five"
            ? LimitedFiveWeaponList
            : LimitedFourWeaponList);

    select.innerHTML = "";

    items.forEach(item => {
        const option = document.createElement("option");

        option.value = item.value;
        option.textContent = item.display;

        select.appendChild(option);
    });
}

function getCurrentEditGoalItemName() {
    const itemType = document.getElementById("edit-goal-item-type").value;
    const itemSelect = document.getElementById(
        itemType === "character"
            ? "edit-goal-character-item-name"
            : "edit-goal-weapon-item-name"
    );

    return itemSelect.value;
}

function populateEditGoalBanner(itemName, preferredBannerUuid = "") {
    const bannerSelect = document.getElementById("edit-goal-banner");
    const matchingBanners = getExistingBanners().filter(banner =>
        banner.banner_five_item_primary === itemName ||
        banner.banner_five_item_secondary === itemName ||
        (banner.banner_four_items ?? []).includes(itemName)
    );

    bannerSelect.innerHTML = "";

    if (matchingBanners.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No banner found.";
        bannerSelect.appendChild(option);
        bannerSelect.disabled = true;
        return;
    }

    matchingBanners.forEach(banner => {
        const option = document.createElement("option");
        option.value = banner.banner_uuid;
        option.textContent = banner.banner_name;
        bannerSelect.appendChild(option);
    });

    bannerSelect.disabled = false;
    bannerSelect.value = matchingBanners.some(
        banner => banner.banner_uuid === preferredBannerUuid
    )
        ? preferredBannerUuid
        : matchingBanners[0].banner_uuid;
}


function limitEditItemTargetCount() {
    const form = document.querySelector("#edit-goals-form");

    form.querySelectorAll("input[type='number']").forEach(input => {
        if (input.value === "") return;

        const min = Number(input.min);
        const max = Number(input.max);
        const value = Number(input.value);

        input.value = Math.min(Math.max(value, min), max);
    });
}


export function getEditGoalFormValues() {
    const goalName = document.getElementById(
        "edit-goal-name"
    ).value;

    const itemType = document.getElementById(
        "edit-goal-item-type"
    ).value;

    const itemRarity = document.getElementById(
        "edit-goal-item-rarity"
    ).value;

    var goalBanner = document.getElementById(
        "edit-goal-banner"
    ).value;

    // Convert the string "null" or empty string to an actual JavaScript null
    var goalBanner = (goalBanner === "null" || goalBanner === "")
        ? null
        : goalBanner;

    goalBanner = getBanner(goalBanner);

    /* Initialize */
    var itemTargetCount = null;
    var itemName = null;

    if (itemType === "character") {
        itemName = document.getElementById(
            "edit-goal-character-item-name"
        ).value;

        itemTargetCount = document.getElementById(
            "edit-goal-character-target-count"
        ).value;

        var itemHighPriority = document.getElementById(
            "edit-goal-character-item-high-priority"
        ).checked;

    } else {
        itemName = document.getElementById(
            "edit-goal-weapon-item-name"
        ).value;

        itemTargetCount = document.getElementById(
            "edit-goal-weapon-target-count"
        ).value;

        var itemHighPriority = document.getElementById(
            "edit-goal-weapon-item-high-priority"
        ).checked;
    }

    return {
        goal_uuid: editingGoalUuid,
        goal_name: goalName,
        item_name: itemName,
        goal_banner: goalBanner,
        item_type: itemType,
        item_rarity: itemRarity,
        item_target_count: itemTargetCount,
        item_high_priority: itemHighPriority,
    };
}
