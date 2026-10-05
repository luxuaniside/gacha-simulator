export function handleGoalErrorMessage(error){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = false;
    errorContainer.textContent = error
}

export function handleGoalSuccessMessage(message){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = false;
    errorContainer.hidden = true;
    successContainer.textContent = message
}

export function clearErrorAndSuccessMessage(){
    const errorContainer = document.getElementById("goal-form-error-container");
    const successContainer = document.getElementById("goal-form-success-container");
    successContainer.hidden = true;
    errorContainer.hidden = true;
}