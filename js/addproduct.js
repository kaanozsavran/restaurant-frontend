document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Formun sayfayı yenilemesini engeller

        // Formdan verileri alma
        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const productPrice = document.getElementById('productPrice').value;
        const productImage = document.getElementById('productImage').value;
        const productCategory = document.getElementById('productCategory').value;

        // Verileri bir obje olarak paketleme
        const newProduct = {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            imageUrl: productImage,
            category: productCategory
        };

        // Verileri API'ye gönderme
        fetch('https://localhost:7035/api/MenuItem/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        })
            .then(response => response.json())
            .then(data => {
                // Başarılı işlem sonrası yapılacaklar
                console.log('Ürün başarıyla eklendi:', data);
                alert('Ürün başarıyla eklendi!');
            })
            .catch(error => {
                // Hata yönetimi
                console.error('Ürün ekleme sırasında bir hata oluştu:', error);
                alert('Ürün eklenirken bir hata oluştu.');
            });
    });
});
