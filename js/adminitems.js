async function fetchAndDisplayItems(category) {
    const url = `https://localhost:7035/api/MenuItem/category/${category}`;

    try {
        const response = await fetch(url);

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

async function deleteMenuItem(menuItemID) {
    const url = `https://localhost:7035/api/MenuItem/delete/${menuItemID}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isSuccess) {
            alert('Ürün başarıyla silindi!');
            fetchAndDisplayItems('beer'); // Refresh the item list
        } else {
            alert(`Ürün silme işleminde hata!: ${data.errorMessage}`);
        }
    } catch (error) {
        console.error(`Ürün silme işleminde hata!:`, error);
    }
}

function displayMenuItems(items) {
    const container = document.getElementById('item-container');
    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-lg-6 mb-4';
        card.innerHTML = `
            <div class="card" >
                <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text">${item.price} TL</p>
                    <button class="btn btn-danger" onclick="deleteMenuItem(${item.menuItemID})">Sil</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
