document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('tableNumber');

    const apiUrl = `https://localhost:7035/api/Order/table/${tableNumber}`;
    const orderTableBody = document.getElementById('order-table-body');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Siparişleri çekerken hata oluştu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.isSuccess && Array.isArray(data.result)) {
                orderTableBody.innerHTML = ''; // Temizle

                data.result.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" class="order-checkbox"></td>
                        <td>${order.itemName}</td> <!-- Ürün adı -->
                        <td>${order.quantity}</td> <!-- Miktar -->
                        <td>${order.totalPrice} ₺</td> <!-- Toplam fiyat -->
                    `;
                    orderTableBody.appendChild(row);
                });
            } else {
                console.error('Siparişler listesi beklenenden farklı:', data.result);
            }
        })
        .catch(error => {
            console.error('Siparişleri çekerken hata oluştu:', error);
        });

    // Ödeme yap butonuna tıklama olayı
    const paymentButton = document.getElementById('payment-button');
    paymentButton.addEventListener('click', function () {
        const selectedOrders = document.querySelectorAll('.order-checkbox:checked');
        if (selectedOrders.length === 0) {
            alert('Ödeme yapmak için en az bir sipariş seçmelisiniz!');
            return;
        }

        // Ödeme işlemi için gerekli kodlar buraya
        alert('Ödeme işlemi gerçekleştiriliyor...');
    });
});
