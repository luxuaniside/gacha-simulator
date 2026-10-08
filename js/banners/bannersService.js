import { getExistingBanners, updateBanners, updateEditedBanner } from "../storage/banners.js";
import { apiFetch } from "../api.js";
import { getBannerFormValues } from "./bannerForm.js";
import { handleBannerErrorMessage, handleBannerSuccessMessage } from "./bannersMessage.js";
import { loadBanners } from "../components/bannerCards.js";
import { getEditBannerFormValues } from "./bannerEditor.js";

export async function createBanner({
    bannerValues = getBannerFormValues(),
    onSuccess = result =>
        handleBannerSuccessMessage(`Successfully created banner "${result.banner_name}"!`),
    onError = message => handleBannerErrorMessage(message)
} = {}) {
    const existingBanners = getExistingBanners;
    const request = {
        existing_banners: existingBanners(),
        new_banner: bannerValues,
    };

    const response = await apiFetch("/banners", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (response.status == 200) {
        console.log(result)
        updateBanners(result)
        loadBanners()
        onSuccess(result);

    } else {
        console.log(result)
        onError(result.message)
        return;

    }
};

export async function editBanner() {
    const existingBanners = getExistingBanners()
    const request = {
        existing_banners: existingBanners,
        new_banner: getEditBannerFormValues(),
    };

    const response = await apiFetch("/banners/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (response.status == 200) {
        console.log(result)
        updateEditedBanner(result)
        handleBannerSuccessMessage(`Successfully edited banner "${result.banner_name}"!`)
        loadBanners()

    } else {
        console.log(result)
        handleBannerErrorMessage(result.message)
        return;

    }
};