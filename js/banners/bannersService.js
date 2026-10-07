import { getExistingBanners, updateBanners } from "../storage.js";
import { apiFetch } from "../api.js";
import { getBannerFormValues } from "./bannerForm.js";
import { handleBannerErrorMessage, handleBannerSuccessMessage } from "./bannersMessage.js";
import { loadBanners } from "../components/bannerCards.js";

export async function createBanner() {
    const existingBanners = getExistingBanners
    const request = {
        existing_banners: existingBanners(),
        new_banner: getBannerFormValues(),
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
        handleBannerSuccessMessage(`Successfully created banner "${result.banner_name}"!`)
        loadBanners()

    } else {
        console.log(result)
        handleBannerErrorMessage(result.message)
        return;

    }
};