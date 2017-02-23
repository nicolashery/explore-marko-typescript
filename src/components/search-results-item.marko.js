// Compiled using markoc@4.0.0-rc.20 - DO NOT EDIT
var marko_template = module.exports = require("marko/html").t(__filename),
    marko_component = {},
    marko_components = require("marko/components"),
    marko_registerComponent = marko_components.rc,
    marko_componentType = marko_registerComponent("/explore-marko-typescript$1.0.0/src/components/search-results-item.marko", function() {
      return module.exports;
    }),
    marko_helpers = require("marko/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a,
    marko_escapeXmlAttr = marko_helpers.xa,
    marko_classAttr = marko_helpers.ca,
    marko_styleAttr = marko_helpers.sa;

import { SearchResultsItem } from "../models/search-results-item";

interface Input {
  item: SearchResultsItem
}

interface State {
  purchased: boolean;
  item: SearchResultsItem;
}

class Component {
  state: State;

  onInput(input: Input) {
    this.state = {
      purchased: false,
      item: input.item
    };
  }

  handleBuyButtonClick() {
    this.state.purchased = true;
  }
};

function render(input, out, __component, state) {
  var data = input;

  var item=state.item

  out.w("<div" +
    marko_classAttr([
      "search-results-item"
    ]) +
    marko_styleAttr({
      backgroundColor: state.purchased ? "#f1c40f" : ""
    }) +
    marko_attr("id", __component.id) +
    "><h2>" +
    marko_escapeXml(item.title) +
    "</h2><div class=\"lvpic pic img left\"><div class=\"lvpicinner full-width picW\"><a href=\"/buy/" +
    marko_escapeXmlAttr(item.id) +
    "\" class=\"img imgWr2\"><img" +
    marko_attr("src", item.image) +
    marko_attr("alt", item.title) +
    "></a></div></div><span class=\"price\">" +
    marko_escapeXml(item.price) +
    "</span>");

  if (state.purchased) {
    out.w("<div class=\"purchased\">Purchased!</div>");
  } else {
    out.w("<button type=\"button\" class=\"buy-now\"" +
      marko_attr("data-_onclick", __component.d("handleBuyButtonClick"), false) +
      ">Buy now!</button>");
  }

  out.w("</div>");
}

marko_template._ = marko_components.r(render, {
    type: marko_componentType
  }, marko_component);

marko_template.Component = marko_components.c(marko_component, marko_template._);

marko_template.meta = {
    deps: [
      {
          type: "require",
          path: "./search-results-item.marko"
        },
      {
          type: "require",
          path: "marko/components"
        }
    ]
  };
