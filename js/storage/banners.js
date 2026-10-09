import {
    handleBannerErrorMessage,
    handleBannerSuccessMessage,
    handleBannerWarningMessage
} from "../banners/bannersMessage.js";
import { getExistingGoals } from "./goals.js";
import { loadBanners } from "../components/bannerCards.js";

// Banner Storage
export function getExistingBanners() {
    return JSON.parse(localStorage.getItem("banners")) || [];
}

export function saveBanners(banners) {
    localStorage.setItem("banners", JSON.stringify(banners));
}

function locateBannerUses(banner) {
    return getExistingGoals().filter(
        goal => goal.goal_banner?.banner_uuid === banner.banner_uuid
    );
}

export function deleteBanner(bannerUUID, banner) {
    const goalsUsingBanner = locateBannerUses(banner);

    if (goalsUsingBanner.length === 0) {
        const banners = getExistingBanners().filter(
            banner => banner.banner_uuid !== bannerUUID
        );

        saveBanners(banners);

        loadBanners();
        handleBannerSuccessMessage("Successfully deleted the banner!");
    } else {
        const goalNames = goalsUsingBanner
            .map(goal => `${goal.goal_name}`)
            .join(", ");

        handleBannerErrorMessage(
            `Cannot delete this banner because it is being used by the following goals: ${goalNames}`
        );
    }
}

export function deleteUnusedBanners() {
    const banners = getExistingBanners();
    const goals = getExistingGoals();

    const usedBannerUUIDs = new Set(
        goals
            .filter(goal => goal.goal_banner?.banner_uuid)
            .map(goal => goal.goal_banner.banner_uuid)
    );

    const remainingBanners = banners.filter(
        banner => usedBannerUUIDs.has(banner.banner_uuid)
    );

    if (!Array.isArray(banners) || banners.length === 0) {
        handleBannerSuccessMessage(
            "Succesfully deleted all banners!"
        );
        return;
    }
    saveBanners(remainingBanners);
    if (remainingBanners.length === banners.length) {
        handleBannerErrorMessage(
            "Could not delete any banner as all of them are used by goals."
        );
    } else if (remainingBanners.length >= 1) {
        handleBannerWarningMessage(
            "Could not delete some banners as they are currently used by goals."
        );
    } else {
        handleBannerSuccessMessage(
            "Succesfully deleted all banners!"
        );
    }
}

export function getBanner(bannerUUID) {
    // 1. Retrieve and parse the array of banners
    const banners = JSON.parse(localStorage.getItem("banners"));

    // 2. Safety check: if no banners exist, return null
    if (!banners || !Array.isArray(banners)) return null;

    // 3. Find and return the goal that matches the requested UUID
    return banners.find(banner => banner.banner_uuid === bannerUUID) || null;
}

export function updateEditedBanner(editedBanner) {
    const banners = getExistingBanners();

    const updatedBanners = banners.map(banner =>
        banner.banner_uuid === editedBanner.banner_uuid
            ? editedBanner
            : banner
    );

    saveBanners(updatedBanners);
}

export function updateBanners(banner) {
    const banners = getExistingBanners()
    banners.push(banner);
    saveBanners(banners);
}