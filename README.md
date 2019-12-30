# vue-ui-grid
Simple, fast, powerful grid package for vuejs

## Demo
https://mihnsen.github.io/vue-ui-grid/


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
  template(
    slot="column-action"
    slot-scope="{ entry }"
  )
    button(
      type="button",
    ) ADD

// Or list

List(
  :columns="listColumns",
  :data="listData",
  :per-page="10",
  :column-visible="true",
  :orderable="true",
  ref="list"
)
  template(
    slot="column-action"
    slot-scope="{ entry }"
  )
    button(
      type="button",
    ) ADD
    a(
      href="gooogle.com"
    ) Edit

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

#### Column Properties
```
{
  field: 'id',
  label: 'ID',
  filter: true,
  hidden: true,
  width: 3
}
```
| Option      | Required    | Default     | Description                    |
| ----------- | ----------- | ----------- | ------------------------------ |
| field       | Yes         |             | Title                          |
| label       | No          |             | Label of column                |
| type        | No          | String      | field type (text/number/date)  |
| filter      | No          | False       | Set column filter or not       |
| order       | No          | False       | Set column order or not        |
| hidden      | No          | False       | Set hidden column, can't see   |
| width       | No          | False       | Set width column, use for list |
| format      | No          |             | Format content: '<strong>{name}</strong>' |

#### Props
| Props          | Required    | Default     | Description                    |
| -------------- | ----------- | ----------- | ------------------------------ |
| columns        | Yes         | []          | Column config                  |
| data           | Yes         | []          | Data source                    |
| per-page       | No          | 10          | Number of items per page       |
| searchable     | No          | True        | Search data in header          |
| filterable     | No          | True        | Filter data in header          |
| column-visible | No          | False       | Custom show hide, order column |
| column-filterable | No       | False       | Filter column in side grid     |
| index          | No          | 0           | Initial page                   |
| status         | No          | True        | Grid status                    |
| pagination     | No          | True        | Paginate data                  |

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
