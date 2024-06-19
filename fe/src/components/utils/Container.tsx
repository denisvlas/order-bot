import { ReactNode } from "react";
import classes from "./utils.module.css";

interface ContainerProps {
  children: ReactNode;
  background?: string;
  marginTop?: string;
  flex: any;
  gap?: string;
}

function Container({ children, background, marginTop, flex,gap }: ContainerProps) {
  // console.log(flex);

  return (
    <div
      style={{
        background: background || "",
        marginTop: marginTop || "",
        flexDirection: flex || "column",
        flexWrap: "wrap",
      }}
      className={classes.container}
    >
      {children}
    </div>
  );
}

export default Container;
