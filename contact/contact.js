window.addEventListener('scroll', function () {
    const caption = document.querySelector('.carousel-caption');
    const scrollPosition = window.scrollY; // Sayfanın ne kadar kaydırıldığını alır

    if (scrollPosition > 175) { // 200px kaydırma sonrası
        caption.style.opacity = '0'; // HAKKIMIZDA yazısını gizle
    } else {
        caption.style.opacity = '1'; // HAKKIMIZDA yazısını göster
    }
});

