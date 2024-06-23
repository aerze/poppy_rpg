import "./shop.scss";

const shopItems = [
  {
    image: '/icons/icon1.png',
    name: 'Potion',
    description: '+20HP',
    price: '200'
  }, {
    image: '/icons/icon3.png',
    name: 'Potato',
    description: '+10HP',
    price: '500K'
  },
  {
    image: '/icons/icon31.png',
    name: 'Free Revive Ticket',
    description: 'Revives 1 Party Member',
    price: '120M'
  }
]

const items = [...shopItems, ...shopItems, ...shopItems];

function ShopItem({ image, name, description, price }) {
  return (
    <div className="shop-item">
      <div className="item-image">
        <div className="bg2"></div>
        <div className="bg1"></div>
        <div className="icon">
          <img src={image} />
        </div>
      </div>
      {/* <div className="item-name">
        {name}
      </div> */}
      <div className="item-description">
        <div className="name">{name}</div>
        <div className="text">
          {description}
        </div>
      </div>
      <div className="item-price">
        <div className="item-button">
          <div className="bg"></div>
          <div className="t">
            {price} ◈
          </div>
        </div>
      </div>
    </div>
  )
}

export function ShopScene() {
  return (
    <div className="shop-scene">
      <div className="shop-top">
        <div className="shop-background"></div>
        <div className="shop-cart">
          <div className="cart-title">SHOP</div>
          <div className="cart-list">
            <div className="cart-item"></div>
            <div className="cart-item"></div>
            <div className="cart-item"></div>

            <div className="cart-item"></div>
            <div className="cart-item"></div>
            <div className="cart-item"></div>

            <div className="cart-item"></div>
            <div className="cart-item"></div>
            <div className="cart-item"></div>
          </div>
          <div className="cart-total">50,000,000◈</div>
        </div>
      </div>
      <div className="shop-bottom">
        <div className="shop-list">
          {
            [
              ...shopItems,
              ...shopItems,
              ...shopItems
            ]
              .map((item, i) => <ShopItem key={i} {...item} />)}
        </div>
      </div>
    </div>
  );
}
