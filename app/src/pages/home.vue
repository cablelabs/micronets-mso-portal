<template>
  <Layout>
    <template v-for="(user, index) in users">
         <Users :user=user :index="index"/>
    </template>
    <template v-if="users.length == 0">
      <v-card>
        <v-card-title class="no-subnets">No Users found</v-card-title>
        <v-card-actions>
        </v-card-actions>
      </v-card>
    </template>
  </Layout>
</template>

<script>
  import Layout from '../components/Layout'
  import Users from '../components/Users'
  import { mapState, mapActions, mapMutations } from 'vuex'

  export default {
    components: { Layout, Users },
    name: 'home',
    computed: {
      ...mapState(['users'])
    },
    data: () => ({
      dialog: false,
      drawer: false,
      users: []
    }),
    methods: {
      ...mapMutations(['setUsers']),
      ...mapActions(['fetchUsers'])
    },
    mounted () {
      this.fetchUsers().then((data) => {
        console.log('\n\n  Users : ' + JSON.stringify(data))
        this.users = data.data
      })
    },
    created () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  .no-subnets {
    font-size: 20px;
    font-weight: bold;
    margin: 2% 40% 2% 40%
    padding-top: 5%;
  }
</style>
