import { apiFetch } from "../api.js";
import { getPityResources, getWishingResources } from "../resources.js";
import { getExistingBanners } from "../storage/banners.js";
import {
    getDisabledGoalIds,
    getExistingGoals
} from "../storage/goals.js";
import { getExistingCharacters } from "../storage/characters.js";

export function createSimulationRequest() {
    const simulationForm = document.getElementById("simulation-form");
    if (!simulationForm) {
        throw new Error("Simulation settings are unavailable.");
    }

    const formData = new FormData(simulationForm);
    const disabledGoalIds = new Set(getDisabledGoalIds());
    const goals = getExistingGoals().filter(
        goal => !disabledGoalIds.has(goal.goal_uuid)
    );
    const banners = getExistingBanners();

    if (goals.length === 0) {
        throw new Error("Add or enable at least one goal before running a simulation.");
    }
    if (banners.length === 0) {
        throw new Error("Add at least one banner before running a simulation.");
    }

    const iterationCount = Number(formData.get("iteration-count"));
    if (!Number.isInteger(iterationCount) || iterationCount < 1 || iterationCount > 50000) {
        throw new Error("Iteration count must be between 1 and 50,000.");
    }

    return {
        resources: getWishingResources(),
        pity: getPityResources(),
        goals,
        banners,
        simulation_settings: {
            iteration_count: iterationCount,
            starglitter_refund: formData.has("reuse-starglitter"),
            continue_after_goals_are_finished: formData.has("continue-after-goals")
        },
        characters: getExistingCharacters()
    };
}

function readApiError(result) {
    const details = Array.isArray(result.details)
        ? ` ${result.details.map(detail => detail.msg).join(" ")}`
        : "";
    return `${result.message || "Simulation request failed."}${details}`;
}

export async function runSimulation(request, onProgress = () => {}) {
    const response = await apiFetch("/simulation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(readApiError(result));
    }

    if (!result.job_id) {
        throw new Error("The server did not return a simulation job ID.");
    }

    onProgress(result);
    let status = result;
    while (status.status === "queued" || status.status === "running") {
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusResponse = await apiFetch(
            `/simulation/${encodeURIComponent(result.job_id)}`
        );
        status = await statusResponse.json();
        if (!statusResponse.ok) {
            throw new Error(readApiError(status));
        }
        onProgress(status);
    }

    if (status.status === "failed") {
        throw new Error(status.error || "The simulation failed.");
    }
    if (status.status !== "completed" || !status.result) {
        throw new Error("The server returned an unknown simulation status.");
    }

    return status.result;
}