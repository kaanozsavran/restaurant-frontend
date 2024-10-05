document.addEventListener("DOMContentLoaded", function () {
    // Fetch table number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('tableNumber');

    // Display the table number in the heading
    const tableNumberElement = document.getElementById('table-number');
    tableNumberElement.textContent = tableNumber;

    const apiUrl = `https://localhost:7035/api/Order/table/${tableNumber}`;
    const orderTableBody = document.getElementById('order-table-body');
    const totalPriceElement = document.getElementById('total-price');

    console.log("Fetching orders for table number:", tableNumber);

    // Fetch and display orders
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching orders: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched order data:', data);
            if (data.isSuccess && Array.isArray(data.result)) {
                orderTableBody.innerHTML = ''; // Clear existing rows

                // Filter orders to show only those with status "Pending"
                const pendingOrders = data.result.filter(order => order.orderStatus === 'Pending');

                if (pendingOrders.length === 0) {
                    orderTableBody.innerHTML = '<tr><td colspan="4">No pending orders found.</td></tr>';
                } else {
                    pendingOrders.forEach(order => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><input type="checkbox" class="order-checkbox" data-price="${order.totalPrice}" data-order-id="${order.orderID}"></td>
                            <td>${order.itemName}</td> <!-- Ürün adı -->
                            <td>${order.quantity}</td> <!-- Miktar -->
                            <td>${order.totalPrice} ₺</td> <!-- Toplam fiyat -->
                        `;
                        orderTableBody.appendChild(row);
                    });

                    // Add event listeners to checkboxes to recalculate total price
                    document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                        checkbox.addEventListener('change', calculateTotalPrice);
                    });
                }
            } else {
                console.error('Unexpected result format:', data.result);
                orderTableBody.innerHTML = '<tr><td colspan="4">No orders found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            orderTableBody.innerHTML = '<tr><td colspan="4">Error loading orders.</td></tr>';
        });

    // Calculate total price when checkboxes are selected/deselected
    function calculateTotalPrice() {
        let totalPrice = 0;

        // Loop through selected orders and sum the prices
        document.querySelectorAll('.order-checkbox:checked').forEach(checkbox => {
            totalPrice += parseFloat(checkbox.getAttribute('data-price'));
        });

        // Update the total price display
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }

    // Handle payment method selection from dropdown
    const paymentMethodButton = document.getElementById('payment-method-button');
    const paymentDropdownItems = document.querySelectorAll('.dropdown-item');

    paymentDropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedPaymentMethod = this.getAttribute('data-value');
            paymentMethodButton.textContent = selectedPaymentMethod;  // Update button text with selected payment method
        });
    });

    // Handle payment button click
    const paymentButton = document.getElementById('payment-button');
    paymentButton.addEventListener('click', function () {
        const selectedOrders = document.querySelectorAll('.order-checkbox:checked');
        if (selectedOrders.length === 0) {
            alert('Ödeme yapmak için en az bir sipariş seçmelisiniz!');
            return;
        }

        const isRefunded = false; // Ödeme iade koşulunu burada belirleyin

        const paymentDto = {
            paymentTime: new Date().toISOString(),
            paymentMethod: paymentMethodButton.textContent.trim(), // Ensure this is a valid method
            amountPaid: parseFloat(totalPriceElement.textContent),
            isRefunded: isRefunded,
            orderIDs: Array.from(selectedOrders).map(checkbox => parseInt(checkbox.getAttribute('data-order-id')))
        };

        console.log("Gönderilen Payment Data:", JSON.stringify(paymentDto, null, 2));

        // Make the payment request to the backend
        fetch('https://localhost:7035/api/Payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentDto)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ödeme işlemi sırasında hata oluştu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Payment response data:", data);
            if (data.isSuccess) {
                alert('Ödeme başarılı!');
                
                removeSelectedOrders(selectedOrders);
                return updateOrderStatus(selectedOrders);
                
            } else {
                alert('Ödeme başarısız: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Ödeme işlemi sırasında hata oluştu:', error);
            alert('Ödeme işlemi sırasında hata oluştu. Lütfen tekrar deneyin.');
        });
    });

    function removeSelectedOrders(selectedOrders) {
        selectedOrders.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                row.remove(); // Remove the row from the table
            }
        });
        // Optionally, reset total price display
        totalPriceElement.textContent = '0.00';
        console.log("Selected orders removed from UI successfully.");
    }

    // Function to update selected orders' status
    function updateOrderStatus(selectedOrders) {
        const updatePromises = Array.from(selectedOrders).map(checkbox => {
            const orderId = checkbox.getAttribute('data-order-id');
            const newStatus = "payment collected"; // New status to be sent

            return fetch(`https://localhost:7035/api/Order/${orderId}/status`, {
                method: 'PUT', // Use PUT or POST as required by your API
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newStatus) // Send the new status as a string
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Sipariş durumu güncelleme işlemi sırasında hata oluştu: ' + response.statusText);
                }
                return response.json();
            });
        });

        return Promise.all(updatePromises)
            .then(() => {
                // Optionally, reset total price display
                totalPriceElement.textContent = '0.00';
                console.log("Selected orders status updated successfully.");
            })
            .catch(error => {
                console.error('Sipariş durumu güncelleme işlemi sırasında hata oluştu:', error);
                alert('Sipariş durumu güncelleme işlemi sırasında hata oluştu. Lütfen tekrar deneyin.');
            });
    }
});
