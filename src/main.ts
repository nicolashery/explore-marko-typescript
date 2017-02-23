import { SearchResultsItem } from "./models/search-results-item";
import template from "./components/search-results-item.marko";
import templateMultiFile from "./components/multi-file-item/index.marko";

const item: SearchResultsItem = {
  id: 123,
  title: "TV",
  image: "https://cdn.example.com/images/tv",
  price: 1000
};

let out: string;

out = template.renderToString({
  item: item
});
console.log(out);

out = templateMultiFile.renderToString({
  item: item
});
console.log(out);
