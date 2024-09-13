document.addEventListener("DOMContentLoaded", function () {
    fetchCartItems();  // Fetch all items
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
    let totalCartPrice = 0;  // Toplam fiyatı tutacak değişken


    if (items.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Sepetiniz boş.</td></tr>';
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

    Object.values(aggregatedItems).forEach(item => {
        const totalPrice = item.quantity * item.itemPrice;
        totalCartPrice += totalPrice;  // Her ürünün toplam fiyatını ana toplam fiyata ekle

        const row = `
                    <tr>
                        <td style="color: #efeee3;">${item.itemName}</td>
                        <td style="color: #efeee3;">${item.itemPrice} TL</td>
                        <td>
                            <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.orderItemID}, this.value, this)">
                        </td>
                        <td class="total-price" style="color: #efeee3;">${totalPrice} TL</td>
                        <td>
                            <button class="btn btn-danger btnDelete" style="background-color: #efeee3;color: #41553d;"onclick="removeCartItem(${item.orderItemID})">Sil</button>
                        </td>
                    </tr>
                `;
        cartTableBody.innerHTML += row;
    });
    document.getElementById('cart-total-price').innerText = `${totalCartPrice} TL`;

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
                const newTotalPrice = itemPrice * newQuantity;
                totalPriceCell.innerText = `${newTotalPrice} TL`;

                // Toplam fiyatı yeniden hesapla
                calculateTotalCartPrice();
            } else {
                console.error("Adet güncellenirken hata:", data.errorMessage);
            }
        })
        .catch(error => {
            console.error('Güncelleme sırasında hata oluştu:', error);
        });
}


function calculateTotalCartPrice() {
    let totalCartPrice = 0;
    const rows = document.querySelectorAll('#cart-table-body tr');

    rows.forEach(row => {
        const totalPriceCell = row.querySelector('.total-price');
        const totalPrice = parseFloat(totalPriceCell.innerText.replace(' TL', ''));
        totalCartPrice += totalPrice;
    });

    // Toplam fiyatı güncelle
    document.getElementById('cart-total-price').innerText = `${totalCartPrice} TL`;
}


function removeCartItem(orderItemID) {
    const url = `https://localhost:7035/api/OrderItem/${orderItemID}`;

    // DELETE isteği gönder
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
                // Sepet öğelerini yeniden yükle
                fetchCartItems();
            } else {
                console.error("Ürün silinirken hata:", data.errorMessage);
            }
        })
        .catch(error => {
            console.error('Silme işlemi sırasında hata oluştu:', error);
        });
}