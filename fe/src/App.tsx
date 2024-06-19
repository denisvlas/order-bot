import React, { useEffect, useState } from "react";
import Container from "./components/utils/Container";
import Menu from "./pages/Menu/Menu";
import Header from "./components/Header";
import { Context } from "./context";
import { CartItem, Product } from "./components/utils/models";
import "bootstrap-icons/font/bootstrap-icons.css";
import Footer from "./components/Footer";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Popular from "./pages/Popular/Popular";
import Orders from "./pages/Orders/Orders";

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

const tele = window.Telegram.WebApp;
const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => {
    // Șterge localStorage când componenta se montează
    localStorage.removeItem("products");

    const handleBeforeUnload = () => {
      localStorage.removeItem("products");
    };

    window.onbeforeunload = handleBeforeUnload;
    window.onunload = handleBeforeUnload;

    return () => {
      window.onbeforeunload = null;
      window.onunload = null;
    };
  }, []);

  const location = useLocation();
  const [header, setHeader] = useState<string>("Menu");
  // useEffect(() => {
  //   if (location.pathname === "/menu") {
  //     setHeader("MENU");
  //   } else if (location.pathname === "/popular") {
  //     setHeader("POPULAR");
  //   } else if (location.pathname === "/orders") {
  //     setHeader("ORDERS");
  //   }
  // }, [location.pathname]);


  const [tableId, setTableId] = useState<string | null>(null);

  useEffect(() => {
    if(location.pathname === "/menu"){
      setHeader("MENU");
    }else if(location.pathname === "/popular"){
      setHeader("POPULAR");
    }else if(location.pathname === "/orders"){
      setHeader("ORDERS");
    }

    // Extract tableId from URL
    const params = new URLSearchParams(location.search);
    const tableIdParam = params.get("tableId");
    if (tableIdParam) {
      setTableId(tableIdParam);
      console.log("Table-->>",tableIdParam);
      
    }
  }, [location.pathname, location.search]);

  

  return (
    <Context.Provider value={{ cart, setCart }}>
      <Container flex="column">
        <Header title={tableId?"table:"+tableId:"table: "+null} />
        <Routes>
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
        <Footer />
      </Container>
    </Context.Provider>
  );
};

export default App;
