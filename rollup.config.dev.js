// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default [
	{
		input: 'src/index.ts',
		output: {
			file: 'build/js/index.min.js',
			format: 'iife'
		},
		plugins: [
			typescript(),
			babel({
				exclude: 'node_modules/**',
				babelrc: false,
				presets: ['es2015-rollup']
			}),
			uglify(),
			serve('build'),
			livereload('build')
		]
	}
];