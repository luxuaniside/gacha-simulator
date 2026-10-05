export function initialiazeMainTabNavigation(){
    const tabs = document.querySelectorAll(".subpage-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchMainTabs(tab.id, tab.dataset.target);

            tab.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        });
    });
}

export function initializeSubTabNavigation(){
    const tabs = document.querySelectorAll(".pity-subpage-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchSubTabs(tab.id, tab.dataset.target)
        });
    });
}


function switchMainTabs(navButton, sectionTarget){
    const sections = document.querySelectorAll(".subpage");
    const tabs = document.querySelectorAll(".subpage-tab");
    const navButtonSelected = document.querySelector(`#${navButton}`)
    const tabSelected = document.querySelector(`#${sectionTarget}`);

    sections.forEach(section => {
           section.classList.remove("is-active")
    });

    tabs.forEach(tab => {
           tab.classList.remove("is-active")
           
    });

    tabSelected.classList.add("is-active")
    navButtonSelected.classList.add("is-active")
    
    
}


function switchSubTabs(navButton, sectionTarget){
    const sections = document.querySelectorAll(".pity-subpage");
    const tabs = document.querySelectorAll(".pity-subpage-tab");
    const navButtonSelected = document.querySelector(`#${navButton}`)
    const tabSelected = document.querySelector(`#${sectionTarget}`);
    
    sections.forEach(section => {
           section.classList.remove("is-active")
    });

    tabs.forEach(tab => {
           tab.classList.remove("is-active")
    });

    tabSelected.classList.add("is-active")
    navButtonSelected.classList.add("is-active")
}
