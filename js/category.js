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
                    <button class="order-now-btn btn btn-primary d-block d-md-none" data-id="${item.menuItemID}">Order Now</button>
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
        console.error("Invalid item ID:", itemID);
        return;
    }

    const quantity = 1; // Default quantity to add

    // Check if the item is already in the cart
    fetch(`https://localhost:7035/api/OrderItem/by-item/${itemID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess && data.result && data.result.length > 0) {
                // If the item is found in the cart, update its quantity
                const existingItem = data.result[0]; // Ensure we're accessing the first item in the array
                console.log("Existing item in cart:", existingItem);

                const currentQuantity = existingItem.quantity ? parseInt(existingItem.quantity, 10) : 0;
                const updatedQuantity = currentQuantity + quantity;

                if (isNaN(updatedQuantity)) {
                    console.error("Invalid quantity for update:", updatedQuantity);
                    return;
                }

                console.log(`Updating item with ID: ${existingItem.orderItemID}, new quantity: ${updatedQuantity}`);

                const requestBody = {
                    NewQuantity: updatedQuantity // Wrap quantity in an object with correct property name
                };

                // Update the quantity via PUT request
                fetch(`https://localhost:7035/api/OrderItem/update-quantity/${existingItem.orderItemID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody) // Send updated quantity in the request body
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(errorData => {
                                console.error("Error response data:", errorData);
                                throw new Error(`Failed to update quantity. Status: ${response.status}`);
                            });
                        }
                        return response.json();
                    })
                    .then(updateData => {
                        if (updateData.isSuccess) {
                            alert("Item quantity updated in the cart!");
                        } else {
                            console.error("Error updating quantity:", updateData.errorMessage);
                        }
                    })
                    .catch(error => console.error("Error:", error.message || error));

            } else {
                // If the item is not found in the cart (empty result array), add it
                console.log("No existing item found, adding new item to cart.");

                const requestBody = {
                    menuItemID: parseInt(itemID, 10),
                    quantity: quantity
                };

                console.log("Adding new item to cart:", requestBody);

                fetch('https://localhost:7035/api/OrderItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(errorData => {
                                console.error("Error response data:", errorData);
                                throw new Error(`Failed to add item. Status: ${response.status}`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.isSuccess) {
                            alert("Ürün başarıyla sepete eklendi!");
                        } else {
                            console.error("Sepete ürün eklemede hata:", data.errorMessage);
                        }
                    })
                    .catch(error => console.error("Error:", error.message || error));
            }
        })
        .catch(error => {
            console.error("Error fetching cart item:", error.message || error);
        });
}







