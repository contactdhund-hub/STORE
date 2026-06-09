export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: ProductColor;
}
