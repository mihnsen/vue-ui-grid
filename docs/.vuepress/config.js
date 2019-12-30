module.exports = {
  base: '/vue-ui-grid/',
  title: 'VGrid',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Github', link: 'https://github.com/mihnsen/vue-ui-grid' }
    ]
  },
  sidebar: [
    {
      title: 'Group 1',   // required
      path: '/guide/',      // optional, which should be a absolute path.
      collapsable: false, // optional, defaults to true
      sidebarDepth: 1,    // optional, defaults to 1
      children: [
        '/'
      ]
    },
    {
      title: 'Group 2',
      children: [ /* ... */ ]
    }
  ]
}
