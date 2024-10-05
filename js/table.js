document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = 'https://localhost:7035/api/Table/GetAllTables';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Hata ayıklama için gelen veriyi konsola yazdır
            console.log('Gelen veri:', data);
            
            if (Array.isArray(data.result)) {
                const tableContainer = document.getElementById('table-container');
                tableContainer.innerHTML = ''; // Önceki içerikleri temizle

                data.result.forEach(table => {
                    const tableDiv = document.createElement('div');
                    tableDiv.className = 'col-md-3';
                    tableDiv.innerHTML = `
                        <div class="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded table-item" data-table-number="${table.tableNumber}">
                            <div>
                                <h3 class="fs-2">MASA ${table.tableNumber}</h3>
                            </div>
                            <i class="fas fa-desktop fs-1 primary-text border rounded-full secondary-bg p-3"></i>
                        </div>
                    `;
                    tableContainer.appendChild(tableDiv);
                });

                // Her masa öğesine tıklama olay dinleyicisi ekleyin
                document.querySelectorAll('.table-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const tableNumber = this.getAttribute('data-table-number');
                        window.location.href = `order-details.html?tableNumber=${tableNumber}`;
                    });
                });
            } else {
                console.error('Sonuç bir dizi değil:', data.result);
            }
        })
        .catch(error => {
            console.error('Fetch işlemi sırasında bir sorun oluştu:', error);
        });
});
