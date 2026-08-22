import axiosInstance from "./axiosInstance";

export const fetchProducts = async () => {
    const {data} = await axiosInstance.get('/products');
    return data.data;
}

