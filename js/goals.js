import { apiFetch } from "./api.js";
import {
    LimitedFiveCharacterList,
    LimitedFourCharacterList,
    LimitedFiveWeaponList,
    LimitedFourWeaponList
} from "./inventory.js";

import {
    getExistingGoals,
    updateGoals
} from "./storage.js"

import { loadGoals } from "./components/goalCards.js";
import { openDeleteAllGoalsConfirmation } from "./modals.js";

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

const defaultBanner = {
    banner_name: "Example Banner",
    banner_five_item_primary: "Anastasya",
    banner_five_item_secondary: null,   
    banner_four_items: ["a"],
    item_type: "weapon",
};

function getGoalFormValues() {
    const goalName = document.getElementById(
        "goals-form-goal-name"
    ).value;

    const itemType = document.getElementById(
        "goals-form-item-type"
    ).value;

    const itemRarity = document.getElementById(
        "goals-form-item-rarity"
    ).value;

    const goalBanner = defaultBanner;




    /* Initialize */
    var itemTargetCount = null;;
    var itemName = null;
    
    if (itemType == "character"){
        itemName = document.getElementById("goals-form-character-item-name").value;
        itemTargetCount = document.getElementById(
            "goals-form-character-target-count"
        ).value;
    } else {
        itemName = document.getElementById("goals-form-weapon-item-name").value;
        itemTargetCount = document.getElementById(
            "goals-form-weapon-target-count"
        ).value;
    }

    /* Initialize as True and change depending on what the user chose for the 4* item */
    var itemHighPriority = document.getElementById("goals-form-character-item-high-priority").checked;

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

function populateSelect(select, items) {
    select.innerHTML = "";

    items.forEach(item => {
        const option = document.createElement("option");

        option.value = item.value;
        option.textContent = item.display;

        select.appendChild(option);
    });
}

function populateGoalItem(itemType, itemRarity) {
    if (itemType === "character") {
        const select = document.querySelector(
            "#goals-form-character-item-name"
        );

        const items = itemRarity === "five"
            ? LimitedFiveCharacterList
            : LimitedFourCharacterList;

        populateSelect(select, items);
    } else {
        const select = document.querySelector(
            "#goals-form-weapon-item-name"
        );

        const items = itemRarity === "five"
            ? LimitedFiveWeaponList
            : LimitedFourWeaponList;

        populateSelect(select, items);
    }
}

export function initializeGoalForm() {
    loadGoals()
    const itemTypeSelect = document.getElementById(
        "goals-form-item-type"
    );

    const itemRaritySelect = document.getElementById(
        "goals-form-item-rarity"
    );

    const createGoalButton = document.getElementById("create-goal");
    const deleteAllGoalsButton = document.getElementById("delete-all-goals");
    const CreateBannerWithGoalButton = document.getElementById("create-banner-with-goal");
    const GoalsCustomItemsButton = document.getElementById("goals-custom-items");

    const characterTargetCountForm = document.getElementById("goals-form-character-target-count");
    const weaponTargetCountForm = document.getElementById("goals-form-weapon-target-count");
    
    characterTargetCountForm.addEventListener("input", limitItemTargetCount);
    weaponTargetCountForm.addEventListener("input",limitItemTargetCount);

    function updateGoalItemForm() {
        const itemType = getGoalFormValues().item_type
        const itemRarity = getGoalFormValues().item_rarity

        switchItemTypeFieldset(itemType);
        renderHighPriorityOption(itemRarity);
        populateGoalItem(itemType, itemRarity);
    }


    updateGoalItemForm();


    itemTypeSelect.addEventListener("change", updateGoalItemForm);
    itemRaritySelect.addEventListener("change", updateGoalItemForm);
    createGoalButton.addEventListener("click", createGoal)
    deleteAllGoalsButton.addEventListener("click", openDeleteAllGoalsConfirmation);

}

function limitItemTargetCount(){
    const form = document.querySelector("#goals-form");

    form.querySelectorAll("input[type='number']").forEach(input => {
        input.addEventListener("input", () => {
            if (input.value === "") return;

            const min = 0;
            const max = Number(input.max);
            const value = Number(input.value);

            input.value = Math.min(Math.max(value, min), max);
        });
    });
}

async function createGoal(){
    const existingGoals = getExistingGoals()
    const request = {
        existing_goals : existingGoals,
        new_goal: getGoalFormValues(),
    };

    const response = await apiFetch("/goals", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (response.status == 200) {
        console.log(result)
        updateGoals(result)
        handleGoalSuccessMessage(`Successfully created goal "${result.goal_name}"!`)
        loadGoals()
        
    } else {  
        console.log(result)
        handleGoalErrorMessage(result.message)
        return;
    }   
};


export function handleGoalErrorMessage(error){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = false;
    errorContainer.textContent = error
}

export function handleGoalSuccessMessage(message){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = false;
    errorContainer.hidden = true;
    successContainer.textContent = message
}

export function clearErrorAndSuccessMessage(){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
}