const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#ffd93d",
    "#9b5de5",
    "#ff9f1c",
    "#36cfc9"
];

let colorIndex = 0;
const root = document.documentElement;

const hello = document.getElementById("hello");
const colorButton = document.querySelector('[data-action="change-color"]');

const applyColor = (color) => {
    if (hello) {
        hello.style.color = color;
        hello.style.textShadow = `0 0 35px ${color}66`;
    }
    root.style.setProperty("--accent", color);
};

const cycleColor = () => {
    colorIndex = (colorIndex + 1) % colors.length;
    applyColor(colors[colorIndex]);
};

if (hello) {
    applyColor(colors[colorIndex]);
    hello.addEventListener("click", cycleColor);
    hello.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            cycleColor();
        }
    });
}

if (colorButton) {
    colorButton.addEventListener("click", cycleColor);
}

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

const activateTab = (targetId) => {
    tabs.forEach((tab) => {
        const isActive = tab.dataset.tabTarget === targetId;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
    });
};

if (tabs.length && panels.length) {
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => activateTab(tab.dataset.tabTarget));
        tab.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const currentIndex = Array.from(tabs).indexOf(tab);
            const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
            tabs[nextIndex].focus();
            activateTab(tabs[nextIndex].dataset.tabTarget);
        });
    });
}

const form = document.getElementById("entry-form");
const textarea = document.getElementById("entry-content");
const entryList = document.getElementById("entry-list");
const hint = document.querySelector(".hint");
const selectedEntry = document.getElementById("selected-entry");

const showHint = (message, isError = false) => {
    if (!hint) {
        return;
    }
    hint.textContent = message;
    hint.style.color = isError ? "#ff9f9f" : "rgba(255, 255, 255, 0.75)";
};

const highlightSelected = () => {
    if (!selectedEntry) {
        return;
    }
    selectedEntry.classList.remove("is-highlighted");
    requestAnimationFrame(() => {
        selectedEntry.classList.add("is-highlighted");
    });
};

const setActiveEntryButton = (button) => {
    if (!entryList || !selectedEntry) {
        return;
    }
    entryList.querySelectorAll(".entry").forEach((entryBtn) => {
        entryBtn.classList.toggle("is-active", entryBtn === button);
    });
    selectedEntry.textContent = button?.textContent || "Create Something Beautiful";
    highlightSelected();
};

const attachEntryHandler = (button) => {
    button.addEventListener("click", () => {
        setActiveEntryButton(button);
    });
};

const removeEmptyState = () => {
    const empty = entryList?.querySelector(".empty-state");
    if (empty) {
        empty.remove();
    }
};

const prependEntry = (entry) => {
    if (!entryList) {
        return;
    }
    removeEmptyState();
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "entry";
    button.dataset.entryId = String(entry.id);
    button.textContent = entry.content;
    attachEntryHandler(button);
    listItem.appendChild(button);
    entryList.prepend(listItem);
    setActiveEntryButton(button);
};

entryList?.querySelectorAll(".entry").forEach((button) => attachEntryHandler(button));

const firstEntry = entryList?.querySelector(".entry");
if (firstEntry) {
    setActiveEntryButton(firstEntry);
} else if (selectedEntry) {
    selectedEntry.textContent = "Create Something Beautiful";
}

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!textarea) {
        return;
    }
    const content = textarea.value.trim();
    if (!content) {
        showHint("Please share a message before saving.", true);
        return;
    }

    const formData = new URLSearchParams();
    formData.append("content", content);

    try {
        const response = await fetch("/entries", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData?.detail || "Unable to save message.";
            showHint(detail, true);
            return;
        }

        const entry = await response.json();
        prependEntry(entry);
        textarea.value = "";
        textarea.focus();
        showHint("Saved! Click a message to relive it.");
    } catch (error) {
        console.error(error);
        showHint("Network hiccup – please try again.", true);
    }
});
