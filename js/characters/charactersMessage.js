export function handleCharacterErrorMessage(error) {
    const errorContainer = document.getElementById("characters-form-error-container");
    const successContainer = document.getElementById("characters-form-success-container");
    const warningContainer = document.getElementById("characters-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = false;
    warningContainer.hidden = true;
    errorContainer.textContent = error
}

export function handleCharacterSuccessMessage(message) {
    const errorContainer = document.getElementById("characters-form-error-container");
    const successContainer = document.getElementById("characters-form-success-container");
    const warningContainer = document.getElementById("characters-form-warning-container");
    successContainer.hidden = false;
    errorContainer.hidden = true;
    warningContainer.hidden = true;
    successContainer.textContent = message
}

export function handleCharacterWarningMessage(message) {
    const errorContainer = document.getElementById("characters-form-error-container");
    const successContainer = document.getElementById("characters-form-success-container");
    const warningContainer = document.getElementById("characters-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
    warningContainer.hidden = false;
    warningContainer.textContent = message
}

export function clearErrorAndSuccessMessage() {
    const errorContainer = document.getElementById("characters-form-error-container");
    const successContainer = document.getElementById("characters-form-success-container");
    const warningContainer = document.getElementById("characters-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
    warningContainer.hidden = true;
}
