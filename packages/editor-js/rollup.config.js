const babel = require('@rollup/plugin-babel')
const resolve = require('@rollup/plugin-node-resolve')
const commonJS = require('@rollup/plugin-commonjs')
const dts = require('rollup-plugin-dts')
const typescript = require('rollup-plugin-typescript2')
const json = require('@rollup/plugin-json')
const pkg = require('./package.json')
const image = require('@rollup/plugin-image')
const nodePolyfills = require('rollup-plugin-polyfill-node')

const prodMode = process.env.NODE_ENV === 'production'
const ts = require('rollup-plugin-ts')
const path = require('path')
const postcss = require('rollup-plugin-postcss')
const autoprefixer = require('autoprefixer')

const optimizeLib = prodMode
  ? [require('rollup-plugin-terser').terser()]
  : []

module.exports = [
  {
    input: pkg.source,
    output: [
      {
        name: 'Editor',
        file: pkg.main,
        format: 'cjs',
        sourcemap: prodMode ? false : 'inline',
        inlineDynamicImports: true,
      },
    ],
    onwarn: (warning, warn) => {
      // ignore CIRCULAR_DEPENDENCY warning for node_modules
      if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) {
        return
      }
      warn(warning)
    },
    plugins: [
      // visualizer({
      //   emitFile: true,
      //   file: 'stats.html',
      //   gzipSize: true,
      // }),
      postcss({
        extract: path.resolve('dist/lib-editor-js.css'),
        minimize: prodMode,
        plugins:[autoprefixer],
        extensions: ['.css', '.scss']
      }),
      image(),
      resolve.nodeResolve({
        browser: true,
      }),
      commonJS(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        extensions: ['.js,.jsx,.tsx,.tsx, .css, .svg'],
        exclude: ['node_modules/**'],
      }),
      nodePolyfills(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rollupCommonJSResolveHack: false,
        clean: true,
      }),
      require('rollup-plugin-replace')({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      //Mode production
      ...optimizeLib,
    ],
  },
  {
    input: pkg.source,
    plugins: [dts.default()],
    external: [/\.scss$/],
    output: {
      file: pkg.typings,
      format: 'esm',
    },
  },
  {
    input: 'src/utils/parsers/index.ts',
    plugins: [ts(), commonJS()],
    output: [
      {
        file: 'dist/src/utils/parsers/index.js',
        format: 'cjs',
      },
    ]
  },
  {
    input: 'src/utils/countCharacter.ts',
    plugins: [ts(), commonJS()],
    output: [
      {
        file: 'dist/src/utils/countCharacter.js',
        format: 'cjs',
      },
    ],
  },
  {
    input: 'src/plugins/alignment-tool/index.ts',
    plugins: [ts()],
    output: [
      {
        file: 'dist/src/plugins/alignment-tool/index.js',
        format: 'cjs',
      },
    ]
  },
  {
    input: 'src/plugins/image-tool/index.ts',
    plugins: [ts()],
    output: [
      {
        file: 'dist/src/plugins/image-tool/index.js',
        format: 'cjs',
      },
    ]
  },
]
