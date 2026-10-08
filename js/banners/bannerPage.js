import { loadBanners } from "../components/bannerCards.js";
import { openDeleteUnusedBannersConfirmation } from "../modals.js";
import { initializeBannerEditor } from "./bannerEditor.js";
import { initializeBannerForm } from "./bannerForm.js";
import { createBanner } from "./bannersService.js";

export function initializeBannersPage() {
    loadBanners();
    initializeBannerForm();
    initializeBannerEditor();

    const createBannerButton = document.getElementById("create-banner");
    const deleteUnusedBannersButton = document.getElementById("delete-all-banners");
    createBannerButton.addEventListener("click", createBanner);
    deleteUnusedBannersButton.addEventListener(
        "click",
        openDeleteUnusedBannersConfirmation
    );
}
