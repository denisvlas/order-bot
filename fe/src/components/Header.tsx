import React from "react";
import Container from "./utils/Container";
import classes from "./styles.module.css";


function Header({title}:{title:string}) {
  return <div style={{color:window.Telegram.WebApp.colorScheme=="light"?"Black":"white"}} className={classes.header}>{title}</div>;
}

export default Header;
