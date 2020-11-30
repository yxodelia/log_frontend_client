const path = require('path');
const ResolverFactory = require('enhanced-resolve/lib/ResolverFactory');
const NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

const CACHED_DURATION = 60000;
const fileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), CACHED_DURATION);

const cssNextOption = process.env.BROWSER_FALLBACK
	? {
		browsers: ["> 5%", "last 8 versions"],
		features: {
			customProperties: {
				warnings: false,
				preserve: true,
				variables: {},
			},
		},
	}
	: {
		features: {
			customProperties: {
				warnings: false,
				preserve: true,
			},
		},
	};

const resolver = ResolverFactory.createResolver({
	alias: {
		'@styles': path.join(__dirname, '..', 'src/styles')
	},
	extensions: ['.css'],
	modules: ['src', 'node_modules'],
	useSyncFileSystemCalls: true,
	fileSystem
});

// MARK:
// postcss-import have problem of hot-reload
// so maybe use postcss after build
module.exports = {
	plugins: [
		require("postcss-cssnext")(cssNextOption),
		require('postcss-import')({
			resolve(id, basedir)
			{
				return resolver.resolveSync({}, basedir, id);
			}
		}),
		require('precss')(),
		// require('autoprefixer'),
		require('lost')(),
	],
	options: {
		// parser: 'sugarss',
	},
};
