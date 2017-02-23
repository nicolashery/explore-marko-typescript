import { SearchResultsItem } from "../../models/search-results-item";

export interface Input {
  item: SearchResultsItem
}

export interface State {
  purchased: boolean;
  item: SearchResultsItem;
}

export default class Component {
  state: State;

  constructor(input: Input) {
    this.state = {
      purchased: false,
      item: input.item
    };
  }

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
