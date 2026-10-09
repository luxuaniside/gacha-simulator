import { initialiazeMainTabNavigation, initializeSubTabNavigation } from "./tabs.js";
import { initializeApiConnection } from "./apiConnection.js";
import { initializeHelpTooltips } from "./helpTooltips.js";
initializeApiConnection();
initializeHelpTooltips();
initialiazeMainTabNavigation();
initializeSubTabNavigation();

import { initalizeWishingResources, initializePityResources } from "./resources.js";
initalizeWishingResources();
initializePityResources();

import { initializeGoalsPage } from "./goals/goalPage.js";
import { initializeBannersPage } from "./banners/bannerPage.js";
import { initializeCharactersPage } from "./characters/charactersPage.js";
import { initializeSimulationPage } from "./simulation/simulationPage.js";
import { initializeSimulationResultsPage } from "./simulation/simulationResultsPage.js";
initializeGoalsPage()
initializeBannersPage()
initializeCharactersPage()
initializeSimulationPage()
initializeSimulationResultsPage()