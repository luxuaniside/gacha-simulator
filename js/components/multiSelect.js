export class MultiSelect {
    constructor(container, items, options = {}) {
        this.container = container;
        this.items = items;
        this.min = options.min ?? 0;
        this.max = options.max ?? Infinity;
        this.selectedItems = (options.selectedItems ?? [])
            .filter(value => items.some(item => item.value === value))
            .slice(0, this.max);

        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="multi-select-input">
                <div class="selected-chips"></div>
                <input
                    type="text"
                    class="multi-select-search"
                    placeholder="Search..."
                >
                <button
                    type="button"
                    class="clear-selection"
                    aria-label="Clear selected items"
                    title="Clear selected items"
                    hidden
                ><span aria-hidden="true">×</span></button>
            </div>

            <div class="multi-select-dropdown">
                <button type="button" class="select-all-options"></button>
                <div class="multi-select-options"></div>
            </div>
        `;

        this.searchInput = this.container.querySelector(
            ".multi-select-search"
        );
        this.clearButton = this.container.querySelector(
            ".clear-selection"
        );

        this.chipsContainer = this.container.querySelector(
            ".selected-chips"
        );

        this.dropdown = this.container.querySelector(
            ".multi-select-dropdown"
        );
        this.optionsContainer = this.container.querySelector(
            ".multi-select-options"
        );
        this.selectAllButton = this.container.querySelector(
            ".select-all-options"
        );

        this.setupEvents();
        this.renderChips();
    }

    setupEvents() {
        this.container
            .querySelector(".multi-select-input")
            .addEventListener("click", event => {
                if (!event.target.closest(".selected-chip, .clear-selection")) {
                    this.searchInput.focus();
                }
            });

        // Open dropdown
        this.searchInput.addEventListener("focus", () => {
            this.dropdown.style.display = "block";
        });

        this.searchInput.addEventListener("input", () => {
            this.renderOptions();
            this.dropdown.style.display = "block";
        });

        // Select option
        this.optionsContainer.addEventListener("click", event => {
            const option = event.target.closest(".multi-select-option");

            if (!option) {
                return;
            }

            this.selectItem(option.dataset.value);
        });

        this.selectAllButton.addEventListener("click", () => {
            this.selectFilteredItems();
        });

        this.clearButton.addEventListener("click", () => {
            this.selectedItems = [];
            this.searchInput.value = "";
            this.renderChips();
            this.searchInput.focus();
        });

        // Clicking any chip removes that selection.
        this.chipsContainer.addEventListener("click", event => {
            const chip = event.target.closest(".selected-chip");

            if (!chip) {
                return;
            }

            this.removeItem(chip.dataset.value);
        });

        // Close when clicking outside
        document.addEventListener("click", event => {
            if (!this.container.contains(event.target)) {
                this.dropdown.style.display = "none";
            }
        });
    }

    selectItem(value) {
        // Don't select the same item twice
        if (this.selectedItems.includes(value)) {
            return;
        }

        // Don't exceed maximum
        if (this.selectedItems.length >= this.max) {
            return;
        }

        this.selectedItems.push(value);
        this.searchInput.value = "";

        this.renderChips();
    }

    removeItem(value) {
        this.selectedItems = this.selectedItems.filter(
            item => item !== value
        );

        this.renderChips();
    }

    selectFilteredItems() {
        const remainingSlots = Number.isFinite(this.max)
            ? Math.max(0, this.max - this.selectedItems.length)
            : this.items.length;
        const searchTerm = this.searchInput.value.trim().toLocaleLowerCase();
        const filteredItems = this.items.filter(item =>
            !this.selectedItems.includes(item.value) &&
            item.display.toLocaleLowerCase().includes(searchTerm)
        );

        this.selectedItems.push(
            ...filteredItems
                .slice(0, remainingSlots)
                .map(item => item.value)
        );
        this.renderChips();
    }

    renderChips() {
        this.chipsContainer.replaceChildren();

        this.searchInput.placeholder =
            this.selectedItems.length > 0 ? "" : "Search...";
        this.clearButton.hidden = this.selectedItems.length === 0;

        this.selectedItems.forEach(value => {
            const item = this.items.find(
                item => item.value === value
            );

            if (!item) {
                return;
            }

            const chip = document.createElement("button");
            chip.classList.add("selected-chip");
            chip.type = "button";
            chip.dataset.value = item.value;
            chip.setAttribute("aria-label", `Remove ${item.display}`);
            chip.title = "Click to remove";

            const label = document.createElement("span");
            label.textContent = item.display;
            const removeIcon = document.createElement("span");
            removeIcon.textContent = "×";
            removeIcon.setAttribute("aria-hidden", "true");
            chip.append(label, removeIcon);
            this.chipsContainer.appendChild(chip);
        });

        this.selectAllButton.textContent = "Select all";

        this.renderOptions();
    }

    renderOptions() {
        const searchTerm = this.searchInput.value.trim().toLocaleLowerCase();
        const availableItems = this.items.filter(item =>
            !this.selectedItems.includes(item.value) &&
            item.display.toLocaleLowerCase().includes(searchTerm)
        );

        this.optionsContainer.replaceChildren();

        if (availableItems.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("multi-select-empty");
            emptyMessage.textContent = "No matching options";
            this.optionsContainer.appendChild(emptyMessage);
            return;
        }

        availableItems.forEach(item => {
            const option = document.createElement("div");
            option.classList.add("multi-select-option");
            option.dataset.value = item.value;
            option.textContent = item.display;
            this.optionsContainer.appendChild(option);
        });
    }

    getValues() {
        return this.selectedItems;
    }
}