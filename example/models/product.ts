export interface Product {
  id: string;
  title: string;
  image?: string;
  price: number;
}

export function formatPrice(product: Product): string {
  return "$" + product.price.toFixed(2);
}
