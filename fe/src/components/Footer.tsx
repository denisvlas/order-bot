import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBellConcierge, faFire, faIceCream } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path:string) => location.pathname === path;
// console.log(location.pathname);

  return (
    <footer className={styles.footer}>
      <div
        className={isActive("/menu") ? styles.active : styles.pages}
        onClick={() => navigate("/menu")}
      >
        <FontAwesomeIcon icon={faIceCream} />
      </div>
      <div
        className={isActive("/popular") ? styles.active : styles.pages}
        onClick={() => navigate("/popular")}
      >
        <FontAwesomeIcon icon={faFire} />
      </div>
      <div
        className={isActive("/orders") ? styles.active : styles.pages}
        onClick={() => navigate("/orders")}
      >
        <FontAwesomeIcon icon={faBellConcierge} />
      </div>
    </footer>
  );
}

export default Footer;
