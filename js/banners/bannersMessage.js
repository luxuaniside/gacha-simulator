export function handleBannerErrorMessage(error) {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    const warningContainer = document.getElementById("banner-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = false;
    warningContainer.hidden = true;
    errorContainer.textContent = error
}

export function handleBannerSuccessMessage(message) {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    const warningContainer = document.getElementById("banner-form-warning-container");
    successContainer.hidden = false;
    errorContainer.hidden = true;
    warningContainer.hidden = true;
    successContainer.textContent = message
}

export function handleBannerWarningMessage(message) {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    const warningContainer = document.getElementById("banner-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
    warningContainer.hidden = false;
    warningContainer.textContent = message
}

export function clearErrorAndSuccessMessage() {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    const warningContainer = document.getElementById("banner-form-warning-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
    warningContainer.hidden = true;
}
