# vue-ui-grid

## Installation
```
npm install vue-ui-grid
or
yarn add vue-ui-grid
```

## Usage
```
import VGrid from 'vue-ui-grid';

// Use it
Grid.vgrid-center(
  :columns="gridColumns",
  :data="gridData",
  :per-page="2",
  :column-filter="true",
)


// CSS
@import '~vue-ui-grid/src/assets/scss/index'
```

Setup your promise function as a promise like this.
```
export default {
  data() {
    return {
      gridColumns: [
        {
          field: 'name',
          lable: 'Actor'
        },
        {
          field: 'power',
          lable: 'Power'
        }
      ],
      gridData: [
        { name: 'Chuck Norris', power: Infinity },
        { name: 'Bruce Lee', power: 9000 },
        { name: 'Jackie Chan', power: 7000 },
        { name: 'Jet Li', power: 8000 }
      ]
    }
  }
}
```

## Development
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
