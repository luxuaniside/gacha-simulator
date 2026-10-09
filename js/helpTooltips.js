const TOOLTIP_GAP = 0;
const VIEWPORT_PADDING = 12;

function positionTooltip(help) {
    const button = help.querySelector(".help-button");
    const tooltip = help.querySelector(".help-tooltip");
    if (!button || !tooltip) {
        return;
    }

    tooltip.style.maxHeight = "";
    const buttonRect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const navBottom = document.querySelector(".subpage-nav")
        ?.getBoundingClientRect().bottom ?? 0;
    const minTop = Math.max(navBottom, VIEWPORT_PADDING);
    const maxBottom = window.innerHeight - VIEWPORT_PADDING;
    const spaceAbove = Math.max(0, buttonRect.top - TOOLTIP_GAP - minTop);
    const spaceBelow = Math.max(0, maxBottom - buttonRect.bottom - TOOLTIP_GAP);
    const placeAbove = spaceBelow < tooltipRect.height
        && (spaceAbove >= tooltipRect.height || spaceAbove > spaceBelow);
    const availableSpace = placeAbove ? spaceAbove : spaceBelow;

    tooltip.style.maxHeight = `${availableSpace}px`;
    const height = Math.min(tooltipRect.height, availableSpace);
    const top = placeAbove
        ? buttonRect.top - TOOLTIP_GAP - height
        : buttonRect.bottom + TOOLTIP_GAP;
    const left = Math.min(
        Math.max(buttonRect.left + (buttonRect.width - tooltipRect.width) / 2, VIEWPORT_PADDING),
        window.innerWidth - tooltipRect.width - VIEWPORT_PADDING
    );

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(minTop, top)}px`;
}

export function initializeHelpTooltips() {
    let activeHelp = null;

    function repositionActiveTooltip() {
        if (activeHelp) {
            positionTooltip(activeHelp);
        }
    }

    document.querySelectorAll(".help").forEach(help => {
        help.addEventListener("pointerenter", () => {
            activeHelp = help;
            positionTooltip(help);
        });

        help.addEventListener("pointerleave", () => {
            if (!help.contains(document.activeElement)) {
                activeHelp = null;
            }
        });

        help.addEventListener("focusin", () => {
            activeHelp = help;
            positionTooltip(help);
        });

        help.addEventListener("focusout", event => {
            if (!help.contains(event.relatedTarget) && !help.matches(":hover")) {
                activeHelp = null;
            }
        });
    });

    window.addEventListener("resize", repositionActiveTooltip);
    window.addEventListener("scroll", repositionActiveTooltip, true);
}
