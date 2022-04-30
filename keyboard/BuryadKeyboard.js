import Keyboard from "simple-keyboard";
import layout from "./layout";
import "simple-keyboard/build/css/index.css";

class BuryatKeyboard extends Keyboard {
  constructor (className, options = {}) {
    super(className, {
      ...options,
      ...layout
    });
  }
}

export default BuryatKeyboard;
