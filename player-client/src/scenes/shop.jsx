import "./shop.scss";

const shopItems = [
  {
    image: '🧪',
    name: 'Potion',
    description: '+20HP',
    price: '200'
  }, {
    image: '🥔',
    name: 'Potato',
    description: '+10HP',
    price: 500
  },
  {
    image: '🎟️',
    name: 'Free Revive Ticket',
    description: 'Revives 1 Party Member',
    price: 2000
  }
]

const items = [...shopItems, ...shopItems, ...shopItems];

function ShopItem({ image, name, description, price }) {
  return (
    <div className="shop-item">
      <div className="item-image">{image}</div>
      <div className="item-name">{name}</div>
      <div className="item-description">{description}</div>
      <div className="item-price">{price}◈</div>
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
