const path = require('path')
const fs = require('fs')

const { watch, src, dest } = require('gulp')
const posthtml = require('gulp-posthtml')
const rename = require('gulp-rename')

const { insertAt } = require('posthtml-insert-at')
const rollup = require('rollup')
const sass = require('sass')

const fancyLog = require('fancy-log')
const chalk = require('chalk')
const log = fancyLog

const config = {
  js: {
    entry: 'main.js'
  },
  css: {
    entry: 'style.scss'
  },
  form: {
    entry: 'form.html'
  }
}

function getInsertAtConfig ({ css, js }) {
  return {
    selector: 'form',
    behavior: 'inside',
    prepend: css ? `<style>${css}</style>` : '',
    append: js ? `<script cam-script type='text/form-script'>${js}</script>` : ''
  }
}

async function bundle (input) {
  const bundle = await rollup.rollup({ input })
  const { output } = await bundle.generate({})

  return output[0].code
}

async function build (filepath, done) {
  const folderpath = String.raw`${filepath}`
    .split('\\')
    .slice(0, -1)
    .join('/')

  const taskfolder = folderpath
    .split('/')
    .slice(-1)[0]

  const jspath = `${folderpath}/${config.js.entry}`
  const sasspath = `${folderpath}/${config.css.entry}`
  const hasJs = fs.existsSync(jspath)
  const hasCss = fs.existsSync(sasspath)

  const js = !hasJs
    ? null
    : await bundle(jspath)

  const css = !hasCss
    ? null
    : sass
      .renderSync({ file: sasspath })
      .css
      .toString()

  const plugins = [
    insertAt(getInsertAtConfig({ css, js }))
  ]

  return src(path.resolve(`${folderpath}/${config.form.entry}`))
    .pipe(posthtml(plugins, {}))
    .pipe(rename(`${taskfolder}.html`))
    .pipe(dest('dist/'))
    .on('end', () => log(chalk`{magenta ${taskfolder}} bundle '{cyan finished}'...`))
}

exports.watch = () =>
  watch('./src/forms/**/*.{html,js,scss}')
    .on('change', build)
