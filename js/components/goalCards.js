import { getExistingGoals, getDisabledGoalIds, saveDisabledGoalIds, saveGoals, updateGoals } from "../storage.js";
import { handleGoalErrorMessage, handleGoalSuccessMessage, clearErrorAndSuccessMessage } from "../goals.js";
import { openDeleteGoalConfirmation } from "../modals.js";


export function loadGoals() {
    const template = document.getElementById("goal-template");
    const goalsList = document.querySelector(".goals-list");
    const goals = getExistingGoals();



    goalsList.innerHTML = "";

    goals.forEach((goal, index) => {
        const clone = template.content.cloneNode(true);
        initializeGoalButtons(clone, goal, index)
        displayDisabledGoals(clone, goal)
        goalCardGroupPopulate(clone, goal)

        goalsList.appendChild(clone);
    });
        
    handleNoGoalsMessage(goals);
}
// Goal button functions

function moveItem(goals, goalIndex, direction) {
    const newIndex = goalIndex + direction;

    if (newIndex < 0) {
        handleGoalErrorMessage("Cannot move goal up because it is already at the top of the list!");
        return;
    } else if (newIndex >= goals.length){
        handleGoalErrorMessage("Cannot move goal down because it is already at the bottom of the list!");
        return;
    }

    [goals[goalIndex], goals[newIndex]] = [goals[newIndex], goals[goalIndex]];
    clearErrorAndSuccessMessage()
    

    saveGoals(goals)
    console.log(goals)
    loadGoals()
}

export function deleteGoal(goalUUID) {
    const goals = getExistingGoals().filter(goal => goal.goal_uuid !== goalUUID)
    const disabledGoalIds = getDisabledGoalIds().filter((id) => id !== goalUUID);
    console.log("deleting!")
    saveGoals(goals);
    saveDisabledGoalIds(disabledGoalIds);
    loadGoals();
    handleGoalSuccessMessage("Successfully deleted the goal!")
}



// --- Helper Functions ---

function goalCardGroupPopulate(clone, goal){
    populateBasicInfo(clone, goal);
    populatePriority(clone, goal);
    populateBannerInfo(clone, goal);
}

function populateBasicInfo(clone, goal) {
    clone.querySelector(".goal-info-goal-name").textContent = goal.goal_name;
    clone.getElementById("goal-info-item-name").textContent = goal.item_name;
    clone.getElementById("goal-info-item-target-count").textContent = goal.item_target_count;
    clone.getElementById("goal-info-goal-banner").textContent = goal.goal_banner?.banner_name || "Default Banner";

    const isCharacter = goal.item_type === "character";
    const isFiveStar = goal.item_rarity === "five";

    clone.getElementById("goal-info-item-type").textContent = `${isFiveStar ? "5✦" : "4✦"} ${isCharacter ? "Character" : "Weapon"}`;
    clone.getElementById("goal-info-item-target-count-label").textContent = isCharacter ? "Constellation Target" : "Refinement Target";
}

function populatePriority(clone, goal) {
    clone.getElementById("goal-info-high-priority").hidden = !goal.item_high_priority;
    clone.getElementById("goal-info-low-priority").hidden = goal.item_high_priority;
}

function populateBannerInfo(clone, goal) {
    const charSection = clone.querySelector(".goal-character-banner-info");
    const weaponSection = clone.querySelector(".goal-weapon-banner-info");
    const banner = goal.goal_banner;

    if (banner?.item_type === "character") {
        charSection.hidden = false;
        weaponSection.hidden = true;

        clone.getElementById("goal-info-banner-primary-character").textContent = banner.banner_five_item_primary || "None";
        clone.getElementById("goal-info-banner-four-characters").textContent = banner.banner_four_items?.join(", ") || "None";
    } else {
        charSection.hidden = true;
        weaponSection.hidden = false;

        clone.getElementById("goal-info-banner-primary-weapon").textContent = banner?.banner_five_item_primary || "None";
        clone.getElementById("goal-info-banner-secondary-weapon").textContent = banner?.banner_five_item_secondary || "None";
        clone.getElementById("goal-info-banner-four-weapons").textContent = banner?.banner_four_items?.join(", ") || "None";
    }
}

function handleNoGoalsMessage(goals){
    const noGoalsContainer = document.querySelector(".no-goals-container");
    const goalsContainer = document.getElementById("goalsContainer");

    if (goals.length === 0) {
        noGoalsContainer.hidden = false;
        goalsContainer.hidden = true;
    } else {
        noGoalsContainer.hidden = true;
        goalsContainer.hidden = false;
    }
}

function initializeGoalButtons(clone, goal, index){
        const toggleGoalsButton = clone.querySelector(".toggle-goal-button");
        toggleGoalsButton.addEventListener("click", () => toggleGoal(goal.goal_uuid));

        const deleteGoalButton = clone.querySelector(".delete-goal-button");
        deleteGoalButton.addEventListener("click", () => openDeleteGoalConfirmation(goal.goal_uuid))

        const moveUpButton = clone.querySelector(".move-up-button");
        moveUpButton.addEventListener("click", () => moveItem(getExistingGoals(), index, -1))

        const moveDownButton = clone.querySelector(".move-down-button");
        moveDownButton.addEventListener("click", () => moveItem(getExistingGoals(), index, +1))
}

// Disable Goals

function toggleGoal(goalUUID) {
    var disabledGoals = getDisabledGoalIds()
    if (disabledGoals.includes(goalUUID)){
        disabledGoals = disabledGoals.filter(existingDisabledGoals => existingDisabledGoals !== goalUUID)
    } else {
        disabledGoals = [...disabledGoals, goalUUID]
    }
    saveDisabledGoalIds(disabledGoals)
    loadGoals()
}

function displayDisabledGoals(clone, goal){
    const toggleGoalsButton = clone.querySelector(".toggle-goal-button");
    const goalDisplay = clone.querySelector(".goal-display")
    const goalIsDisabled = getDisabledGoalIds().includes(goal.goal_uuid);
    goalDisplay.classList.toggle("goal-disabled", goalIsDisabled);
    toggleGoalsButton.textContent = goalIsDisabled ? "" : "✓";
    toggleGoalsButton.title = goalIsDisabled ? "Enable goal" : "Disable goal";
}