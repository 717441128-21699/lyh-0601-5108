export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/bookshelf/index',
    'pages/community/index',
    'pages/mine/index',
    'pages/book-detail/index',
    'pages/reader/index',
    'pages/booklist-detail/index',
    'pages/create-booklist/index',
    'pages/challenge/index',
    'pages/monthly-report/index',
    'pages/search/index',
    'pages/add-book/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '悦读',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F6F8FC',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#4A7BFD',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/bookshelf/index',
        text: '书架',
      },
      {
        pagePath: 'pages/community/index',
        text: '社区',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
})
