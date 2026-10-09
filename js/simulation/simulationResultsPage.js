import { registerApiDependentButton } from "../apiConnection.js";

const RESULTS_STORAGE_KEY = "latestSimulationResults";

function createMetric(label, value, emphasis = "secondary") {
    const metric = document.createElement("div");
    metric.className = `simulation-result-metric simulation-result-metric-${emphasis}`;

    const metricLabel = document.createElement("span");
    metricLabel.className = "simulation-result-metric-label";
    metricLabel.textContent = label;

    const metricValue = document.createElement("strong");
    metricValue.className = "simulation-result-metric-value";
    metricValue.textContent = value;

    metric.append(metricLabel, metricValue);
    return metric;
}

function formatNumber(value, fractionDigits = 2) {
    const number = Number(value);
    return Number.isFinite(number)
        ? number.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        })
        : "Unavailable";
}

function getGoalWishAverages(wishesSpentByIteration) {
    const totals = new Map();
    const counts = new Map();

    if (!Array.isArray(wishesSpentByIteration)) {
        return new Map();
    }

    for (const iteration of wishesSpentByIteration) {
        if (!iteration || typeof iteration !== "object" || Array.isArray(iteration)) {
            continue;
        }

        for (const [goalName, wishes] of Object.entries(iteration)) {
            if (!Number.isFinite(wishes)) {
                continue;
            }
            totals.set(goalName, (totals.get(goalName) ?? 0) + wishes);
            counts.set(goalName, (counts.get(goalName) ?? 0) + 1);
        }
    }

    return new Map(
        [...totals].map(([goalName, total]) => [
            goalName,
            total / counts.get(goalName)
        ])
    );
}

function appendGoalResults(container, result, iterationCount, goals) {
    if (!result.finished_goals || typeof result.finished_goals !== "object") {
        throw new Error("The simulation response is missing goal completion results.");
    }

    const wishAverages = getGoalWishAverages(result.total_wishes_spent_in_goal);
    const goalPriorityByName = new Map(
        (Array.isArray(goals) ? goals : []).map(goal => [
            goal.goal_name,
            goal.item_high_priority !== false
        ])
    );
    const resultsByPriority = [
        {
            key: "high",
            title: "High Priority Goals",
            description: ""
        },
        {
            key: "low",
            title: "Low Priority Goals",
            description: "These goals are not actively targeted. They track copies gained while wishing for higher-priority goals."
        }
    ];

    for (const priority of resultsByPriority) {
        const entries = Object.entries(result.finished_goals).filter(
            ([goalName]) =>
                (goalPriorityByName.get(goalName) ?? true) === (priority.key === "high")
        );
        if (entries.length === 0) {
            continue;
        }

        const section = document.createElement("section");
        section.className = `simulation-results-goal-section simulation-results-goal-section-${priority.key}`;

        const heading = document.createElement("h3");
        heading.className = "simulation-results-goals-heading";
        heading.textContent = priority.title;
        section.appendChild(heading);

        if (priority.description) {
            const description = document.createElement("p");
            description.className = "simulation-results-goal-description";
            description.textContent = priority.description;
            section.appendChild(description);
        }

        const tableWrap = document.createElement("div");
        tableWrap.className = "simulation-results-table-wrap";
        const table = document.createElement("table");
        table.className = "simulation-results-table";

        const tableHead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        for (const label of ["Goal", "Completed", "Chance to get goal", "Avg. wishes spent"]) {
            const header = document.createElement("th");
            header.scope = "col";
            header.textContent = label;
            headerRow.appendChild(header);
        }
        tableHead.appendChild(headerRow);

        const tableBody = document.createElement("tbody");
        for (const [goalName, completionCount] of entries) {
            const row = document.createElement("tr");
            const nameCell = document.createElement("th");
            nameCell.scope = "row";
            nameCell.textContent = goalName;
            nameCell.dataset.label = "Goal";

            const completedCell = document.createElement("td");
            completedCell.textContent = `${formatNumber(completionCount, 0)} / ${formatNumber(iterationCount, 0)}`;
            completedCell.dataset.label = "Completed";

            const rateCell = document.createElement("td");
            const completionRate = iterationCount > 0
                ? Number(completionCount) / iterationCount * 100
                : NaN;
            rateCell.textContent = Number.isFinite(completionRate)
                ? `${formatNumber(completionRate)}%`
                : "Unavailable";
            rateCell.dataset.label = "Chance to get goal";

            const wishesCell = document.createElement("td");
            const averageWishes = wishAverages.get(goalName);
            wishesCell.textContent = priority.key === "low"
                ? "None"
                : averageWishes === undefined
                    ? "Unavailable"
                    : formatNumber(averageWishes);
            wishesCell.dataset.label = "Avg. wishes spent";

            row.append(nameCell, completedCell, rateCell, wishesCell);
            tableBody.appendChild(row);
        }

        table.append(tableHead, tableBody);
        tableWrap.appendChild(table);
        section.appendChild(tableWrap);
        container.appendChild(section);
    }

    const footnote = document.createElement("p");
    footnote.className = "simulation-results-footnote";
    footnote.textContent =
        "Average wishes spent is shown for high-priority goals when recorded by the simulation.";
    container.appendChild(footnote);
}

export function renderSimulationResults(
    result,
    iterationCount,
    goals = [],
    starglitterRefundEnabled = false
) {
    const content = document.getElementById("simulation-results-content");
    const emptyMessage = document.getElementById("simulation-results-empty");
    if (!content || !emptyMessage) {
        throw new Error("Simulation results page is unavailable.");
    }

    if (!result || typeof result !== "object") {
        throw new Error("The simulation response did not contain result data.");
    }

    content.replaceChildren();
    const resultsToolbar = document.createElement("div");
    resultsToolbar.className = "simulation-results-toolbar";

    const summary = document.createElement("p");
    summary.className = "simulation-results-summary";
    summary.textContent = `${formatNumber(iterationCount, 0)} iterations`;

    const rerunButton = document.createElement("button");
    rerunButton.className = "simulation-results-rerun api-required";
    rerunButton.type = "button";
    rerunButton.textContent = "Rerun Simulation";
    rerunButton.setAttribute("aria-label", "Rerun simulation with current settings");
    registerApiDependentButton(rerunButton);
    rerunButton.addEventListener("click", () => {
        document.querySelector("#simulation-form .run-simulation")?.click();
    });

    const rerunProgress = document.createElement("div");
    rerunProgress.className = "simulation-results-rerun-progress";
    rerunProgress.id = "simulation-results-rerun-progress";
    rerunProgress.hidden = true;

    const rerunProgressMessage = document.createElement("span");
    rerunProgressMessage.id = "simulation-results-rerun-progress-message";
    rerunProgressMessage.setAttribute("role", "status");
    rerunProgressMessage.setAttribute("aria-live", "polite");

    const rerunProgressPercentage = document.createElement("span");
    rerunProgressPercentage.id = "simulation-results-rerun-progress-percentage";

    const rerunProgressHeading = document.createElement("div");
    rerunProgressHeading.className = "simulation-results-rerun-progress-heading";
    rerunProgressHeading.append(rerunProgressMessage, rerunProgressPercentage);

    const rerunProgressBar = document.createElement("progress");
    rerunProgressBar.id = "simulation-results-rerun-progress-bar";
    rerunProgressBar.max = 100;
    rerunProgressBar.value = 0;
    rerunProgressBar.setAttribute("aria-label", "Rerun simulation progress");

    rerunProgress.append(rerunProgressHeading, rerunProgressBar);
    resultsToolbar.append(summary, rerunButton, rerunProgress);
    content.appendChild(resultsToolbar);

    const statisticsWindow = document.createElement("details");
    statisticsWindow.className = "simulation-results-statistics";
    statisticsWindow.open = true;

    const statisticsSummary = document.createElement("summary");
    statisticsSummary.textContent = "Main Statistics";
    statisticsWindow.appendChild(statisticsSummary);

    const primaryMetrics = document.createElement("div");
    primaryMetrics.className = "simulation-results-primary-metrics";
    primaryMetrics.setAttribute("aria-label", "Main simulation statistics");
    primaryMetrics.append(
        createMetric("Average wishes used", formatNumber(result.average_wishes_used), "primary"),
        createMetric("Starting wishes", formatNumber(result.starting_wishes, 0), "primary"),
        createMetric(
            "Average Starglitter refund",
            !starglitterRefundEnabled
                ? "None"
                : !Number.isFinite(Number(result.average_masterless_starglitter_refund)) ||
                    Number(result.average_masterless_starglitter_refund) < 1
                    ? "Error"
                    : `${formatNumber(Number(result.average_masterless_starglitter_refund) * 100)}%`,
            "primary"
        )
    );
    statisticsWindow.appendChild(primaryMetrics);

    const secondaryStats = document.createElement("section");
    secondaryStats.className = "simulation-results-secondary";
    const secondaryDisclosure = document.createElement("details");
    secondaryDisclosure.className = "simulation-results-secondary-disclosure";
    const secondaryHeading = document.createElement("span");
    secondaryHeading.className = "simulation-results-secondary-heading";
    secondaryHeading.textContent = "Other Statistics";
    const secondarySummary = document.createElement("summary");
    secondarySummary.appendChild(secondaryHeading);
    secondaryDisclosure.appendChild(secondarySummary);

    const secondaryMetrics = document.createElement("div");
    secondaryMetrics.className = "simulation-results-secondary-metrics";
    secondaryMetrics.setAttribute("aria-label", "Additional simulation statistics");
    secondaryMetrics.append(
        createMetric("Starglitter earned", formatNumber(result.average_masterless_starglitter_earned)),
        createMetric("Masterless Fortuna earned", formatNumber(result.average_masterless_fortuna_earned)),
        createMetric("Stardust earned", formatNumber(result.average_masterless_stardust_earned)),
        createMetric("Simulation time", `${formatNumber(result.simulation_time)} seconds`)
    );
    secondaryDisclosure.appendChild(secondaryMetrics);
    secondaryStats.appendChild(secondaryDisclosure);
    statisticsWindow.appendChild(secondaryStats);
    content.appendChild(statisticsWindow);
    appendGoalResults(content, result, Number(iterationCount), goals);

    emptyMessage.hidden = true;
    content.hidden = false;
}

export function initializeSimulationResultsPage() {
    const resultsTab = document.getElementById("simulation-results-tab");
    resultsTab?.addEventListener("click", () => {
        const storedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
        if (!storedResults) {
            return;
        }

        try {
            const {
                result,
                iterationCount,
                goals,
                starglitterRefundEnabled
            } = JSON.parse(storedResults);
            renderSimulationResults(
                result,
                iterationCount,
                goals,
                starglitterRefundEnabled
            );
        } catch (error) {
            const emptyMessage = document.getElementById("simulation-results-empty");
            if (emptyMessage) {
                emptyMessage.textContent = `Could not load saved simulation results: ${error.message}`;
                emptyMessage.hidden = false;
            }
        }
    });
}

export function saveAndRenderSimulationResults(
    result,
    iterationCount,
    goals,
    starglitterRefundEnabled
) {
    renderSimulationResults(
        result,
        iterationCount,
        goals,
        starglitterRefundEnabled
    );
    localStorage.setItem(
        RESULTS_STORAGE_KEY,
        JSON.stringify({
            result,
            iterationCount,
            goals,
            starglitterRefundEnabled
        })
    );
}
