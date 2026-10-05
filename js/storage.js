// Goal Storage
export function getExistingGoals() {
    return JSON.parse(localStorage.getItem("goals")) || [];
}

export function saveGoals(goals) {
    localStorage.setItem("goals", JSON.stringify(goals));
}

export function deleteAllGoals(){
    localStorage.clear("goals");
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
export function updateGoals(goal){
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