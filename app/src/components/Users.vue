<template>
  <v-layout>
    <v-flex>
      <v-card class="space">
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            <v-flex xs12 md6>
            <v-card-title primary-title>
              <div>
                <h4 class="headline mb-0">{{this.subscriberName}}</h4>
                <h1 class="headline mb-0">{{this.ssId}}</h1>
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
        console.log('\n showMicronets this.mmUrl : ' + JSON.stringify(this.mmUrl))
        window.location.href = `${this.mmUrl}/${this.subscriberId}`
      }
    },
    props: {
      subscriberId: String,
      subscriberName: String,
      id: String,
      ssId: String,
      mmUrl: String
    }
  }
</script>

<style scoped>
  .space {
    margin-bottom: 50px;
  }
</style>
