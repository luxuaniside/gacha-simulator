import { initialiazeMainTabNavigation, initializeSubTabNavigation } from "./tabs.js";
initialiazeMainTabNavigation();
initializeSubTabNavigation();

import { initalizeWishingResources, initializePityResources } from "./resources.js";
initalizeWishingResources();
initializePityResources();

import { initializeGoalsPage } from "./goals/goalPage.js";
import { initializeBannersPage } from "./banners/bannerPage.js";
import { initializeCharactersPage } from "./characters/charactersPage.js";
initializeGoalsPage()
initializeBannersPage()
initializeCharactersPage()