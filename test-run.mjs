import postcss from 'postcss'
import plugin from './dist/index.js'

const css = `
.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
  border-radius: 8px;
}
`

const result = await postcss([plugin()]).process(css, { from: undefined })
console.log(result.css)