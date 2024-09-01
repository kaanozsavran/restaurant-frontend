const tabsBox = document.querySelector(".tabs-box"),
    allTabs = document.querySelectorAll(".tab"),
    arrowIcons = document.querySelectorAll(".icon i");

let isDragging = false;

const handleIcons = () => {
    let scrollVal = Math.round(tabsBox.scrollLeft);
    let maxScrollableWidth = tabsBox.scrollWidth - tabsBox.clientWidth;
    arrowIcons[0].parentElement.style.display = scrollVal > 0 ? "flex" : "none";
    arrowIcons[1].parentElement.style.display = maxScrollableWidth > scrollVal ? "flex" : "none";

}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        tabsBox.scrollLeft += icon.id === "left" ? -350 : 350;
        setTimeout(() => handleIcons(), 50);
    });

});
allTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabsBox.querySelector(".active").classList.remove("active");
        tab.classList.add("active");
    });

});

const dragging = (e) => {
    if (!isDragging) return;
    tabsBox.classList.add("dragging");
    tabsBox.scrollLeft -= e.movementX;
    handleIcons();
}

const dragStop = () => {
    isDragging = false;
    tabsBox.classList.remove("dragging");

}

tabsBox.addEventListener("mousedown", () => isDragging = true);
tabsBox.addEventListener("mousemove", dragging);
tabsBox.addEventListener("mouseup", dragStop);

document.addEventListener("DOMContentLoaded", async function () {
    const category = "beer"; // Assuming "beer" is the category you want to fetch
    const url = `https://localhost:7035/api/MenuItem/category/${category}`; // Correct URL format with template literals

    try {
        const response = await fetch(url);
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.isSuccess) {
            displayMenuItems(data.result);
        } else {
            console.error("Error fetching menu items:", data.errorMessage);
        }
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
});

function displayMenuItems(items) {
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; // Clear existing content

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-lg-6';
        card.innerHTML = `
            <div class="card">
                <img src="../img/biraa.jpg" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text">${item.price} TL</p>
                    <a href="#" class="btn">Order Now</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}










