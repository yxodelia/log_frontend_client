const path = require('path')
const utils = require('./utils');
const resolve = utils.resolve;
const Dotenv = require('dotenv-webpack');
const { VueLoaderPlugin } = require('vue-loader');
const ESLintPlugin = require('eslint-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const DEV = process.env.NODE_ENV === 'development';

module.exports = {
	entry: {
		app: resolve('src/main.ts'),
	},
	output: {
		path: resolve('dist/'),
		filename: '[name].js',
		publicPath: DEV ? '/' : process.env.PUBLIC_URL || '',
	},
	target: 'web',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: [/node_modules/, /vue\/src/],
				loader: 'ts-loader',
				options: {
					appendTsSuffixTo: [/\.vue$/],
					transpileOnly: true,
					// ant-design-vue 按需加载
					// 因为 jest 的运行方式，需要在测试环境下设置 babel-plugin-import
					getCustomTransformers: () => ({
						before: [
							tsImportPluginFactory({
								libraryName: 'ant-design-vue',
								libraryDirectory: 'es',
								style: 'css',
							}),
						],
					}),
					compilerOptions: {
						module: 'es2015'
					}
				},
			},
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					resolve('src'),
					resolve('test'),
				],
			},
			{
				test: /\.less$/,
				use: utils.cssLoaders({
					sourceMap: true,
					usePostCSS: false,
				}).less,
			},
			{
				test: /\.(css)$/i,
				oneOf: [
					// this matches `<style module>`
					{
						resourceQuery: /module/,
						use: utils.cssLoaders({
							sourceMap: DEV,
							usePostCSS: true,
						}).postcss,
					},
					// this matches plain `<style>` or `<style scoped>`
					// issue: somehow, cross-env won't set NODE_ENV correctly
					// so we always use vue-style-loader and minicss together
					{
						use: ['vue-style-loader', MiniCssExtractPlugin.loader, 'css-loader'],
					},
				],
			},
			{
				test: /\.svg$/,
				loader: 'svg-sprite-loader',
				options: {
					symbolId: 'icon-[name]'
				}
			},
			{
				test: /\.(png|jpe?g|gif)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					name: 'static/img/[name].[hash:7].[ext]',
				},
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'static/media/[name].[hash:7].[ext]',
				},
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'static/fonts/[name].[hash:7].[ext]',
				},
			},
		]
	},
	resolve: {
		alias: {
			// this isn't technically needed, since the default `vue` entry for bundlers
			// is a simple `export * from '@vue/runtime-dom`. However having this
			// extra re-export somehow causes webpack to always invalidate the module
			// on the first HMR update and causes the page to reload.
			vue: '@vue/runtime-dom',
			'@': resolve('src'),
		},
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['.ts', 'd.ts', '.tsx', '.js', '.vue'],
	},
	plugins: [
		new VueLoaderPlugin(),

		// 抽取并 mini css 文件，注意它的 loader 应在 vue-loader 之后
		// 因为 extractcss 插件存在接口使用错误，所以使用这个插件
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash].css',
		}),

		new Dotenv({
			// path: utils.resolve(__dirname, `env/${process.env.NODE_ENV}.env`),
			path: path.resolve(__dirname, '..', `env/${process.env.NODE_ENV}.env`),
		}),

		new ESLintPlugin({
			files: '../src',
		}),
	]
}