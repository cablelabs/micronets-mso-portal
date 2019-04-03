<template>
  <v-layout>
    <v-flex>
      <v-card class="space">
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            <v-flex xs12 md6>
            <v-card-title primary-title>
              <div>
                <h4 class="headline mb-0">{{this.user.name}}</h4>
                <h1 class="headline mb-0">{{this.user.ssid}}</h1>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn flat color="orange" @click.native.stop=showMicronets()>Show Micro-nets</v-btn>
            </v-card-actions>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import Layout from '../components/Layout'

  export default {
    name: 'Users',
    components: {Layout},
    data () {
      return {}
    },
    methods: {
      showMicronets () {
        let mmUrlHost = this.user.registry.split('://')[1].split(':')[0]
        let mmUrl = `http://${mmUrlHost}:8080`
        console.log('\n mmUrl : ' + JSON.stringify(mmUrl))
        window.location.href = `${mmUrl}/users/${this.user.id}/`
      }
    },
    props: {
      user: Object
    }
  }
</script>

<style scoped>
  .space {
    margin-bottom: 50px;
  }
</style>
