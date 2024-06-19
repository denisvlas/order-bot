import React, { useContext, useEffect, useState } from "react";
import Container from "../../components/utils/Container";
import Card from "../../components/Card/Card";
import classes from "./Menu.module.css";
import utils from "../../components/utils/utils.module.css";
import { getPopular, getProducts, submitOrder } from "../../api/requests";
import { Product } from "../../components/utils/models";
import { Context } from "../../context";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLocation } from "react-router-dom";

const tele = window.Telegram.WebApp;
function Menu() {
  const location = useLocation();

  // console.log(location.pathname);
  
  const getFunc=() =>
    location.pathname === "/menu"
      ? getProducts()
      : location.pathname === "/popular"
      ? getPopular()
      : ()=>{};

  const [data, setData] = useState<Product[]>([]);
  const { cart, setCart } = useContext(Context);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function getData() {
      setLoading(true);
      const localData = localStorage.getItem("products");
      if (localData) {
        setData(JSON.parse(localData));
        setLoading(false);
      } else {
        onLoading();
        const res = await getFunc();
        setData(res);
        localStorage.setItem("products", JSON.stringify(res));
        // setLoading(false);
      }
    }
    getData();
  }, []);

  function calculateTotal() {
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return total;
  }
  const [isClickedPrice, setIsClickedPrice] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const [showMessage, setShowMessage] = useState("");

  useEffect(() => {
    if (cart.length > 0) {
      setShowTotal(true);
    } else {
      setShowTotal(false);
    }
  }, [cart]);

  async function onSubmit() {
    setLoading(true);
    // const res = await submitOrder(
    //   cart.map((item) => ({ id: item.id, quantity: item.quantity,name:item.name,price:item.price })),
    //   tele.initDataUnsafe?.user?.id,
    //   tele.initDataUnsafe?.user?.username?tele.initDataUnsafe?.user?.username:"Anonim",
    //   calculateTotal()
    // );
    // console.log(res.data);
    onLoading("Comanda a fost plasată");
  }

  const requestPhoneNumber = async () => {
    if (tele && tele.requestContact) {
      tele.requestContact((result: any) => {
        if (result) {
          onSubmit();
        }
      });
    }
  };

  function onLoading(message?: string) {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
    message &&
      setTimeout(() => {
        setLoading(false);
        setShowMessage("Comanda a fost plasată");
      }, 3000);

    setTimeout(
      () => {
        setShowMessage("");
        setCart([]);
      },
      message ? 6000 : 3000
    );
  }
  return (
    <div className={classes["result-grid"]}>
      {loading && (
        <div className={utils["loader-container"]}>
          <div className={utils.loader}></div>
        </div>
      )}
      {showMessage && (
        <div className={utils["loader-container"]}>
          <div
            className={`${
              showMessage
                ? utils["message-visible"]
                : utils["message-invisible"]
            }`}
          >
            {showMessage}
          </div>
        </div>
      )}

      <div
        onClick={() => setIsClickedPrice(!isClickedPrice)}
        className={`${classes.total} ${
          showTotal ? classes["total-visible"] : classes["total-invisible"]
        }`}
      >
        {isClickedPrice && calculateTotal() >= 1000
          ? calculateTotal() / 1000 + "K"
          : calculateTotal()}{" "}
        MDL
      </div>
      {data.map((product) => (
        <Card key={product.id} product={product} />
      ))}
      {cart.length > 0 && (
        <div
          className={`${classes["pay-container"]} ${
            showTotal ? classes["total-visible"] : classes["total-invisible"]
          }`}
        >
          <div onClick={() => requestPhoneNumber()} className={classes.pay}>
            <span>Comandă</span> <i className="bi bi-credit-card"></i>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
