const { defineConfig } = require('@vue/cli-service')


module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  indexPath: 'app.html',
  devServer: {
    port: '9002',
  },

  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].template = './public/app.html'
      return args
    })
    config
      .plugin('define')
      .tap(args => {
        args[0] = {
          ...args[0],
          "process.env.API_ENV": JSON.stringify(process.env.API_ENV),
          // other stuff
        }
        return args
      })
    // config.module
    //   .rule('less')
    //   .test(/less/)
    //   .use('less-loader')
    //     .loader('less-loader')
    //   .end()
    // config.module
    //   .rule('style')
    //   .test(/style/)
    //   .use('vue-style-loader')
    //   .loader('vue-style-loader')
    //   .end()
  },
})
