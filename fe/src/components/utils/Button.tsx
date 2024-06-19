import { ReactNode } from "react";
import classes from "./utils.module.css";

interface ButtonProps {
  background?: string;
  marginTop?: string;
  type?: "add" | "remove" | "increase" | "decrease";
  text?:string;
  onClick?:()=>void;

}

function Button({ type,text,onClick }: ButtonProps) {
    const theme=window.Telegram.WebApp.colorScheme;
    
  return( <button onClick={onClick} style={{background:type==="add"?"#344C64":"lightgreen",color:type==="add"?'white':"#344C64"}} className={classes.button}>{text}</button>);
}

export default Button;
