import { apiFetch } from "./api.js";

const RETRY_DELAY_MS = 5000;
const apiButtons = new Set();
let apiConnected = false;
let clickGuardInitialized = false;

function waitForRetry() {
    return new Promise(resolve => {
        window.setTimeout(resolve, RETRY_DELAY_MS);
    });
}

function showApiLoadingTooltip(button) {
    button.classList.add("api-loading-tooltip-visible");
    window.setTimeout(() => {
        button.classList.remove("api-loading-tooltip-visible");
    }, 2200);
}

export function registerApiDependentButton(button) {
    button.classList.add("api-required");
    button.disabled = false;
    button.setAttribute("aria-disabled", String(!apiConnected));

    if (!apiConnected) {
        button.dataset.apiTooltip = "Loading API… Please try again shortly.";
    } else {
        delete button.dataset.apiTooltip;
    }

    apiButtons.add(button);
}

export async function initializeApiConnection() {
    document.querySelectorAll(".api-required").forEach(registerApiDependentButton);

    if (!clickGuardInitialized) {
        document.addEventListener("click", event => {
            if (apiConnected || !(event.target instanceof Element)) {
                return;
            }

            const button = event.target.closest(
                ".api-required[aria-disabled='true']"
            );
            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            showApiLoadingTooltip(button);
        }, true);
        clickGuardInitialized = true;
    }

    while (true) {
        try {
            const response = await apiFetch("/");
            if (!response.ok) {
                throw new Error(`API health check returned HTTP ${response.status}.`);
            }

            apiConnected = true;
            apiButtons.forEach(button => {
                button.setAttribute("aria-disabled", "false");
                delete button.dataset.apiTooltip;
            });
            return;
        } catch {
            apiButtons.forEach(button => {
                button.setAttribute("aria-disabled", "true");
                button.dataset.apiTooltip = "Loading API… Please try again shortly.";
            });
        }

        await waitForRetry();
    }
}
