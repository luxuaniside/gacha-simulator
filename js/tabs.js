import { updateGoalItemForm } from "./goals/goalForm.js";
import { updateBannerItemForm } from "./banners/bannerForm.js";

export function initialiazeMainTabNavigation() {
    const tabs = document.querySelectorAll(".subpage-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchMainTabs(tab.id, tab.dataset.target);
            window.scrollTo({ top: 0, behavior: "smooth" });

            tab.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        });
    });

    const helpLinks = document.querySelectorAll(".help-link[data-help-target]");
    helpLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const target = document.getElementById(link.dataset.helpTarget);
            if (target.classList.contains("subpage-tab")) {
                target.click();
                return;
            }

            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.focus({ preventScroll: true });
        });
    });
}

export function initializeSubTabNavigation() {
    const tabs = document.querySelectorAll(".pity-subpage-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchSubTabs(tab.id, tab.dataset.target)
        });
    });
}


function switchMainTabs(navButton, sectionTarget) {
    updateGoalItemForm()
    updateBannerItemForm()

    const sections = document.querySelectorAll(".subpage");
    const tabs = document.querySelectorAll(".subpage-tab");
    const navButtonSelected = document.querySelector(`#${navButton}`)
    const tabSelected = document.querySelector(`#${sectionTarget}`);

    sections.forEach(section => {
        section.classList.remove("is-active")
    });

    tabs.forEach(tab => {
        tab.classList.remove("is-active")

    });

    tabSelected.classList.add("is-active")
    navButtonSelected.classList.add("is-active")


}


function switchSubTabs(navButton, sectionTarget) {
    const sections = document.querySelectorAll(".pity-subpage");
    const tabs = document.querySelectorAll(".pity-subpage-tab");
    const navButtonSelected = document.querySelector(`#${navButton}`)
    const tabSelected = document.querySelector(`#${sectionTarget}`);

    sections.forEach(section => {
        section.classList.remove("is-active")
    });

    tabs.forEach(tab => {
        tab.classList.remove("is-active")
    });

    tabSelected.classList.add("is-active")
    navButtonSelected.classList.add("is-active")
}
