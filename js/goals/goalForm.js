import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "../inventory.js";

import { getBanner, getExistingBanners } from "../storage/banners.js"


export function initializeGoalForm() {
    // Initialize forms 
    const itemTypeSelect = document.getElementById("goals-form-item-type");
    const itemRaritySelect = document.getElementById("goals-form-item-rarity");
    const characterTargetCountForm = document.getElementById("goals-form-character-target-count");
    const weaponTargetCountForm = document.getElementById("goals-form-weapon-target-count");

    // Limit Constellation and Refinements to C0-C6 and R1-R5 respectively
    characterTargetCountForm.addEventListener("input", limitItemTargetCount);
    weaponTargetCountForm.addEventListener("input", limitItemTargetCount);

    // Change item type form
    updateGoalItemForm();
    itemTypeSelect.addEventListener("change", updateGoalItemForm);
    itemRaritySelect.addEventListener("change", updateGoalItemForm);
    document.getElementById("goals-form-character-item-name").addEventListener(
        "change",
        () => refreshGoalBannersForCurrentItem()
    );
    document.getElementById("goals-form-weapon-item-name").addEventListener(
        "change",
        () => refreshGoalBannersForCurrentItem()
    );
}

// Per item type functions
export function updateGoalItemForm() {
    const goalFormValues = getGoalFormValues()

    const itemType = goalFormValues.item_type
    const itemRarity = goalFormValues.item_rarity

    switchItemTypeFieldset(itemType);
    renderHighPriorityOption(itemRarity);
    populateGoalItem(itemType, itemRarity);
    populateGoalBanner(getCurrentGoalItemName());
}

function getCurrentGoalItemName() {
    const itemType = document.getElementById("goals-form-item-type").value;
    return document.getElementById(
        itemType === "character"
            ? "goals-form-character-item-name"
            : "goals-form-weapon-item-name"
    ).value;
}

export function refreshGoalBannersForCurrentItem(preferredBannerUuid = "") {
    populateGoalBanner(getCurrentGoalItemName(), preferredBannerUuid);
}

function populateGoalBanner(itemName, preferredBannerUuid = "") {
    const goalBannerForm = document.getElementById("goals-form-banner");
    const matchingBanners = getBannersContainingItem(itemName);
    const preferredBanner = preferredBannerUuid
        ? getExistingBanners().find(
            banner => banner.banner_uuid === preferredBannerUuid
        )
        : null;
    if (
        preferredBanner &&
        !matchingBanners.some(
            banner => banner.banner_uuid === preferredBanner.banner_uuid
        )
    ) {
        matchingBanners.push(preferredBanner);
    }

    goalBannerForm.innerHTML = "";

    if (matchingBanners.length === 0) {
        const nothingFound = document.createElement("option");
        nothingFound.value = "";
        nothingFound.textContent = "No banner found."
        goalBannerForm.disabled = true;
        goalBannerForm.appendChild(nothingFound);
        return;
    }

    matchingBanners.forEach(banner => {
        const option = document.createElement("option");
        option.value = banner.banner_uuid;
        option.textContent = banner.banner_name;
        goalBannerForm.appendChild(option);
    });

    goalBannerForm.disabled = false;
    goalBannerForm.value = matchingBanners.some(
        banner => banner.banner_uuid === preferredBannerUuid
    )
        ? preferredBannerUuid
        : matchingBanners[0].banner_uuid;
}


function getBannersContainingItem(itemName) {
    return getExistingBanners().filter(banner =>
        banner.banner_five_item_primary === itemName ||
        banner.banner_five_item_secondary === itemName ||
        (banner.banner_four_items ?? []).includes(itemName)
    );
}
// Per item type fieldset
function switchItemTypeFieldset(itemType) {
    const characterFieldset = document.getElementById(
        "goals-form-character-fieldset"
    );
    const weaponFieldset = document.getElementById(
        "goals-form-weapon-fieldset"
    );

    if (itemType === "character") {
        characterFieldset.hidden = false;
        weaponFieldset.hidden = true;
    } else {
        characterFieldset.hidden = true;
        weaponFieldset.hidden = false;
    }
}

function renderHighPriorityOption(itemRarity) {
    const highPriorityForms = document.getElementsByClassName(
        "item-high-priority-checkbox-field"
    );
    /* Scrapped idea of not letting 5* Items be low priority 
    for (const form of highPriorityForms) {
        form.hidden = itemRarity !== "four";
    }
    */

    for (const form of highPriorityForms) {
        form.hidden = false;
    }
}

//Populates the item list depending on item type and rarity
function populateGoalItem(itemType, itemRarity) {
    const isCharacter = itemType === "character";

    const select = document.querySelector(
        isCharacter
            ? "#goals-form-character-item-name"
            : "#goals-form-weapon-item-name"
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

function limitItemTargetCount(event) {
    const input = event.currentTarget;
    if (input.value === "") return;

    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);

    input.value = String(Math.min(Math.max(value, min), max));
}

export function getGoalFormValues() {
    const goalName = document.getElementById(
        "goals-form-goal-name"
    ).value;

    const itemType = document.getElementById(
        "goals-form-item-type"
    ).value;

    const itemRarity = document.getElementById(
        "goals-form-item-rarity"
    ).value;

    var goalBanner = document.getElementById(
        "goals-form-banner"
    ).value;

    // Convert the string "null" or empty string to an actual JavaScript null token
    var goalBanner = (goalBanner === "null" || goalBanner === "") ? null : goalBanner;
    goalBanner = getBanner(goalBanner)

    /* Initialize */
    var itemTargetCount = null;;
    var itemName = null;

    if (itemType == "character") {
        itemName = document.getElementById("goals-form-character-item-name").value;
        itemTargetCount = document.getElementById(
            "goals-form-character-target-count"
        ).value;
        var itemHighPriority = document.getElementById("goals-form-character-item-high-priority").checked;
    } else {
        itemName = document.getElementById("goals-form-weapon-item-name").value;
        itemTargetCount = document.getElementById(
            "goals-form-weapon-target-count"
        ).value;
        var itemHighPriority = document.getElementById("goals-form-weapon-item-high-priority").checked;
    }

    /* Initialize as True and change depending on what the user chose for the 4* item */


    return {
        goal_name: goalName,
        item_name: itemName,
        goal_banner: goalBanner,
        item_type: itemType,
        item_rarity: itemRarity,
        item_target_count: itemTargetCount,
        item_high_priority: itemHighPriority,
    };
}
