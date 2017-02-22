// CHANGED: Inject any types that are not important but needed
// to make the TypeScript compiler happy
declare var require: any;
declare var __filename: any;

// CHANGED: Inject Marko-specific type declarations
// MarkoOut will need to be fleshed out as it is what you get when you
// call the `MarkoTemplate.render()` method
declare type MarkoOut = any;
// MarkoTemplate is actually specific to this file since it uses the type
// declarations of `Input` for this component, to make sure you don't pass
// the wrong data to the `MarkoTemplate.render()` method
declare interface MarkoTemplate {
  render: (input: Input, cb: (err: any, out: MarkoOut) => void) => void;
  renderSync: (input: Input) => MarkoOut;
  _: any;
  Component: any;
  meta: any;
}

// CHANGED: Move any declaration in the Marko `static` tag at the top of the file
import { SearchResultsItem } from "../models/search-results-item";

interface Input {
  item: SearchResultsItem
}

interface State {
  purchased: boolean;
  item: SearchResultsItem;
}

// CHANGED: Use an actual ES6 class instead of the object created by the
// Marko `class` tag, so TypeScript understands what methods and properties
// are available on an instance of that class
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
}

// CHANGED: Need to convert to plain object for some reason,
// Marko can't use a class instance
var component_instance: any = new Component();
var component: any = {};
for (var property in component_instance) {
    component[property] = component_instance[property];
}

// CHANGED: Don't use `module.exports` but `export default` at the end
var marko_template: MarkoTemplate = require("marko/html").t(__filename),
    // CHANGED: Use component class instance declared earlier
    marko_component = component,
    marko_components = require("marko/components"),
    marko_registerComponent = marko_components.rc,
    marko_componentType = marko_registerComponent("/explore-marko-typescript$1.0.0/src/components/search-results-item.marko", function() {
      return marko_template;
    }),
    marko_helpers = require("marko/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a,
    marko_escapeXmlAttr = marko_helpers.xa,
    marko_classAttr = marko_helpers.ca,
    marko_styleAttr = marko_helpers.sa;

// CHANGED: Annotate the `render` function with `Input` and `State` interface
// to help catch bugs like accessing a non-existant property of either objects
function render(input: Input, out: MarkoOut, __component: any, state: State) {
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
      marko_attr(
        "data-_onclick",
        // CHANGED: Instead of using a string (method name) to dispatch, use a callback
        // that gets passed the component instance (with annotated type), to help
        // catch bugs like calling a non-existant handler
        __component.d(function(c: Component, e: DocumentEvent) { return c.handleBuyButtonClick.call(c, e); }),
        false
      ) +
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

// CHANGED: Use `export default` instead of `module.exports`
export default marko_template;
