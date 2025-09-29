const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#ffd93d",
    "#9b5de5",
    "#ff9f1c",
    "#36cfc9"
];

let colorIndex = 0;

const hello = document.getElementById("hello");
const button = document.querySelector('[data-action="change-color"]');

const applyColor = (color) => {
    hello.style.color = color;
    hello.style.textShadow = `0 0 35px ${color}66`;
    document.documentElement.style.setProperty("--accent", color);
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

if (button) {
    button.addEventListener("click", cycleColor);
}
