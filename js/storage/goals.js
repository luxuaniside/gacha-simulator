import { loadGoals } from "../components/goalCards.js";
import { handleGoalSuccessMessage } from "../goals/goalMessage.js";

// Goal Storage
export function getExistingGoals() {
    return JSON.parse(localStorage.getItem("goals")) || [];
}

export function saveGoals(goals) {
    localStorage.setItem("goals", JSON.stringify(goals));
}

export function deleteGoal(goalUUID) {
    const goals = getExistingGoals().filter(goal => goal.goal_uuid !== goalUUID)
    const disabledGoalIds = getDisabledGoalIds().filter((id) => id !== goalUUID);
    saveGoals(goals);
    saveDisabledGoalIds(disabledGoalIds);
    loadGoals();
    handleGoalSuccessMessage("Successfully deleted the goal!")
}

export function deleteAllGoals() {
    localStorage.removeItem("goals");
}

export function getGoal(goalUUID) {
    // 1. Retrieve and parse the array of goals
    const goals = JSON.parse(localStorage.getItem("goals"));

    // 2. Safety check: if no goals exist, return null
    if (!goals || !Array.isArray(goals)) return null;

    // 3. Find and return the goal that matches the requested UUID
    return goals.find(goal => goal.goal_uuid === goalUUID) || null;
}

export function updateEditedGoal(editedGoal) {
    const goals = getExistingGoals();

    const updatedGoals = goals.map(goal =>
        goal.goal_uuid === editedGoal.goal_uuid
            ? editedGoal
            : goal
    );

    saveGoals(updatedGoals);
}
export function updateGoals(goal) {
    const goals = getExistingGoals()
    goals.push(goal);
    saveGoals(goals);
}

// Disabled Goals Storage 

export function getDisabledGoalIds() {
    return JSON.parse(localStorage.getItem("disabledGoalIds")) || [];
}

export function saveDisabledGoalIds(goalIds) {
    localStorage.setItem("disabledGoalIds", JSON.stringify(goalIds));
}