import {
    createSimulationRequest,
    runSimulation
} from "./simulationService.js";
import { saveAndRenderSimulationResults } from "./simulationResultsPage.js";

export function initializeSimulationPage() {
    const runButton = document.querySelector("#simulation-form .run-simulation");
    const successContainer = document.getElementById("simulation-success-container");
    const errorContainer = document.getElementById("simulation-error-container");
    const progressContainer = document.getElementById("simulation-progress-container");
    const progressBar = document.getElementById("simulation-progress");
    const progressMessage = document.getElementById("simulation-progress-message");
    const progressPercentage = document.getElementById("simulation-progress-percentage");

    if (
        !runButton ||
        !successContainer ||
        !errorContainer ||
        !progressContainer ||
        !progressBar ||
        !progressMessage ||
        !progressPercentage
    ) {
        return;
    }

    runButton.addEventListener("click", async () => {
        successContainer.hidden = true;
        errorContainer.hidden = true;
        progressContainer.hidden = false;
        progressBar.value = 0;
        progressMessage.textContent = "Preparing simulation...";
        progressPercentage.textContent = "0%";
        const resultsProgress = document.getElementById("simulation-results-rerun-progress");
        const resultsProgressMessage = document.getElementById("simulation-results-rerun-progress-message");
        const resultsProgressPercentage = document.getElementById("simulation-results-rerun-progress-percentage");
        const resultsProgressBar = document.getElementById("simulation-results-rerun-progress-bar");
        const rerunButton = document.querySelector(".simulation-results-rerun");
        rerunButton?.setAttribute("disabled", "");
        runButton.disabled = true;
        runButton.textContent = "Running Simulation...";

        try {
            const request = createSimulationRequest();
            const result = await runSimulation(request, status => {
                const total = Number(status.total_iterations);
                const completed = Number(status.completed_iterations);
                progressBar.value = total > 0 ? completed / total * 100 : 0;
                progressPercentage.textContent = `${Math.floor(progressBar.value)}%`;
                if (resultsProgress && resultsProgressMessage && resultsProgressPercentage && resultsProgressBar) {
                    resultsProgress.hidden = false;
                    resultsProgressBar.value = progressBar.value;
                    resultsProgressPercentage.textContent = `${Math.floor(progressBar.value)}%`;
                    resultsProgressMessage.textContent = status.status === "queued"
                        ? "Rerun queued..."
                        : `Rerunning ${completed.toLocaleString()} / ${total.toLocaleString()} iterations`;
                }
                progressMessage.textContent = status.status === "queued"
                    ? "Simulation queued..."
                    : `Running ${completed.toLocaleString()} / ${total.toLocaleString()} iterations (${Math.floor(progressBar.value)}%)`;
            });

            saveAndRenderSimulationResults(
                result,
                request.simulation_settings.iteration_count,
                request.goals,
                request.simulation_settings.starglitter_refund
            );
            progressBar.value = 100;
            progressPercentage.textContent = "100%";
            progressMessage.textContent = "Simulation complete.";
            successContainer.textContent = "Simulation complete. Results are ready.";
            successContainer.hidden = false;
            document.getElementById("simulation-results-tab")?.click();
        } catch (error) {
            progressContainer.hidden = true;
            if (resultsProgress && resultsProgressMessage) {
                resultsProgress.hidden = false;
                resultsProgressMessage.textContent = `Rerun failed: ${error.message}`;
            }
            errorContainer.textContent = error.message;
            errorContainer.hidden = false;
        } finally {
            runButton.disabled = false;
            runButton.textContent = "Run Simulation";
            document.querySelector(".simulation-results-rerun")?.removeAttribute("disabled");
        }
    });
}