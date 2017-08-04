# Marko & TypeScript

Explore using [Marko](http://markojs.com/) template engine with [TypeScript](https://www.typescriptlang.org/) compiler.

**Status: Proof-of-concept**

## Quick start

Clone this repository and install dependencies:

```
npm install
```

Build the compiler with:

```
npm run build
```

Run tests with:

```
npm test
```

To build the sample project in the `example/` folder, make sure you've built the compiler, then run:

```
npm run build:example
```

Run it with:

```
npm run start:example
```

## Rationale

View engines that are "just JavaScript" like React can easily be type-checked (both TypeScript and Flow actually have out-of-the box support for React).

When working with templates though, we loose the benefit of type-checking as soon as we cross the boundary into the template file. In a type-checked project, this can make refactoring trickier, for example if we rename a property but forget to update the template.

On the other hand, templates have the advantage of compile-time optimizations (ex: ["Why is Marko fast?"](http://markojs.com/docs/why-is-marko-fast/)). Being able to have type-checked templates could be a big win. I don't think this has been done yet in the JavaScript community.

## Approach

The direction taken here is to use Marko to parse an HTML template and create an AST with the compile-time optimizations mentioned above. We then translate the Marko AST into a TypeScript AST (a small transform step on the Marko AST is necessary here), and finaly use TypeScript's code generation to produce a `.ts` file (instead of the `.js` file if we use Marko alone).

So the stages of compilation can be summarized by:

```
HTML template (.marko file)
  -> Marko AST
  -> Transformed Marko AST (TypeScript-ready)
  -> TypeScript AST
  -> TypeScript code (.ts file)
```

## Scope

At least for the time being, this project limits the scope to **server-side rendering**. This is mainly for personal usage reasons: React+TypeScript has been a good fit for Single-Page Apps (SPA), but lacks in performance when used for web sites that are mostly (or fully) server-side rendered. It also simplifies what needs to be supported (for example, no need to implement the [class](http://markojs.com/docs/components/#single-file-components) component tag).

Of course, theoretically, nothing stops this project from supporting both compilation outputs (server and client), which is one of differentiating factors of Marko compared to other template systems.

## Other languages

Type-checked templates are also present in other languages, for example:

- [Twirl templates](https://www.playframework.com/documentation/latest/ScalaTemplates) in the Play framework (Scala, Java)
- [Hamlet templates](https://www.yesodweb.com/book/shakespearean-templates) in the Yesod framework (Haskell)

## Example

Let's take a Marko HTML template:

```xml
$ var product = input.product;

<div class="product">
  <h2 class="product-title">${product.title}</h2>
  <if(product.image)>
    <img href=product.image alt=product.title>
  </if>
  <div>Price: <strong>${product.price}</strong></div>
</div>
```

If we run it through the Marko compiler we get:

```javascript
var marko_template = module.exports = require("marko/dist/html").t(__filename),
    marko_helpers = require("marko/dist/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a;

function render(input, out) {
  var data = input;
  var product = input.product;

  out.w("<div class=\"product\"><h2 class=\"product-title\">" +
    marko_escapeXml(product.title) +
    "</h2>");

  if (product.image) {
    out.w("<img" +
      marko_attr("href", product.title) +
      marko_attr("alt", product.title) +
      ">");
  }

  out.w("<div>Price: <strong>" +
    marko_escapeXml(product.price) +
    "</strong></div></div>");
}

marko_template._ = render;
```

We can already see here the compile-time optimizations made: merging static parts into a single string, concatenation strings, and writing to a stream.

Now let's add some type-checking. Say we have a `models/product.ts` file:

```typescript
export interface Product {
  id: string;
  title: string;
  image?: string;
  price: number;
}
```

We then declare in our template file what input we expect:

```xml
static {/**@ts
import { Product } from "../models/product";

interface Input {
  product: Product;
}
*/}

$ var product = input.product;

<div class="product">
  <h2 class="product-title">${product.title}</h2>
  <if(product.image)>
    <img href=product.image alt=product.title>
  </if>
  <div>Price: <strong>${product.price}</strong></div>
</div>

```

(Note: the `/**@ts */` comment block was a necessary work-around because Marko tries to parse the JS in a `static` tag, and will crash it it doesn't recognize the syntax.)

The compiler in this project will take this file and produce the following TypeScript code:

```typescript
/* tslint:disable */
import { Template, Out } from "marko";
import * as marko_runtime from "marko/dist/html";
import * as marko_helpers from "marko/dist/runtime/html/helpers";
    
import { Product } from "../models/product";
interface Input {
    product: Product;
}

var marko_template: Template<Input> = marko_runtime.t(__filename),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a;

function render(input: Input, out: Out): void {
  var data = input;
  var product = input.product;

  out.w("<div class=\"product\"><h2 class=\"product-title\">" +
    marko_escapeXml(product.title) +
    "</h2>");

  if (product.image) {
    out.w("<img" +
      marko_attr("href", product.title) +
      marko_attr("alt", product.title) +
      ">");
  }

  out.w("<div>Price: <strong>" +
    marko_escapeXml(product.price) +
    "</strong></div></div>");
}

marko_template._ = render;

export default marko_template;

```

Very similar to what we had in the plain JavaScript version, except now the `input` of our render function is annotated to contain the `Product` interface.

So, say we make a typo in the template file:

```xml
<div>Price: <strong>${product.prce}</strong></div>
```

When we try to compile we will immediately get feedback and be able to correct our mistake before users see all products with no price!

```
23     out.w("<div>Price: <strong>" + marko_escapeXml(product.prce) + "</strong></div></div>");
                                                              ~~~~
example/templates/product.marko.ts(23,60): error TS2551: Property 'prce' does not exist on type 'Product'. Did you mean 'price'?
```
