<template>
  <Layout>
    <template>
    <template v-for="(user, index) in users">
         <Subscriber :user="user" :index="index"/>
    </template>
      <v-card-text style="height: 400px; position: relative">
      <v-btn
              color="green"
              dark
              small
              absolute
              bottom
              right
              fab
              @click="dialog = !dialog"
      >
        <v-icon>add</v-icon>
      </v-btn>
      </v-card-text>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-text>
            <div class="form pt-6">
              <div class="summary text-red" v-if="$v.form.$error">
                Form has errors
              </div>
            </div>
            <form @submit.prevent="submit">
              <div :class="{ 'hasError': $v.form.name.$error }">
              <v-text-field v-model="form.id" label="Subscriber ID" required />
              </div>
              <div :class="{ 'hasError': $v.form.name.$error }">
              <v-text-field v-model="form.ssid" label="SSID" required />
              </div>
              <div :class="{ 'hasError': $v.form.name.$error }">
              <v-text-field v-model="form.name" label="Name" required />
              </div>
              <div :class="{ 'hasError': $v.form.name.$error }">
              <v-text-field v-model="form.gatewayId" label="Gateway ID" required />
              </div>
              <div :class="{ 'hasError': $v.form.name.$error }">
              <v-text-field v-model="form.registry" label="Registry" required />
              </div>
            </form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click.stop="submit" class="add-subscriber-btn">Add</v-btn>
            <v-btn color="primary" @click.stop="close">Close</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </Layout>
</template>

<script>
  import Layout from '../components/Layout'
  import Subscriber from '../components/SubscriberCard'
  import { mapState, mapActions, mapMutations } from 'vuex'
  import { required, minLength } from 'vuelidate/lib/validators'
  import EventBus from './../event-bus'
 // import { mapFields } from 'vuex-map-fields'
  export default {
    components: { Layout, Subscriber },
    name: 'Subscribers',
    computed: {
      ...mapState(['users'])
    },
    data: () => ({
      valid: false,
      dialog: false,
      drawer: false,
      users: [],
      form: {
        id: '',
        ssid: '',
        name: '',
        gatewayId: '',
        registry: ''
      }
    }),

    validations: {
      form: {
        id: { required, min: minLength(5) },
        ssid: { required },
        name: { required },
        gatewayId: { required },
        registry: { required }
      }
    },

    methods: {
      ...mapMutations(['setUsers']),
      ...mapActions(['fetchUsers', 'upsertUsers']),
      submit () {
        this.$v.form.$touch()
        if (this.$v.form.$error) return
        // to form submit after this
        const method = 'POST'
        const upsertData = this.form
        this.upsertUsers({method, upsertData}).then(() => {
          this.dialog = false
          this.loadUsers()
        })
      },
      close () {
        this.dialog = false
      },
      loadUsers () {
        this.fetchUsers().then((data) => {
          this.users = data.data
        })
      }
    },
    mounted () {
      this.loadUsers()
      EventBus.$on('upsertUser', (payLoad) => {
        console.log('\n upsertUser Event caught with payload : ' + JSON.stringify(payLoad))
        this.loadUsers()
      })
      EventBus.$on('deleteUser', (payLoad) => {
        console.log('\n DeleteUser Event caught with payload : ' + JSON.stringify(payLoad))
        this.loadUsers()
      })
    },
    created () {
    }
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  .close-btn {
    background-color white!important
    margin-left 90%
  }
  .add-subnet-btn {
    margin-right: 10%;
  }
  .close-btn {
    margin-left: 15%;
  }
  .hasError label  {
    color: red;
  }
</style>
