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
                    <button class="order-now-btn btn btn-primary" data-id="${item.menuItemID}">Order Now</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Attach event listeners to all "Order Now" buttons
    document.querySelectorAll('.order-now-btn').forEach(button => {
        button.addEventListener('click', function () {
            const itemID = this.getAttribute('data-id'); // Ensure the attribute is correctly retrieved
            console.log("Item ID:", itemID); // Debugging log to verify if itemID is correct
            localStorage.setItem('menuItemID', itemID);


            // Call a function to handle adding the item to the cart
            addItemToCart(itemID);
        });
    });
}

function addItemToCart(itemID) {
    if (!itemID) {
        console.error("Invalid item ID:", itemID); // Check if itemID is valid before proceeding
        return;
    }

    // Set the quantity as needed (for now, we set it to 1)
    const quantity = 1;

    // Create the request body as expected by your API
    const requestBody = {
        menuItemID: parseInt(itemID), // Ensure itemID is an integer
        quantity: quantity
    };

    console.log("Request body:", requestBody);

    // Send the POST request to the correct endpoint
    fetch('https://localhost:7035/api/OrderItem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                console.error("Response status:", response.status);
                return response.json().then(errorData => {
                    console.error("Error response data:", errorData);
                    throw new Error(errorData.errorMessage || "Unknown error");
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess) {
                alert("Item added to the cart successfully!");
                console.log("Order item added successfully:", data);
            } else {
                console.error("Error adding order item:", data.errorMessage);
            }
        })
        .catch(error => console.error("Error:", error.message || error));
}
