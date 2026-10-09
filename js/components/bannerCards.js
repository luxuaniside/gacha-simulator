import { getExistingGoals } from "../storage/goals.js";
import { getExistingBanners } from "../storage/banners.js"
import { openEditBannerDialog, openDeleteBannerConfirmation } from "../modals.js";


export function loadBanners() {
    const template = document.getElementById("banner-template");
    const bannersList = document.querySelector(".banners-list");
    const banners = getExistingBanners()



    bannersList.innerHTML = "";

    banners.forEach((banner, index) => {
        const clone = template.content.cloneNode(true);
        initializeBannerButtons(clone, banner)
        populateBasicInfo(clone, banner);
        bannersList.appendChild(clone);
    });

    handleNoBannersMessage(banners)
    fitBannerNames();
}

window.addEventListener("resize", fitBannerNames);

function fitBannerNames() {
    document.querySelectorAll(".banner-info-banner-name").forEach(name => {
        const availableWidth = name.parentElement.clientWidth -
            name.parentElement.querySelector(".banner-info-open-hint").clientWidth -
            10;
        const font = getComputedStyle(name);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context || availableWidth <= 0) {
            return;
        }

        let fontSize = 18;
        context.font = `${font.fontWeight} ${fontSize}px ${font.fontFamily}`;
        while (
            fontSize > 12 &&
            context.measureText(name.textContent).width > availableWidth
        ) {
            fontSize -= 0.5;
            context.font = `${font.fontWeight} ${fontSize}px ${font.fontFamily}`;
        }

        name.style.fontSize = `${fontSize}px`;
    });
}

function populateBasicInfo(clone, banner) {
    clone.querySelector(".banner-info-banner-name").textContent =
        banner.banner_name || "Unnamed Banner";

    const isCharacterBanner = banner.item_type === "character";

    const characterSection = clone.querySelector(".banner-character-banner-info");
    const weaponSection = clone.querySelector(".banner-weapon-banner-info");

    characterSection.hidden = !isCharacterBanner;
    weaponSection.hidden = isCharacterBanner;

    if (isCharacterBanner) {
        clone.querySelector(".banner-info-primary-character").textContent =
            banner.banner_five_item_primary || "None";
        clone.querySelector(".banner-info-four-characters").textContent =
            banner.banner_four_items?.join(", ") || "None";
    } else {
        clone.querySelector(".banner-info-primary-weapon").textContent =
            banner.banner_five_item_primary || "None";
        clone.querySelector(".banner-info-secondary-weapon").textContent =
            banner.banner_five_item_secondary || "None";
        clone.querySelector(".banner-info-four-weapons").textContent =
            banner.banner_four_items?.join(", ") || "None";
    }
}

function handleNoBannersMessage(banners) {
    const noBannersContainer = document.querySelector(".no-banners-container");
    const bannersContainer = document.getElementById("bannersContainer");

    if (banners.length === 0) {
        noBannersContainer.hidden = false;
        bannersContainer.hidden = true;
    } else {
        noBannersContainer.hidden = true;
        bannersContainer.hidden = false;
    }
}

function initializeBannerButtons(clone, banner) {
    const deleteBannerButton = clone.querySelector(".delete-banner-button");
    deleteBannerButton.addEventListener("click", () => openDeleteBannerConfirmation(banner.banner_uuid, banner));

    const editGoalButton = clone.querySelector(".edit-banner-button");
    editGoalButton.addEventListener("click", () => openEditBannerDialog(banner))
}
