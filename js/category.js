async function fetchAndDisplayItems(category) {
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
            console.error(`Error fetching ${category} items:`, data.errorMessage);
        }
    } catch (error) {
        console.error(`Error fetching ${category} items:`, error);
    }
}

function displayMenuItems(items) {
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; // Clear existing content

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-lg-6';
        card.innerHTML = `
            <div class="card">
                <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
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
