document.addEventListener("DOMContentLoaded", function () {
    fetchCartItems();  // Fetch all items when the page loads

    document.getElementById('checkout-btn').addEventListener('click', function () {
        // Ask for table number when the 'Ödeme Yap' button is clicked
        const tableNumber = prompt("Lütfen masa numarasını girin:");

        // Ensure the user entered a valid table number
        if (tableNumber && !isNaN(tableNumber)) {
            checkoutAndClearBasket(tableNumber);
        } else {
            alert("Geçerli bir masa numarası giriniz.");
        }
    });
});

function fetchCartItems() {
    const url = `https://localhost:7035/api/OrderItem/all`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.isSuccess) {
                displayCartItems(data.result);
            } else {
                console.error("Sepet öğeleri alınırken hata:", data.errorMessage);
            }
        })
        .catch(error => console.error("Hata:", error));
}

function displayCartItems(items) {
    const cartTableBody = document.getElementById('cart-table-body');
    cartTableBody.innerHTML = '';  // Clear existing table content

    if (items.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Sepetiniz boş.</td></tr>';
        document.getElementById('cart-total-price').innerText = '0 TL';
        return;
    }

    const aggregatedItems = {};

    items.forEach(item => {
        if (aggregatedItems[item.menuItemID]) {
            aggregatedItems[item.menuItemID].quantity += item.quantity;
        } else {
            aggregatedItems[item.menuItemID] = { ...item };
        }
    });

    let totalPrice = 0;

    Object.values(aggregatedItems).forEach(item => {
        const itemTotalPrice = item.quantity * item.itemPrice;
        totalPrice += itemTotalPrice;

        const row = `
            <tr>
                <td style="color:#efeee3;">${item.itemName}</td>
                <td style="color:#efeee3;">${item.itemPrice} TL</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.orderItemID}, this.value, this)">
                </td>
                <td class="total-price" style="color:#efeee3;">${itemTotalPrice} TL</td>
                <td>
                    <button class="btn btn-danger btnDelete" style="background-color:#efeee3;color:#41553d;" onclick="removeCartItem(${item.orderItemID})">Sil</button>
                </td>
            </tr>
        `;
        cartTableBody.innerHTML += row;
    });

    document.getElementById('cart-total-price').innerText = totalPrice + ' TL';
}

function updateCartItemQuantity(orderItemID, newQuantity, element) {
    const url = `https://localhost:7035/api/OrderItem/update-quantity/${orderItemID}`;
    const data = { newQuantity: parseInt(newQuantity) };

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.isSuccess) {
                console.log('Ürün adedi başarıyla güncellendi!');
                const row = element.closest('tr');
                const itemPrice = parseFloat(row.querySelector('td:nth-child(2)').innerText.replace(' TL', ''));
                const totalPriceCell = row.querySelector('.total-price');
                totalPriceCell.innerText = (itemPrice * newQuantity) + ' TL';

                // Update total price
                updateTotalPrice();
            } else {
                console.error("Adet güncellenirken hata:", data.errorMessage);
            }
        })
        .catch(error => {
            console.error('Güncelleme sırasında hata oluştu:', error);
        });
}

function removeCartItem(orderItemID) {
    const url = `https://localhost:7035/api/OrderItem/${orderItemID}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess) {
                console.log('Ürün sepetten başarıyla silindi!');
                fetchCartItems();
            } else {
                console.error("Ürün silinirken hata:", data.errorMessage);
            }
        })
        .catch(error => {
            console.error('Silme işlemi sırasında hata oluştu:', error);
        });
}

function updateTotalPrice() {
    const rows = document.querySelectorAll('#cart-table-body tr');
    let totalPrice = 0;

    rows.forEach(row => {
        const priceText = row.querySelector('.total-price').innerText;
        totalPrice += parseFloat(priceText.replace(' TL', ''));
    });

    document.getElementById('cart-total-price').innerText = totalPrice + ' TL';
}

function checkoutAndClearBasket(tableNumber) {
    // Gather all order items (name and quantity) from the cart
    const rows = document.querySelectorAll('#cart-table-body tr');

    rows.forEach(row => {
        const itemName = row.querySelector('td:nth-child(1)').innerText;
        const itemPrice = parseFloat(row.querySelector('td:nth-child(2)').innerText.replace(' TL', ''));
        const quantity = parseInt(row.querySelector('input[type="number"]').value);

        // Calculate total price for this item
        const totalPrice = itemPrice * quantity;

        // Prepare the data for each order item
        const orderData = {
            tableNumber: parseInt(tableNumber),
            
            totalPrice: totalPrice,
            itemName: itemName,
            quantity: quantity,
            orderStatus: 'Pending'
        };

        // Send the order for each item separately
        const createOrderUrl = 'https://localhost:7035/api/Order';

        fetch(createOrderUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.isSuccess) {
                    console.log('Sipariş başarıyla oluşturuldu:', itemName);
                } else {
                    console.error("Sipariş oluşturulurken hata:", data.errorMessage);
                }
            })
            .catch(error => {
                console.error('Sipariş oluşturulurken hata oluştu:', error);
            });
    });

    // Clear basket after all orders are placed
    clearBasket();
}


function clearBasket() {
    const url = 'https://localhost:7035/api/OrderItem/clear-basket'; // API endpoint to clear the basket

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess) {
                console.log('Sepet başarıyla temizlendi!');
                // Clear the UI
                document.getElementById('cart-table-body').innerHTML = '<tr><td colspan="5" class="text-center">Sepetiniz boş.</td></tr>';
                document.getElementById('cart-total-price').innerText = '0 TL';
            } else {
                console.error("Sepeti temizlerken hata:", data.errorMessage);
            }
        })
        .catch(error => {
            console.error('Sepeti temizlerken hata oluştu:', error);
        });
}