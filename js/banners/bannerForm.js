import { MultiSelect } from "../components/multiSelect.js";
import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "../inventory.js";

let fourCharacterMultiSelect;
let fourWeaponMultiSelect;

export function initializeBannerForm() {

    initializeMultiSelects();

    const itemTypeSelect = document.getElementById("banners-form-item-type");

    // Change item type form
    updateBannerItemForm();
    itemTypeSelect.addEventListener("change", updateBannerItemForm);


}

// Per item type functions
export function updateBannerItemForm() {
    const itemType = getBannerFormValues().item_type
    const itemRarity = "five"

    switchItemTypeFieldset(itemType);
    populateBannerFiveItem(itemType, itemRarity);
}

// Per item type fieldset
function switchItemTypeFieldset(itemType) {
    const characterFieldset = document.getElementById(
        "banners-form-character-fieldset"
    );
    const weaponFieldset = document.getElementById(
        "banners-form-weapon-fieldset"
    );

    if (itemType === "character") {
        characterFieldset.hidden = false;
        weaponFieldset.hidden = true;
    } else {
        characterFieldset.hidden = true;
        weaponFieldset.hidden = false;
    }
}

function populateBannerFiveItem(itemType) {
    const isCharacter = itemType === "character";

    if (isCharacter) {
        const items = LimitedFiveCharacterList
        const primaryCharacter = document.getElementById("banners-form-character-primary-item")
        primaryCharacter.innerHTML = "";
        items.forEach(item => {
            const option = document.createElement("option");

            option.value = item.value;
            option.textContent = item.display;

            primaryCharacter.appendChild(option);
        });
    } else {
        const items = LimitedFiveWeaponList;
        const primaryWeapon = document.getElementById("banners-form-weapon-primary-item")
        const secondaryWeapon = document.getElementById("banners-form-weapon-secondary-item")
        primaryWeapon.innerHTML = "";
        secondaryWeapon.innerHTML = "";
        items.forEach(item => {
            const option = document.createElement("option");

            option.value = item.value;
            option.textContent = item.display;

            primaryWeapon.appendChild(option);
            secondaryWeapon.appendChild(option.cloneNode(true));
        });
        primaryWeapon.value = "FreedomSworn"
        secondaryWeapon.value = "SummitShaper"
    }
};

export function getBannerFormValues() {
    const itemType = document.getElementById("banners-form-item-type").value;
    const isCharacterBanner = itemType === "character";
    const fourItemsSelect = isCharacterBanner
        ? fourCharacterMultiSelect
        : fourWeaponMultiSelect;

    return {
        banner_name: document.getElementById("banners-form-banner-name").value,
        banner_five_item_primary: document.getElementById(
            isCharacterBanner
                ? "banners-form-character-primary-item"
                : "banners-form-weapon-primary-item"
        ).value,
        banner_five_item_secondary: isCharacterBanner
            ? null
            : document.getElementById("banners-form-weapon-secondary-item").value,
        banner_four_items: fourItemsSelect?.getValues() ?? [],
        item_type: itemType
    };
}

function initializeMultiSelects() {
    fourCharacterMultiSelect = new MultiSelect(
        document.getElementById("four-character-select"),
        LimitedFourCharacterList,
        {
            max: 3,
            selectedItems: LimitedFourCharacterList
                .slice(0, 3)
                .map(item => item.value)
        }
    );

    fourWeaponMultiSelect = new MultiSelect(
        document.getElementById("four-weapon-select"),
        LimitedFourWeaponList,
        {
            max: 5,
            selectedItems: LimitedFourWeaponList
                .slice(0, 5)
                .map(item => item.value)
        }
    );
}