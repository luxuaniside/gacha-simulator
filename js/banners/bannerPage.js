import { loadBanners } from "../components/bannerCards.js";
import { initializeBannerForm } from "./bannerForm.js";
import { createBanner } from "./bannersService.js";

export function initializeBannersPage() {
    loadBanners
    initializeBannerForm();
    //initializeBannerEditor();

    const createBannerButton = document.getElementById("create-banner");
    const deleteAllBannersButton = document.getElementById("delete-all-goals");
    createBannerButton.addEventListener("click", createBanner);
}

