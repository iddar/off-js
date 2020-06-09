import typescript from 'rollup-plugin-typescript2'
import minify from 'rollup-plugin-babel-minify'

const getConfig = ({ output, isMinify, extract = false }) => {
  return {
    input: 'src/index.ts',
    output: {
      file: output,
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript(),
      ...(isMinify ? [
        minify({
          comments: false
        })
      ] : [])
    ]
  }
}

export default [
  getConfig({ output: 'lib/index.js' }),
  getConfig({ output: 'lib/index.mjs' }),
  getConfig({ output: 'lib/index.min.mjs', isMinify: true })
]
