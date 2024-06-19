import React, { useContext, useEffect } from "react";
import classes from "./card.module.css";
import { Product } from "../utils/models";
import Button from "../utils/Button";
import { Context } from "../../context";

interface Props {
  product: Product;
}

function Card({ product }: Props) {
  const { cart, setCart } = useContext(Context);

  function addProduct(product: Product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }
  function increaseQuantity(product: Product) {
    setCart(
      cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(product: Product) {
    const updatedCart = cart.map(item =>
      item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);

    setCart(updatedCart);
  }

  // useEffect(() => {
  //   console.log(cart);
  // }, [cart]);
  const productInCart = cart.find(item => item.id === product.id);

  return (
    <div
      style={{
        background:
          window.Telegram.WebApp.colorScheme === "dark"
            ? "#57A6A1"
            : "#240750",
      }}
      className={classes.card}
    >
      {product.name}
      <img className={classes.img} src={product.imageUrl} alt="" />
      <span>{product.price}MDL</span>

      <div className={classes["card-footer"]}>
        {cart.map((item) => item.id).includes(product.id) ? 
          (<><Button onClick={() => increaseQuantity(product)} type={"increase"} text={"+"} />{productInCart?.quantity}<Button onClick={() => decreaseQuantity(product)} type={"decrease"} text={"-"} /></>):<Button onClick={() => addProduct(product)} type={"add"} text={"Adaugă"} />}
      </div>
    </div>
  );
}

export default Card;
