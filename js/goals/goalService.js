import { apiFetch } from "../api.js";

import { getExistingGoals, updateEditedGoal, updateGoals } from "../storage/goals.js";

import { getGoalFormValues } from "./goalForm.js";
import { handleGoalSuccessMessage, handleGoalErrorMessage } from "./goalMessage.js";
import { loadGoals } from "../components/goalCards.js";
import { getEditGoalFormValues } from "./goalEditor.js";

export async function createGoal() {
    const existingGoals = getExistingGoals()
    const request = {
        existing_goals: existingGoals,
        new_goal: getGoalFormValues(),
    };

    console.log(request.new_goal)
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
        if (result.code == "goal_banner_missing") {
            handleGoalErrorMessage("No banner selected. Create one with the item in the Banners tab or use the Create Banner button.")
        }
        else {
            handleGoalErrorMessage(result.message)
        }
        console.log(result)
        return;

    }
};

export async function editGoal() {
    const existingGoals = getExistingGoals()
    const request = {
        existing_goals: existingGoals,
        new_goal: getEditGoalFormValues(),
    };

    const response = await apiFetch("/goals/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (response.status == 200) {
        console.log(result)
        updateEditedGoal(result)
        handleGoalSuccessMessage(`Successfully edited goal "${result.goal_name}"!`)
        loadGoals()

    } else {
        console.log(result)
        if (result.code == "goal_banner_missing") {
            handleGoalErrorMessage(
                "No banner selected. Create one with the item in the Banners tab or use the Create Banner button."
            );
        } else {
            handleGoalErrorMessage(result.message);
        }
        return;

    }
};
