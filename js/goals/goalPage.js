import { loadGoals } from "../components/goalCards.js";
import { initializeGoalForm } from "./goalForm.js";
import { initializeGoalEditor } from "./goalEditor.js";
import { createGoal } from "./goalService.js";
import { openDeleteAllGoalsConfirmation } from "../modals.js";

export function initializeGoalsPage() {
    loadGoals();
    initializeGoalForm();
    initializeGoalEditor();

    const createGoalButton = document.getElementById("create-goal");
    const deleteAllGoalsButton = document.getElementById("delete-all-goals");

    createGoalButton.addEventListener("click", createGoal);

    deleteAllGoalsButton.addEventListener(
        "click",
        openDeleteAllGoalsConfirmation
    );
}
