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

    // Fetch and display orders
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Siparişleri çekerken hata oluştu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess && Array.isArray(data.result)) {
                orderTableBody.innerHTML = ''; // Clear existing rows

                data.result.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" class="order-checkbox" data-price="${order.totalPrice}"></td>
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
            } else {
                console.error('Siparişler listesi beklenenden farklı:', data.result);
            }
        })
        .catch(error => {
            console.error('Siparişleri çekerken hata oluştu:', error);
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

    // Handle payment button click
    const paymentButton = document.getElementById('payment-button');
    paymentButton.addEventListener('click', function () {
        const selectedOrders = document.querySelectorAll('.order-checkbox:checked');
        if (selectedOrders.length === 0) {
            alert('Ödeme yapmak için en az bir sipariş seçmelisiniz!');
            return;
        }

        // Handle payment logic here
        alert('Ödeme işlemi gerçekleştiriliyor...');
    });
});
