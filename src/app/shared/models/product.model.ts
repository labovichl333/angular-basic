export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  stock: number;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}
