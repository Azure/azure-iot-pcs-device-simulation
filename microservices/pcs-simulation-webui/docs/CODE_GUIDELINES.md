# Code Guidelines

This page discusses coding guidelines and best practices used in the UI.

###### Jump to section
- [HTML](#html)
- [CSS](#css)
- [JavaScript](#javascript)
- [ReactJS](#reactjs)

# HTML
[Back to top](#)
TBD

# CSS
[Back to top](#)
### Syntax
- All CSS selectors must be lowercase and follow the kebab casing pattern
  (words separated by dashes). e.g. `.selector-name` instead of `.selectorName`
- Every selector should be followed by a space before the `{`. e.g.
  `.selector {` instead of `.selector{`
- Class names should be as short and succint as possible while remaining
  descriptive. e.g. `.btn` is short but understandble. `.b` is not.
- If a declaration has multiple selectors, place each selector on a newline
```
/* Without newlines */
.selector, .selector-two {
  ...
}

/* With newlines */
.selector,
.selector-two {
  ...
}
```
- Use class names instead of generic element tags. e.g. `> .span-element`
  instead of `> span`
- In each property declaration, include a space after the `:`
- All property declarations end with a semi-colon. Even though the
  semi-colon is optional for the last property, not including it
  increases the chances for errors.
- Lowercase all hex values. e.g. `#fff` instead of `#FFF`
- Whenever possible, use shorthand hex values. e.g. `#fff` instead of
  `#ffffff`
- Omit units for zero values. e.g. `0` instead of `0px`
- Use quotes when specifying selector values, e.g.`input[type="text"]`
- The opening `{` for a rule should always be placed on the same line as the
  selector associated with the rule.
```
/* Incorrect */
.selector
{
  ...
}

/* Correct */
.selector {
  ...
}
```

### Shorthand notation
- Try to avoid using shorthand notation if you are not explicitly using all the
  properties. If you are using all the properties, use the shorthand. Be as
  specific as possible while remaining succinct.
```
/* Incorrect */
.selector {
  padding: 0 0 5px;
}

/* Correct */
.selector {
  padding-bottom: 5px;
}
```

### Single vs. Multiple Declarations
- If a rule has only one declaration, place the entire rule on a single line. For
  two or more declarations per rule, place each declaration on its own line.
- In a block with multiple property declarations, always place the `}` on a new line.
```
/* Single declaration */
.selector { paddng: 10px; }

/* Multiple declarations */
.different-selector {
  display: block;
  background-color: #385d99;
}
```

### SCSS
- Avoid unnecessary nesting. The goal is avoid redundancy.
```
/* Without nesting */
.component-container > .nav > .title { ... }
.component-container > .nav > .actions { ... }

/* With nesting */
.component-container > .nav {
  > .title { ... }
  > .actions { ... }
}
```
- Place a newline after each closing `}` and before each new rule.
```
/* Without newlines */
.selector {
  padding: 10px;
  color: red;
  .child {
    ...
  }
}

/* With newlines */
.selector {
  padding: 10px;
  color: red;

  .child {
    ...
  }

}

```

### Comments
- Comments are highly encouraged. Make sure your comments are descriptive
  and understandable rather than simple restatements of class names.
```
/* Bad comment */
/* Navigation header class */
.nav-header { ... }

/* Good comment */
/* Container element for .nav-title and .nav-actions */
.nav-header { ... }
```
- Comments should start with a capital letter and strive to be sentences.
- Every comment should start with a space between the comment syntax and
  the start of the comment text

# JavaScript
[Back to top](#)
### Syntax
- All variable function names should be camelCase
- Use single quotes `'` instead of double quotes `"` for strings. Double
  quotes can be used in situations where it makes sense to do, e.g. when
  the string contains a single quote and using double quotes prevents
  having to escape the single quote.
- Use `undefined`, not `null`

### Imports
- Imports in JS files should follow the order 1) JS Files 2) SVG 3) CSS with
  newlines between each section.
```
import ClassName from './className.js';

import MySvg from './mySvg.svg'

import './myCss.css';
```

### Comments
- Comments should start with a capital letter and strive to be sentences.
- Add [JSDoc](http://usejsdoc.org/) documentation to your classes and methods
  as much as is reasonable.
- Every comment should start with a space between the comment syntax and the
  start of the comment text

# ReactJS
[Back to top](#)
### Commenting
- ReactJS comments follow the same commenting guidelines as the JavaScript
  guidelines
- For each component, comment the accepted `props` for that component in the
  JSDoc for that component.
```
/**
 * A component that creates a label
 *
 * Props:
 *    text: The label text
 */
class Label extends Component {
    render() {
        <span className="label">{this.props.text}</span>
    }
}
```
