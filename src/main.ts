import { SearchResultsItem } from "./models/search-results-item";
import template from "./components/search-results-item.marko";

const item: SearchResultsItem = {
  id: 123,
  title: "TV",
  image: "https://cdn.example.com/images/tv",
  price: 1000
};

const out = template.renderSync({
  item: item
});

console.log(out.toString());
