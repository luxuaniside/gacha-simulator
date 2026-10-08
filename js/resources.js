function getWishingResources() {
    const form = document.querySelector("#wishing-resources-form");
    const formData = new FormData(form);

    const resources = {
        intertwined_fates: Number(formData.get("intertwined-fates")),
        primogems: Number(formData.get("primogems")),
        genesis_crystals: Number(formData.get("genesis-crystals")),
        masterless_starglitter: Number(formData.get("masterless-starglitter")),
    };

    return resources;
}

export function initalizeWishingResources(){
    const form = document.querySelector("#wishing-resources-form");
    form.addEventListener("input", event => {
        limitNumberInput(event.target);
        const resources = getWishingResources();
        var totalWishes = calculateWishingResources(resources);
        
        updateWishMessage(totalWishes)
        wishingResourcesErrorValidation(totalWishes)
    });
}

export function initializePityResources(){
    const characterForm = document.querySelector("#character-pity-form")
    const weaponForm = document.querySelector("#weapon-pity-form")
    
    characterForm.addEventListener("input", event => {
        limitNumberInput(event.target);
    });

    weaponForm.addEventListener("input", event => {
        limitNumberInput(event.target);
    });

}

function calculateWishingResources(resources){
    var totalWishes = Math.trunc(resources.primogems/160 + resources.genesis_crystals/160)
    totalWishes += resources.intertwined_fates
    totalWishes += Math.trunc(resources.masterless_starglitter/5)
    console.log(totalWishes)
    return totalWishes;
}

function wishingResourcesErrorValidation(totalWishes){
    const errorMessage = document.getElementById("wishing-resources-error-container");
    if (totalWishes > 3000){
        errorMessage.textContent = "Wishes amount cannot exceed 3,000!"
        errorMessage.hidden = false;
    } else if (totalWishes < 1) {
        errorMessage.textContent = "You must have at least one wish!"
        errorMessage.hidden = false;
    } else {
        errorMessage.hidden = true;
    }
}

function updateWishMessage(totalWishes){
    document.getElementById("wishing-resources-total").innerText = totalWishes
}

export function getPityResources() {
    const characterForm = document.querySelector("#character-pity-form")
    const characterFormData = new FormData(characterForm)
    const weaponForm = document.querySelector("#weapon-pity-form")
    const weaponFormData = new FormData(weaponForm)

    const pityResources = {
        five_character_pity: Number(characterFormData.get("five-character-pity")),
        four_character_pity: Number(characterFormData.get("four-character-pity")),
        capturing_radiance: Number(characterFormData.get("capturing-radiance")),
        five_character_guarantee: characterFormData.has("five-character-guarantee"),
        four_character_guarantee: characterFormData.has("four-character-guarantee"),
        five_weapon_pity: Number(weaponFormData.get("five-weapon-pity")),
        four_weapon_pity: Number(weaponFormData.get("four-weapon-pity")),
        epitomized_path: Number(weaponFormData.get("epitomized-path")),
        five_weapon_guarantee: weaponFormData.has("five-weapon-guarantee"),
        four_weapon_guarantee: weaponFormData.has("four-weapon-guarantee"),
    }
    
    return pityResources;
}

function limitNumberInput(target) {
    if (!(target instanceof HTMLInputElement) || target.type !== "number" || target.value === "") {
        return;
    }

    const min = target.min === "" ? 0 : Number(target.min);
    const max = target.max === "" ? Infinity : Number(target.max);
    const value = Number(target.value);

    if (Number.isFinite(value)) {
        target.value = String(Math.min(Math.max(value, min), max));
    }
}
