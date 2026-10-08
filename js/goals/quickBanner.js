import { MultiSelect } from "../components/multiSelect.js";
import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "../inventory.js";
import { createBanner } from "../banners/bannersService.js";
import { refreshGoalBannersForCurrentItem } from "./goalForm.js";
import { handleGoalSuccessMessage } from "./goalMessage.js";

let fourCharacterMultiSelect;
let fourWeaponMultiSelect;
let goalItem = null;

export function initializeQuickBanner() {
    const dialog = document.getElementById("quick-banner-dialog");
    const itemTypeSelect = document.getElementById("quick-banner-item-type");

    fourCharacterMultiSelect = new MultiSelect(
        document.getElementById("quick-banner-four-characters"),
        LimitedFourCharacterList,
        { max: 3 }
    );
    fourWeaponMultiSelect = new MultiSelect(
        document.getElementById("quick-banner-four-weapons"),
        LimitedFourWeaponList,
        { max: 5 }
    );

    itemTypeSelect.addEventListener("change", updateQuickBannerForm);
    document.getElementById("create-banner-with-goal").addEventListener(
        "click",
        openQuickBanner
    );
    document.getElementById("quick-banner-cancel").addEventListener(
        "click",
        () => dialog.close()
    );
    document.getElementById("quick-banner-create").addEventListener(
        "click",
        submitQuickBanner
    );
}

function openQuickBanner() {
    goalItem = {
        itemName: getSelectedGoalItem(),
        itemType: document.getElementById("goals-form-item-type").value,
        itemRarity: document.getElementById("goals-form-item-rarity").value
    };

    document.getElementById("quick-banner-item-type").value = goalItem.itemType;
    document.getElementById("quick-banner-name").value = "";
    clearQuickBannerMessages();
    updateQuickBannerForm();
    document.getElementById("quick-banner-dialog").showModal();
}

function getSelectedGoalItem() {
    const itemType = document.getElementById("goals-form-item-type").value;
    return document.getElementById(
        itemType === "character"
            ? "goals-form-character-item-name"
            : "goals-form-weapon-item-name"
    ).value;
}

function updateQuickBannerForm() {
    const itemType = document.getElementById("quick-banner-item-type").value;
    const isCharacter = itemType === "character";

    document.getElementById("quick-banner-character-fieldset").hidden = !isCharacter;
    document.getElementById("quick-banner-weapon-fieldset").hidden = isCharacter;

    populateFiveStarOptions(
        document.getElementById("quick-banner-character-primary"),
        LimitedFiveCharacterList,
        isCharacter && goalItem?.itemRarity === "five" ? goalItem.itemName : ""
    );

    const primaryWeapon = document.getElementById("quick-banner-weapon-primary");
    const secondaryWeapon = document.getElementById("quick-banner-weapon-secondary");
    const suggestedFiveStar = !isCharacter && goalItem?.itemRarity === "five"
        ? goalItem.itemName
        : "";
    populateFiveStarOptions(primaryWeapon, LimitedFiveWeaponList, suggestedFiveStar);
    populateFiveStarOptions(secondaryWeapon, LimitedFiveWeaponList);
    if (primaryWeapon.value === secondaryWeapon.value) {
        secondaryWeapon.value = LimitedFiveWeaponList.find(
            item => item.value !== primaryWeapon.value
        )?.value ?? "";
    }

    fourCharacterMultiSelect.setValues(
        getSuggestedFourStarItems(
            LimitedFourCharacterList,
            isCharacter && goalItem?.itemRarity === "four" ? goalItem.itemName : "",
            3
        )
    );
    fourWeaponMultiSelect.setValues(
        getSuggestedFourStarItems(
            LimitedFourWeaponList,
            !isCharacter && goalItem?.itemRarity === "four" ? goalItem.itemName : "",
            5
        )
    );
}

function populateFiveStarOptions(select, items, suggestedValue = "") {
    select.replaceChildren();

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.display;
        select.appendChild(option);
    });

    if (items.some(item => item.value === suggestedValue)) {
        select.value = suggestedValue;
    }
}

function getSuggestedFourStarItems(items, suggestedValue, requiredCount) {
    const selected = items.some(item => item.value === suggestedValue)
        ? [suggestedValue]
        : [];

    for (const item of items) {
        if (selected.length >= requiredCount) {
            break;
        }
        if (!selected.includes(item.value)) {
            selected.push(item.value);
        }
    }

    return selected;
}

async function submitQuickBanner() {
    clearQuickBannerMessages();
    const bannerValues = getQuickBannerValues();
    const createButton = document.getElementById("quick-banner-create");
    createButton.disabled = true;

    try {
        await createBanner({
            bannerValues,
            onSuccess: result => {
                refreshGoalBannersForCurrentItem(result.banner_uuid);
                document.getElementById("quick-banner-dialog").close();
                handleGoalSuccessMessage(
                    `Created and selected new banner "${result.banner_name}".`
                );
            },
            onError: message => showQuickBannerMessage(
                "error",
                message || "The banner could not be created."
            )
        });
    } catch (error) {
        console.error("Quick banner creation failed:", error);
        showQuickBannerMessage(
            "error",
            error instanceof Error
                ? error.message
                : "The banner could not be created."
        );
    } finally {
        createButton.disabled = false;
    }
}

function getQuickBannerValues() {
    const itemType = document.getElementById("quick-banner-item-type").value;
    const isCharacter = itemType === "character";

    return {
        banner_name: document.getElementById("quick-banner-name").value,
        banner_five_item_primary: document.getElementById(
            isCharacter
                ? "quick-banner-character-primary"
                : "quick-banner-weapon-primary"
        ).value,
        banner_five_item_secondary: isCharacter
            ? null
            : document.getElementById("quick-banner-weapon-secondary").value,
        banner_four_items: isCharacter
            ? fourCharacterMultiSelect.getValues()
            : fourWeaponMultiSelect.getValues(),
        item_type: itemType
    };
}

function clearQuickBannerMessages() {
    const errorContainer = document.getElementById("quick-banner-error-container");
    errorContainer.hidden = true;
    errorContainer.textContent = "";
}

function showQuickBannerMessage(messageType, message) {
    const errorContainer = document.getElementById("quick-banner-error-container");
    errorContainer.hidden = messageType !== "error";
    errorContainer.textContent = message;
}
