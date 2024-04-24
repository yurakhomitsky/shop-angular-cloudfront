export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface Stock {
  id: string;
  productId: string;
  count: number;
}
