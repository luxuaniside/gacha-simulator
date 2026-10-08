

import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "../inventory.js";

import { MultiSelect } from "../components/multiSelect.js";
import { editBanner } from "./bannersService.js";
import { getExistingGoals } from "../storage/goals.js";

let editingBannerUuid;
let editingBanner;
let goalsUsingBanner = [];

let editFourCharacterMultiSelect;
let editFourWeaponMultiSelect;


export function initializeBannerEditor() {
    const editDialog = document.getElementById("edit-banner-dialog");
    const saveEditedBannerButton = document.getElementById(
        "save-banner-edit"
    );
    const cancelEditedBannerButton = document.getElementById(
        "cancel-banner-edit"
    );

    saveEditedBannerButton.addEventListener("click", () => {
        if (!validateBannerItemsInUse()) {
            return;
        }

        editDialog.close();
        editBanner();
    });

    cancelEditedBannerButton.addEventListener("click", () => {
        editDialog.close();
    });


    // Initialize forms
    const itemTypeSelect = document.getElementById(
        "edit-banner-item-type"
    );


    // Initialize MultiSelects
    initializeEditMultiSelects();


    // Change item type form
    updateEditBannerItemForm();

    itemTypeSelect.addEventListener(
        "change",
        updateEditBannerItemForm
    );
}


// Populate the edit form with an existing banner
export function populateEditBannerForm(banner) {
    editingBanner = banner;
    editingBannerUuid = banner.banner_uuid;
    goalsUsingBanner = getExistingGoals().filter(
        goal => goal.goal_banner?.banner_uuid === banner.banner_uuid
    );
    clearEditBannerMessages();

    const itemTypeSelect = document.getElementById(
        "edit-banner-item-type"
    );
    itemTypeSelect.disabled = goalsUsingBanner.length > 0;
    document.getElementById("edit-banner-character-primary-item").disabled = false;
    document.getElementById("edit-banner-weapon-primary-item").disabled = false;
    document.getElementById("edit-banner-weapon-secondary-item").disabled = false;
    const warningContainer = document.getElementById(
        "edit-banner-warning-container"
    );
    warningContainer.hidden = goalsUsingBanner.length === 0;
    warningContainer.textContent = goalsUsingBanner.length > 0
        ? "Because this banner is being used by a goal, some of its items cannot be directly edited."
        : "";

    document.getElementById(
        "edit-banner-name"
    ).value = banner.banner_name ?? "";

    itemTypeSelect.value = banner.item_type;

    // This populates the correct fieldset and 5-star selects
    updateEditBannerItemForm();

    const isCharacter = banner.item_type === "character";

    if (isCharacter) {
        const primaryItem = document.getElementById(
            "edit-banner-character-primary-item"
        );

        primaryItem.value = banner.banner_five_item_primary;

        editFourCharacterMultiSelect.setValues(
            banner.banner_four_items ?? []
        );
        editFourCharacterMultiSelect.setLockedValues(
            getGoalItemsInUse()
        );
        primaryItem.disabled = isItemUsedByGoal(banner.banner_five_item_primary);

    } else {
        const primaryItem = document.getElementById(
            "edit-banner-weapon-primary-item"
        );

        const secondaryItem = document.getElementById(
            "edit-banner-weapon-secondary-item"
        );

        primaryItem.value = banner.banner_five_item_primary;
        secondaryItem.value = banner.banner_five_item_secondary;

        editFourWeaponMultiSelect.setValues(
            banner.banner_four_items ?? []
        );
        editFourWeaponMultiSelect.setLockedValues(
            getGoalItemsInUse()
        );
        primaryItem.disabled = isItemUsedByGoal(banner.banner_five_item_primary);
        secondaryItem.disabled = isItemUsedByGoal(banner.banner_five_item_secondary);
    }
}


// Per item type functions
function updateEditBannerItemForm() {
    const itemType = getEditBannerFormValues().item_type;

    switchEditBannerItemTypeFieldset(itemType);
    populateEditBannerFiveItem(itemType);
}


// Per item type fieldset
function switchEditBannerItemTypeFieldset(itemType) {
    const characterFieldset = document.getElementById(
        "edit-banner-character-fieldset"
    );

    const weaponFieldset = document.getElementById(
        "edit-banner-weapon-fieldset"
    );

    if (itemType === "character") {
        characterFieldset.hidden = false;
        weaponFieldset.hidden = true;
    } else {
        characterFieldset.hidden = true;
        weaponFieldset.hidden = false;
    }
}


// Populates the 5-star item lists
function populateEditBannerFiveItem(itemType) {
    const isCharacter = itemType === "character";

    if (isCharacter) {
        const primaryCharacter = document.getElementById(
            "edit-banner-character-primary-item"
        );

        primaryCharacter.innerHTML = "";

        LimitedFiveCharacterList.forEach(item => {
            const option = document.createElement("option");

            option.value = item.value;
            option.textContent = item.display;

            primaryCharacter.appendChild(option);
        });

    } else {
        const primaryWeapon = document.getElementById(
            "edit-banner-weapon-primary-item"
        );

        const secondaryWeapon = document.getElementById(
            "edit-banner-weapon-secondary-item"
        );

        primaryWeapon.innerHTML = "";
        secondaryWeapon.innerHTML = "";

        LimitedFiveWeaponList.forEach(item => {
            const option = document.createElement("option");

            option.value = item.value;
            option.textContent = item.display;

            primaryWeapon.appendChild(option);
            secondaryWeapon.appendChild(
                option.cloneNode(true)
            );
        });
    }
}

function getGoalItemsInUse() {
    return getGoalsUsingBanner().map(goal => goal.item_name);
}

function getGoalsUsingBanner() {
    return getExistingGoals().filter(
        goal => goal.goal_banner?.banner_uuid === editingBannerUuid
    );
}

function isItemUsedByGoal(itemName) {
    return getGoalItemsInUse().includes(itemName);
}

function clearEditBannerMessages() {
    document.getElementById("edit-banner-success-container").hidden = true;
    const warningContainer = document.getElementById(
        "edit-banner-warning-container"
    );
    warningContainer.hidden = true;
    warningContainer.textContent = "";
}

function validateBannerItemsInUse() {
    const warningContainer = document.getElementById(
        "edit-banner-warning-container"
    );
    const values = getEditBannerFormValues();
    const currentGoalsUsingBanner = getGoalsUsingBanner();

    if (currentGoalsUsingBanner.length === 0) {
        warningContainer.hidden = true;
        return true;
    }

    const featuredItems = new Set([
        values.banner_five_item_primary,
        values.banner_five_item_secondary,
        ...values.banner_four_items
    ]);
    const missingItems = getGoalItemsInUse().filter(
        itemName => !featuredItems.has(itemName)
    );

    if (values.item_type !== editingBanner.item_type || missingItems.length > 0) {
        warningContainer.textContent = missingItems.length > 0
            ? `Cannot remove featured items used by goals: ${missingItems.join(", ")}.`
            : "Cannot change the item type while goals are using this banner.";
        warningContainer.hidden = false;
        return false;
    }

    return true;
}


// Initialize the edit MultiSelects
function initializeEditMultiSelects() {
    editFourCharacterMultiSelect = new MultiSelect(
        document.getElementById("edit-four-character-select"),
        LimitedFourCharacterList,
        {
            max: 3,
            selectedItems: LimitedFourCharacterList
                .slice(0, 3)
                .map(item => item.value)
        }
    );

    editFourWeaponMultiSelect = new MultiSelect(
        document.getElementById("edit-four-weapon-select"),
        LimitedFourWeaponList,
        {
            max: 5,
            selectedItems: LimitedFourWeaponList
                .slice(0, 5)
                .map(item => item.value)
        }
    );
}


export function getEditBannerFormValues() {
    const bannerName = document.getElementById(
        "edit-banner-name"
    ).value;

    const itemType = document.getElementById(
        "edit-banner-item-type"
    ).value;

    const isCharacterBanner = itemType === "character";

    let bannerFiveItemPrimary = null;
    let bannerFiveItemSecondary = null;
    let bannerFourItems = [];

    if (isCharacterBanner) {
        bannerFiveItemPrimary = document.getElementById(
            "edit-banner-character-primary-item"
        ).value;

        bannerFourItems =
            editFourCharacterMultiSelect?.getValues() ?? [];

    } else {
        bannerFiveItemPrimary = document.getElementById(
            "edit-banner-weapon-primary-item"
        ).value;

        bannerFiveItemSecondary = document.getElementById(
            "edit-banner-weapon-secondary-item"
        ).value;

        bannerFourItems =
            editFourWeaponMultiSelect?.getValues() ?? [];
    }

    return {
        banner_uuid: editingBannerUuid,
        banner_name: bannerName,
        banner_five_item_primary: bannerFiveItemPrimary,
        banner_five_item_secondary: bannerFiveItemSecondary,
        banner_four_items: bannerFourItems,
        item_type: itemType
    };
}