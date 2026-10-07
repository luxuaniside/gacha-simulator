// Goal Storage
export function getExistingGoals() {
    return JSON.parse(localStorage.getItem("goals")) || [];
}

export function saveGoals(goals) {
    localStorage.setItem("goals", JSON.stringify(goals));
}

export function deleteAllGoals() {
    localStorage.clear("goals");
}

export function updateEditedGoal(editedGoal) {
    const goals = getExistingGoals();

    const updatedGoals = goals.map(goal =>
        goal.goal_uuid === editedGoal.goal_uuid
            ? editedGoal
            : goal
    );

    saveGoals(updatedGoals);
}
export function updateGoals(goal) {
    const goals = getExistingGoals()
    goals.push(goal);
    saveGoals(goals);
}

// Disabled Goals Storage 

export function getDisabledGoalIds() {
    return JSON.parse(localStorage.getItem("disabledGoalIds")) || [];
}

export function saveDisabledGoalIds(goalIds) {
    localStorage.setItem("disabledGoalIds", JSON.stringify(goalIds));
}

// Banner Storage
export function getExistingBanners() {
    return JSON.parse(localStorage.getItem("banners")) || [];
}

export function saveBanners(banners) {
    localStorage.setItem("banners", JSON.stringify(banners));
}

export function deleteAllBanners() {
    localStorage.clear("banners");
}

export function updateEditedBanner(editedBanner) {
    const banners = getExistingBanners();

    const updatedBanners = banners.map(banner =>
        banner.banner_uuid === editedBanner.banner_uuid
            ? editedBanner
            : banner
    );

    saveBanners(updatedBanners);
}
export function updateBanners(banner) {
    const banners = getExistingBanners()
    banners.push(banner);
    saveBanners(banners);
}