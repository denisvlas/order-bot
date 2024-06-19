import axios from "axios";

const localhost = "http://localhost:3000";
const axiosInstance = axios.create({
    baseURL: "https://b644-178-168-93-81.ngrok-free.app",
    headers: {
      "ngrok-skip-browser-warning": "any-value",
    },
  });
  
  export async function requestContact(id: string) {
    try {
      const response = await axiosInstance.post("/requestPhone",{chatId:id});
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
  export async function getProducts() {
    try {
      const response = await axiosInstance.get("/read/all");
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
  export async function getPopular() {
    try {
      const response = await axiosInstance.get("/popular");
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
  
  export async function submitOrder(cart:any, userId:string,username:string, totalPrice:number) {
    try {
      const response = await axiosInstance.post("/submitOrder", {
        cart: cart,
        userId: userId,
        username: username,
        totalPrice: totalPrice,
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }