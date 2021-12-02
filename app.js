(function (app) {
    'use strict';
    const pageItems = {};

    app.tourData = [];
    app.albumData = [];
    app.merchData = [];

    app.homepage = async function () {
        await loadTourData();
        setTourData();
    };

    app.storepage = async function () {
        await loadAlbumData();
        await loadMerchData();
        setAlbumData();
        setMerchData();
        
        pageItems.addToCartButtons = document.getElementsByClassName('addToCartButton');
        for (let i = 0; i < pageItems.addToCartButtons.length; i++) {
            const button = pageItems.addToCartButtons[i];
            button.addEventListener('click', addToCartClicked);
        };

        pageItems.removeButtons = document.getElementsByClassName('remove-item-button');
        for (let i = 0; i < pageItems.removeButtons.length; i++) {
            const button = pageItems.removeButtons[i];
            button.addEventListener('click', removeFromCart);
        };

        pageItems.quantityInputs = document.getElementsByClassName('cart-item-quantity');
        for (let i = 0; i < pageItems.quantityInputs.length; i++) {
            const input = pageItems.quantityInputs[i];
            input.addEventListener('change', quantityChanged);
        };
    };

    function addToCart(name, price, image) {
        const cartDiv = document.getElementById('cartDiv');
        const cartItems = cartDiv.getElementsByClassName('cart-item-name');
        toastr.success('Added To Cart');
        for (let i = 0; i < cartItems.length; i++) {
            const n = cartItems[i];
            if (n.innerText == name) {
                n.nextElementSibling.nextElementSibling.value++;
                updateCartTotal();
                return;
            }
        }

        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        
        const Cimage = document.createElement('img');
        Cimage.classList.add('cart-item-image');
        Cimage.src = image;
        console.log(Cimage.src);
        cartItem.appendChild(Cimage);

        const h4 = document.createElement('h4');
        h4.classList.add('cart-item-name');
        h4.innerText = name;
        cartItem.appendChild(h4);

        const Cprice = document.createElement('span');
        Cprice.classList.add('cart-item-price');
        Cprice.innerText = price;
        cartItem.appendChild(Cprice);

        const quantity = document.createElement('input');
        quantity.classList.add('cart-item-quantity');
        quantity.setAttribute('type', 'number');
        quantity.setAttribute('min', '1');
        quantity.setAttribute('value', '1');
        quantity.setAttribute('required', '');
        quantity.addEventListener('change', quantityChanged);
        cartItem.appendChild(quantity);

        const Cbutton = document.createElement('button');
        Cbutton.classList.add('remove-item-button');
        Cbutton.innerText = 'Remove';
        Cbutton.addEventListener('click', removeFromCart);
        
        cartItem.appendChild(Cbutton);

        cartDiv.appendChild(cartItem);
        updateCartTotal();

    }

    function addToCartClicked(e) {
        const button = e.target;
        const item = button.parentElement.parentElement;
        const name = item.getElementsByClassName('item-name')[0].innerText;
        const price = item.getElementsByClassName('item-price')[0].innerText;
        const image = item.getElementsByClassName('item-image')[0].src;
        
        document.getElementById('cartContainer').style.visibility = 'visible';

        addToCart(name, price, image);
    }

    function quantityChanged(e) {
        const input = e.target;
        if (input.value <= 0 || input.value > 500) {
            input.value = 1;
        }
        updateCartTotal();
    }

    function removeFromCart(e) {
        e.target.parentElement.remove();
        updateCartTotal();

    }

    function updateCartTotal() {
        const cartItemContainer = document.getElementById('cartDiv');
        const cartItems = cartItemContainer.getElementsByClassName('cart-item');
        let total = 0;

        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const priceElement = item.getElementsByClassName('cart-item-price')[0];
            const quantityElement = item.getElementsByClassName('cart-item-quantity')[0];
            const price = parseFloat(priceElement.innerText.replace('$', ''));
            const quantity = quantityElement.value;
            total += (price * quantity);
        }
        total = Math.round(total * 100) / 100;
        const cartTotal = document.getElementsByClassName('cart-total-price')[0];
        cartTotal.innerText = `$${total}`;
    }

    function setMerchData() {
        const merchSection = document.getElementById('merchMenu');
        const originalMerchMenu = merchSection.querySelectorAll('.merch-item');
        const newItems = [];

        for (let i = 0; i < app.merchData.length; i++) {
            const item = app.merchData[i];
            const merchItem = document.createElement('div');
            merchItem.classList.add('merch-item');

            const merchName = document.createElement('h3');
            merchName.innerText = item.itemName;
            merchName.classList.add('item-name');
            merchItem.appendChild(merchName);

            const image = document.createElement('img');
            image.src = item.itemImage;
            image.classList.add('item-image');
            merchItem.appendChild(image);

            const div = document.createElement('div');

            const price = document.createElement('span');
            price.innerText = `$${item.itemPrice}`;
            price.classList.add('item-price');
            div.appendChild(price);

            const button = document.createElement('button');
            button.innerText = 'Add To Cart';
            button.classList.add('addToCartButton');
            div.appendChild(button);

            merchItem.appendChild(div);

            newItems.push(merchItem);
        }
        originalMerchMenu.forEach((el) => el.remove());
        newItems.forEach((el) => merchSection.appendChild(el));
    }

    async function loadMerchData() {
        const cacheData = sessionStorage.getItem('merchdata');

        if (cacheData !== null) {
            app.merchData = JSON.parse(cacheData);
        } else {
            const rawData = await fetch('SiteData/merchData.json');
            const data = await rawData.json();
            app.merchData = data;
            sessionStorage.setItem('merchdata', JSON.stringify(data));
        }
    }

    function setAlbumData() {
        const albumSection = document.getElementById('albumMenu');
        const originalAlbumSection = albumSection.querySelectorAll('.album');
        const newItems = [];

        for (let i = 0; i < app.albumData.length; i++) {
            const album = app.albumData[i];
            const albumDiv = document.createElement('div');
            albumDiv.classList.add('album');

            const title = document.createElement('h3');
            title.innerText = album.itemName;
            title.classList.add('item-name');

            albumDiv.appendChild(title);

            const image = document.createElement('img');
            image.src = album.itemImage;
            image.classList.add('item-image');

            albumDiv.appendChild(image);

            const div = document.createElement('div');
            const price = document.createElement('span');
            price.innerText = `$${album.itemPrice}`;
            price.classList.add('item-price');

            div.appendChild(price);

            const button = document.createElement('button');
            button.innerText = 'Add To Cart';
            button.classList.add('addToCartButton');

            div.appendChild(button);

            albumDiv.appendChild(div);

            newItems.push(albumDiv);
        }
        originalAlbumSection.forEach((el) => el.remove());
        newItems.forEach((el => albumSection.appendChild(el)));
    }

    async function loadAlbumData() {
        const cacheData = sessionStorage.getItem('albumdata');

        if (cacheData !== null) {
            app.albumData = JSON.parse(cacheData);
        } else {
            const rawData = await fetch('SiteData/albumdata.json');
            const data = await rawData.json();
            app.albumData = data;
            sessionStorage.setItem('albumdata', JSON.stringify(data))
        }
    }

    function setTourData() {
        const tours = document.getElementById('tours');
        const originalTours = document.querySelectorAll('.tour-row');
        const originlLines = tours.querySelectorAll('hr');
        const newTours = [];
        
        for (let i = 0; i < app.tourData.length; i++) {
            const tour = app.tourData[i];
            const tourInfo = document.createElement('div');
            tourInfo.classList.add('tour-row');

            const tourDate = document.createElement('span');
            tourDate.classList.add('tour-date');
            tourDate.innerText = tour.date;
            tourInfo.appendChild(tourDate);
            
            const tourCity = document.createElement('span');
            tourCity.classList.add('tour-city');
            tourCity.innerText = tour.city;
            tourInfo.appendChild(tourCity);

            const tourArena = document.createElement('span');
            tourArena.classList.add('tour-arena');
            tourArena.innerText = tour.arena;
            tourInfo.appendChild(tourArena);

            const button = document.createElement('button');
            button.classList.add('buy-ticket-button');
            button.innerText = 'BUY TICKETS'
            tourInfo.appendChild(button);
            
            tours.appendChild(tourInfo);

            newTours.push(tourInfo);
        }
        originalTours.forEach((el) => el.remove());
        originlLines.forEach((el) => el.remove());
        newTours.forEach((el) => {
            tours.appendChild(el)
            const line = document.createElement('hr');
            line.classList.add('line');
            tours.appendChild(line)
        });
    };

    async function loadTourData() {
        const cacheData = sessionStorage.getItem('tourdata');

        if (cacheData !== null) {
            app.tourData = JSON.parse(cacheData);
        } else {
            const rawData = await fetch('SiteData/tourdata.json');
            const data = await rawData.json();
            app.tourData = data;
            sessionStorage.setItem('tourdata', JSON.stringify(data));
        }
    };


})(window.app = window.app || {});