import { Product } from "./models/product";
import template from "./templates/product.marko";

const product: Product = {
  id: "123",
  title: "TV",
  image: "https://cdn.example.com/images/tv",
  price: 1000
};

const out = template.renderToString({
  product: product
});

/* tslint:disable */
console.log(out + "\n");
/* tslint:enable */
