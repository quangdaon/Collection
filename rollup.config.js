// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default [
	{
		input: 'src/collection.ts',
		output: {
			file: 'dist/collection.min.js',
			name: 'Collection',
			format: 'umd'
		},
		plugins: [
			typescript(),
			babel({
				exclude: 'node_modules/**',
				babelrc: false,
				presets: ['es2015-rollup']
			}),
			uglify()
		]
	},
	{
		input: 'src/collection.ts',
		output: {
			file: 'dist/collection.js',
			name: 'Collection',
			format: 'umd'
		},
		plugins: [
			typescript({
				exclude: ['src/index.ts'],
				tsconfigOverride: {
					compilerOptions: {
						declaration: true
					}
				}
			}),
			babel({
				exclude: 'node_modules/**',
				babelrc: false,
				presets: ['es2015-rollup']
			})
		]
	},
	{
		input: 'src/collection.ts',
		output: {
			file: 'dist/collection.es6',
			format: 'es'
		},
		plugins: [
			typescript()
		]
	}
];