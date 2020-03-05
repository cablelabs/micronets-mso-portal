<template>
  <Layout>
    <template v-for="(user, index) in users">
         <Subscriber :user="user" :index="index"/>
    </template>
    <div class="add-btn">
      <v-btn
              color="green"
              dark
              small
              absolute
              right
              bottom
              fab
              @click="dialog = !dialog"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-toolbar
              color="grey"
              dark
      >
        <v-toolbar-title>Create Subscriber</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn flat icon color="red" @click.stop="close">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <form novalidate @submit.prevent="submit">
            <div :class="getValidationClass('id')">
              <v-text-field name="id" id="id" v-model="form.id" label="Subscriber ID" required :disabled="sending"/>
              <span class="hasError" v-if="!$v.form.id.required">The id is required</span>
            </div>
            <div :class="getValidationClass('ssid')">
              <v-text-field name="ssid" id="ssid" v-model="form.ssid" label="SSID" required :disabled="sending" />
              <span class="hasError" v-if="!$v.form.ssid.required">The SSID is required</span>
            </div>
            <div :class="getValidationClass('name')">
              <v-text-field name="name" id="name" v-model="form.name" label="Name" required :disabled="sending" />
              <span class="hasError" v-if="!$v.form.name.required">The name is required</span>
            </div>
            <div :class="getValidationClass('username')">
              <v-text-field name="username" id="username" v-model="form.username" label="User Name" required :disabled="sending" />
              <!--<span class="hasError" v-if="!$v.form.username.required">The username is required</span>-->
            </div>
            <div :class="getValidationClass('password')">
              <v-text-field name="password" id="password" v-model="form.password" label="Password" required :disabled="sending" />
              <!--<span class="hasError" v-if="!$v.form.password.required">The password is required</span>-->
            </div>
            <div :class="getValidationClass('gatewayId')">
              <v-text-field id="gatewayId" name="gatewayId" v-model="form.gatewayId" label="Gateway ID" required :disabled="sending" />
              <span class="hasError" v-if="!$v.form.gatewayId.required">The gatewayId is required</span>
            </div>
            <div :class="getValidationClass('registry')">
              <v-text-field name="registry" id="registry" v-model="form.registry" label="Registry" required :disabled="sending" />
              <!--<span class="hasError" v-if="!$v.form.registry.required">The registry is required</span>-->
            </div>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click.stop="submit" class="add-subscriber-btn">Add</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </Layout>
</template>

<script>
  import Layout from '../components/Layout'
  import Subscriber from '../components/SubscriberCard'
  import { mapState, mapActions, mapMutations } from 'vuex'
  import { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'
  import EventBus from './../event-bus'
 // import { mapFields } from 'vuex-map-fields'
  export default {
    mixins: [validationMixin],
    components: { Layout, Subscriber },
    name: 'Subscribers',
    computed: {
      ...mapState(['users'])
    },
    data: () => ({
      valid: false,
      sending: false,
      dialog: false,
      drawer: false,
      toggleDisable: true,
      users: [],
      form: {
        id: '',
        ssid: '',
        name: '',
        gatewayId: '',
        registry: '',
        username: '',
        password: ''
      }
    }),
    validations: {
      form: {
        id: {
          required
        },
        ssid: {
          required
        },
        name: {
          required
        },
        gatewayId: {
          required
        }
      }
    },

    methods: {
      ...mapMutations(['setUsers']),
      ...mapActions(['fetchUsers', 'upsertUsers']),
      getValidationClass (fieldName) {
        const field = this.$v.form[fieldName]
        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      clearForm () {
        this.$v.$reset()
        this.form.id = null
        this.form.ssid = null
        this.form.gatewayId = null
        this.form.name = null
        this.form.registry = null
        this.form.username = null
        this.form.password = null
      },
      submit () {
        this.$v.$touch()
        if (this.$v.$invalid) return
        // to form submit after this
        if (!this.$v.$invalid) {
          const method = 'POST'
          const upsertData = this.form
          this.toggleDisable = false
          this.upsertUsers({ method, upsertData }).then(() => {
            this.dialog = false
            this.clearForm()
            this.loadUsers()
          })
        }
      },
      close () {
        this.dialog = false
        this.clearForm()
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
  .add-btn {
    margin-top: 11%;
  }
  .close-btn {
    margin-left: 15%;
  }
  .hasError {
    color: red;
  }
</style>

<style lang="scss" scoped>
  .md-progress-bar {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
  @import "../../node_modules/vue-material/src/theme/engine";
  @import "../../node_modules/vue-material/dist/theme/all";
  @import "../../node_modules/vue-material/src/base/theme";
  @import "../../node_modules/vue-material/src/components/MdField/theme";
  .md-card {
    width: 820px;
    margin: 4px 80px 20px 80px;
    display: inline-block;
    vertical-align: top;
  }
</style>
