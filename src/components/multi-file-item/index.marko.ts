// CHANGED: Inject any types that are not important but needed
// to make the TypeScript compiler happy
declare var require: any;
declare var __filename: any;

// CHANGED: Import component `Input` and `State` interface in addition to
// the `Component` class itself
import Component, { Input, State } from "./component";

// CHANGED: Inject Marko-specific type declarations
// The `any` will need to be replaced by actual interfaces
declare type RenderResult = any;
// `Template` is actually specific to this file since it uses the type
// declarations of `Input` and for this component, to make sure you don't pass
// the wrong data to the `Template.render()` method
declare interface Template {
  render(input: Input, cb: (err: any, out: RenderResult) => void): void;
  renderToString(input: Input): string;
  _: any;
  Component: Component;
  meta: any;
}

// CHANGED: Don't use `module.exports` but `export default` at the end
// and annotate with `Template` interface
var marko_template: Template = require("marko/html").t(__filename),
    marko_components = require("marko/components"),
    marko_registerComponent = marko_components.rc,
    marko_componentType = marko_registerComponent("/explore-marko-typescript$1.0.0/src/components/multi-file-item/index.marko", function() {
      // CHANGED: Don't use `module.exports`
      return marko_template;
    }),
    // CHANGED: Use `Component` class declared above
    marko_component = Component,
    marko_helpers = require("marko/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a,
    marko_escapeXmlAttr = marko_helpers.xa,
    marko_classAttr = marko_helpers.ca,
    marko_styleAttr = marko_helpers.sa;

// CHANGED: Annotate the `render` function with `Input` and `State` interface
// to help catch bugs like accessing a non-existant property of either objects
function render(input: Input, out: any, __component: any, state: State) {
  var data = input;

  var item=state.item;

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
          path: "./component"
        },
      {
          type: "require",
          path: "marko/components"
        }
    ]
  };

// CHANGED: Use `export default` instead of `module.exports`
export default marko_template;
