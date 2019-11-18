<template lang="pug">
.salekit-subscribers
  .container.py-4
    h3.mb-4 Subscribers list
    Grid(
      :columns="columns",
      :data="emails",
      )
      template(#column-action="{ entry }")
        button(@click="remove(entry.id)") Remove
</template>
<script>
import { Grid, List, Cards } from './vue-grid'

export default {
  name: 'Subscribers',
  components: {
    Grid
  },
  data() {
    return {
      columns: [
        {
          field: 'id',
          label: '#'
        },
        {
          field: 'email',
          label: 'Email',
          filter: true
        },
        {
          field: 'created_at',
          label: 'Subscribed at'
        },
        {
          field: 'action',
          label: 'Action'
        }
      ],
      emails: []
    }
  },
  created() {
    this.getEmails()
  },
  methods: {
    getEmails() {
      this.emails = [
        {
          id: 1,
          email: 'minht3@owengo.com',
          created_at: '2018-01-01'
        },
        {
          id: 2,
          email: 'minht2@owengo.com',
          created_at: '2018-01-01'
        },
        {
          id: 3,
          email: 'minht1@owengo.com',
          created_at: '2018-01-01'
        },
        {
          id: 4,
          email: 'minht@owengo.com',
          created_at: '2018-01-01'
        }
      ]
    },
    remove(id) {
      this.emails = this.emails.filter(item => item.id !== id)
    }
  }
}
</script>
