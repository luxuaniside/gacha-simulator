import { deleteGoal, loadGoals } from "./components/goalCards.js";
import { deleteAllGoals } from "./storage.js";
import { handleGoalSuccessMessage } from "./goals/goalMessage.js";

// Goal Deletion
export function openDeleteGoalConfirmation(goalUUID) {
    var goalToDelete = goalUUID;
    const deleteDialog = document.getElementById("delete-goal-dialog")
    const cancelButton = document.getElementById("cancel-delete-goal")
    const confirmButton = document.getElementById("confirm-delete-goal")
    deleteDialog.showModal();

    cancelButton.addEventListener("click", () => {
    goalToDelete = null;
    deleteDialog.close();
});

confirmButton.addEventListener("click", () => {
    if (goalToDelete === null) return;

    const goalUUID = goalToDelete;
    goalToDelete = null;
    deleteDialog.close();
    deleteGoal(goalUUID);
});
};

// All Goals Deletion
export function openDeleteAllGoalsConfirmation() {
    const deleteDialog = document.getElementById("delete-goal-dialog")
    const cancelButton = document.getElementById("cancel-delete-goal")
    const confirmButton = document.getElementById("confirm-delete-goal")
    deleteDialog.showModal();

    cancelButton.addEventListener("click", () => {
    deleteDialog.close();
});

confirmButton.addEventListener("click", () => {
    deleteDialog.close();
    deleteAllGoals();
    handleGoalSuccessMessage("Successfully deleted all goals!")
    loadGoals()
    
});
};