(function (app) {
  'use strict';
  const pageItems = {};

  app.tourData = [];
  app.albumData = [];
  app.merchData = [];
  app.cartItems = [];
  app.storeData = [];

  app.homepage = async function () {
    await loadTourData();
    setTourData();
  };

  app.storepage = async function () {
    await loadAlbumData();
    await loadMerchData();
    setAlbumData();
    setMerchData();
    loadFromStorage();

    pageItems.addToCartButtons =
      document.getElementsByClassName('addToCartButton');
    for (let i = 0; i < pageItems.addToCartButtons.length; i++) {
      const button = pageItems.addToCartButtons[i];
      button.addEventListener('click', addToCartClicked);
    }

    pageItems.removeButtons =
      document.getElementsByClassName('remove-item-button');
    for (let i = 0; i < pageItems.removeButtons.length; i++) {
      const button = pageItems.removeButtons[i];
      button.addEventListener('click', removeFromCart);
    }

    pageItems.quantityInputs =
      document.getElementsByClassName('cart-item-quantity');
    for (let i = 0; i < pageItems.quantityInputs.length; i++) {
      const input = pageItems.quantityInputs[i];
      input.addEventListener('change', quantityChanged);
    }

    pageItems.purchaseButton = document.getElementById('purchaseButton');
    pageItems.purchaseButton.addEventListener('click', purchaseItems);
  };

  function loadFromStorage() {
    const cacheData = localStorage.getItem('cartItems');

    if (cacheData !== null) {
      const items = JSON.parse(cacheData);
      items.forEach((item) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.setAttribute('data-set-id', item.id);

        const itemImage = document.createElement('img');
        itemImage.classList.add('cart-item-image');
        itemImage.src = item.itemImage;
        cartItem.appendChild(itemImage);

        const h4 = document.createElement('h4');
        h4.classList.add('cart-item-name');
        h4.innerText = item.itemName;
        cartItem.appendChild(h4);

        const itemPrice = document.createElement('span');
        itemPrice.classList.add('cart-item-price');
        itemPrice.innerText = item.itemPrice;
        cartItem.appendChild(itemPrice);

        const quantity = document.createElement('input');
        quantity.classList.add('cart-item-quantity');
        quantity.setAttribute('type', 'number');
        quantity.setAttribute('min', '1');
        quantity.setAttribute('value', '1');
        quantity.setAttribute('required', '');
        quantity.value = item.itemQuantity;
        quantity.addEventListener('change', quantityChanged);
        cartItem.appendChild(quantity);

        const itemButton = document.createElement('button');
        itemButton.classList.add('remove-item-button');
        itemButton.innerText = 'Remove';
        itemButton.addEventListener('click', removeFromCart);

        cartItem.appendChild(itemButton);

        cartDiv.appendChild(cartItem);
        updateCartTotal();
        document.getElementById('cartContainer').style.visibility = 'visible';
      });
    }
  }

  function saveToLocalStorage() {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
      document.getElementById('cartContainer').style.visibility = 'hidden';
    }
    const items = Array.from(cartItems);
    const itemsToSave = items.map((item) => {
      return {
        id: item.getAttribute('data-set-id'),
        itemImage: item.firstElementChild.src,
        itemName: item.firstElementChild.nextElementSibling.innerText,
        itemPrice:
          item.lastElementChild.previousElementSibling.previousElementSibling
            .innerText,
        itemQuantity: item.lastElementChild.previousElementSibling.value,
      };
    });
    localStorage.setItem('cartItems', JSON.stringify(itemsToSave));
  }

  function purchaseItems() {
    const cartItems = document.querySelectorAll('.cart-item');
    document.getElementById('cartContainer').style.visibility = 'hidden';
    cartItems.forEach((el) => el.remove());
    window.location.replace('thankyou.html');
    localStorage.clear();
  }

  function addToCart(id, name, price, image) {
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

    const item = `<div class="cart-item" data-item-id="${id}">
              <img class="cart-item-image" src="${image}" alt="">
              <h4 class="cart-item-name">${name}</h4>
              <span class="cart-item-price">${price}</span>
              <input type="number" class="cart-item-quantity" value="1" min="1" required>
              <button class="remove-item-button" type="button">Remove</button>
            </div>`;

    cartItem.innerHTML = item;

    cartItem
      .getElementsByClassName('cart-item-quantity')[0]
      .addEventListener('change', quantityChanged);
    cartItem
      .getElementsByClassName('remove-item-button')[0]
      .addEventListener('click', removeFromCart);

    cartDiv.appendChild(cartItem);
    updateCartTotal();
  }

  function addToCartClicked(e) {
    const button = e.target;
    const item = button.parentElement.parentElement;
    const id = item.getAttribute('data-item-id');
    const name = item.getElementsByClassName('item-name')[0].innerText;
    const price = item.getElementsByClassName('item-price')[0].innerText;
    const image = item.getElementsByClassName('item-image')[0].src;

    document.getElementById('cartContainer').style.visibility = 'visible';

    addToCart(id, name, price, image);
    saveToLocalStorage();
  }

  function quantityChanged(e) {
    const input = e.target;
    if (input.value <= 0 || input.value > 500) {
      input.value = 1;
    }
    updateCartTotal();
    saveToLocalStorage();
  }

  function removeFromCart(e) {
    e.target.parentElement.remove();
    updateCartTotal();
    saveToLocalStorage();
  }

  function updateCartTotal() {
    const cartItemContainer = document.getElementById('cartDiv');
    const cartItems = cartItemContainer.getElementsByClassName('cart-item');
    let total = 0;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const priceElement = item.getElementsByClassName('cart-item-price')[0];
      const quantityElement =
        item.getElementsByClassName('cart-item-quantity')[0];
      const price = parseFloat(priceElement.innerText.replace('$', ''));
      const quantity = quantityElement.value;
      total += price * quantity;
    }
    total = Math.round(total * 100) / 100;
    const cartTotal = document.getElementsByClassName('cart-total-price')[0];
    cartTotal.innerText = `$${total.toFixed(2)}`;
  }

  function setMerchData() {
    const merchSection = document.getElementById('merchMenu');
    const originalMerchMenu = merchSection.querySelectorAll('.merch-item');
    const newItems = [];

    for (let i = 0; i < app.merchData.length; i++) {
      const item = app.merchData[i];
      const merchItem = document.createElement('div');
      merchItem.classList.add('merch-item');
      merchItem.setAttribute('data-item-id', item.id);

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
      price.innerText = `$${item.itemPrice / 100}`;
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
      const rawData = await fetch('merchdata.json');
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
      albumDiv.setAttribute('data-item-id', album.id);

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
      price.innerText = `$${album.itemPrice / 100}`;
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
    newItems.forEach((el) => albumSection.appendChild(el));
  }

  async function loadAlbumData() {
    const cacheData = sessionStorage.getItem('albumdata');

    if (cacheData !== null) {
      app.albumData = JSON.parse(cacheData);
    } else {
      const rawData = await fetch('albumdata.json');

      const data = await rawData.json();
      app.albumData = data;
      sessionStorage.setItem('albumdata', JSON.stringify(data));
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
      button.innerText = 'BUY TICKETS';
      tourInfo.appendChild(button);

      tours.appendChild(tourInfo);

      newTours.push(tourInfo);
    }
    originalTours.forEach((el) => el.remove());
    originlLines.forEach((el) => el.remove());
    newTours.forEach((el) => {
      tours.appendChild(el);
      const line = document.createElement('hr');
      line.classList.add('line');
      tours.appendChild(line);
    });
  }

  async function loadTourData() {
    const cacheData = sessionStorage.getItem('tourdata');

    if (cacheData !== null) {
      app.tourData = JSON.parse(cacheData);
    } else {
      const rawData = await fetch('tourdata.json');
      const data = await rawData.json();
      app.tourData = data;
      sessionStorage.setItem('tourdata', JSON.stringify(data));
    }
  }
})((window.app = window.app || {}));
