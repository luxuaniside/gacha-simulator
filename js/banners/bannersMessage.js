export function handleBannerErrorMessage(error) {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = false;
    errorContainer.textContent = error
}

export function handleBannerSuccessMessage(message) {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    successContainer.hidden = false;
    errorContainer.hidden = true;
    successContainer.textContent = message
}

export function clearErrorAndSuccessMessage() {
    const errorContainer = document.getElementById("banner-form-error-container");
    const successContainer = document.getElementById("banner-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
}