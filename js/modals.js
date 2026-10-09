import { loadGoals } from "./components/goalCards.js";
import { deleteAllGoals, deleteGoal } from "./storage/goals.js"
import { deleteUnusedBanners, deleteBanner } from "./storage/banners.js";
import { handleGoalSuccessMessage } from "./goals/goalMessage.js";
import { populateEditGoalForm } from "./goals/goalEditor.js";
import { populateEditBannerForm } from "./banners/bannerEditor.js";
import { loadBanners } from "./components/bannerCards.js";

// Goal Deletion
export function openDeleteGoalConfirmation(goalUUID) {
    let goalToDelete = goalUUID;

    const deleteDialog = document.getElementById("delete-goal-dialog");
    const cancelButton = document.getElementById("cancel-delete-goal");
    const confirmButton = document.getElementById("confirm-delete-goal");

    deleteDialog.showModal();

    cancelButton.onclick = () => {
        goalToDelete = null;
        deleteDialog.close();
    };

    confirmButton.onclick = () => {
        if (goalToDelete === null) return;

        const uuid = goalToDelete;
        goalToDelete = null;

        deleteDialog.close();
        deleteGoal(uuid);
    };
}


// All Goals Deletion
export function openDeleteAllGoalsConfirmation() {
    const deleteDialog = document.getElementById("delete-goal-dialog");
    const cancelButton = document.getElementById("cancel-delete-goal");
    const confirmButton = document.getElementById("confirm-delete-goal");

    deleteDialog.showModal();

    cancelButton.onclick = () => {
        deleteDialog.close();
    };

    confirmButton.onclick = () => {
        deleteDialog.close();
        deleteAllGoals();
        handleGoalSuccessMessage("Successfully deleted all goals!");
        loadGoals();
    };
}

// Edit Goals
export function openEditGoalDialog(goal) {
    const editDialog = document.getElementById("edit-goal-dialog")

    populateEditGoalForm(goal);
    editDialog.showModal()

}

// Banner Deletion
export function openDeleteBannerConfirmation(bannerUUID, banner) {
    let bannerToDelete = bannerUUID;

    const deleteDialog = document.getElementById("delete-banner-dialog");
    const cancelButton = document.getElementById("cancel-delete-banner");
    const confirmButton = document.getElementById("confirm-delete-banner");

    deleteDialog.showModal();

    cancelButton.onclick = () => {
        bannerToDelete = null;
        deleteDialog.close();
    };

    confirmButton.onclick = () => {
        if (bannerToDelete === null) return;

        const uuid = bannerToDelete;
        bannerToDelete = null;

        deleteDialog.close();
        deleteBanner(uuid, banner);
    };
}

// All Banners Deletion
export function openDeleteUnusedBannersConfirmation() {
    const deleteDialog = document.getElementById("delete-banner-dialog");
    const cancelButton = document.getElementById("cancel-delete-banner");
    const confirmButton = document.getElementById("confirm-delete-banner");

    deleteDialog.showModal();

    cancelButton.onclick = () => {
        deleteDialog.close();
    };

    confirmButton.onclick = () => {
        deleteDialog.close();
        deleteUnusedBanners();
        loadBanners();
    };
}

// Edit Banners
export function openEditBannerDialog(banner) {
    const editDialog = document.getElementById("edit-banner-dialog")

    populateEditBannerForm(banner)
    editDialog.showModal()
}
