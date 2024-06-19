import { createContext } from "react";
import { CartItem } from "./components/utils/models";
export const Context = createContext<{
   setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
   cart: CartItem[]
}>({setCart:()=>{},cart:[]}); 



import {useContext } from "react";

const TableContext = createContext(null);

export const useTable = () => {
  return useContext(TableContext);
};