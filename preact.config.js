export default function(config, env, helpers) {
  /** you can change config here **/
  env.ASSETS = '/assets/'
  if (env.production) {
    config.output.publicPath = './'
  }

  config.module.loaders.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  })
}
