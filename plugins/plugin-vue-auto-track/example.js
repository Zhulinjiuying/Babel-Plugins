// config
const config = {
  lifeCycles: [
    {
      lifeCycleName: 'created',
      funcIdentifier: 'console',
      funcBody: 'console.log(query)'
    },
    {
      lifeCycleName: 'mounted',
      funcIdentifier: 'console',
      funcBody: 'console.log("mounted")'
    }
  ],
  fileList: [
    'home/index.vue',
    'mine/index.vue'
  ]
};

// babel.config.json
const json = {
  "plugins": [
    [
      "./plugin-vue-auto-track",
      config
    ]
  ]
}