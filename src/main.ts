import Vue from 'vue'
import App from './App.vue'
import TestVue from './TestVue.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(TestVue)
}).$mount('#app')
