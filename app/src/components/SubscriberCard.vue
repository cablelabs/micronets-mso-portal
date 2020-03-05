<template>
  <v-layout>
    <v-flex>
        <v-container grid-list-xs>
          <v-layout v-bind="binding">
            <v-flex>
                <md-card class="md-secondary" md-theme="orange-card">
                    <md-toolbar class="md-accent" md-elevation="1">
                        <h3 class="md-title" style="flex: 1">Subscriber</h3>
                        <md-button class="md-fab md-plain" @click="updateUser">
                            <md-icon>edit</md-icon>
                        </md-button>
                        <md-button class="md-fab md-plain" @click="dialog = true">
                            <md-icon>delete</md-icon>
                        </md-button>
                    </md-toolbar>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <md-card-content v-if="!editing">
                       <md-content>
                           <div class='some-page-wrapper'>
                               <div class='row'>
                                   <div class='column'>
                                       <div class='blue-column'>
                                           <h3>ID</h3>
                                       </div>
                                   </div>
                                   <div class='column'>
                                       <div class='green-column'>
                                           {{this.user.id}}
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </md-content>
                        <md-content>
                            <div class='some-page-wrapper'>
                                <div class='row'>
                                    <div class='column'>
                                        <div class='blue-column'>
                                            <h3>SSID</h3>
                                        </div>
                                    </div>
                                    <div class='column'>
                                        <div class='green-column'>
                                            {{this.user.ssid}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </md-content>
                        <md-content>
                            <div class='some-page-wrapper'>
                                <div class='row'>
                                    <div class='column'>
                                        <div class='blue-column'>
                                            <h3>NAME</h3>
                                        </div>
                                    </div>
                                    <div class='column'>
                                        <div class='green-column'>
                                            {{this.user.name}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </md-content>
                        <md-content>
                            <div class='some-page-wrapper'>
                                <div class='row'>
                                    <div class='column'>
                                        <div class='blue-column'>
                                            <h3>REGISTRY</h3>
                                        </div>
                                    </div>
                                    <div class='column'>
                                        <div class='green-column'>
                                            {{this.user.registry}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </md-content>
                        <md-content>
                            <div class='some-page-wrapper'>
                                <div class='row'>
                                    <div class='column'>
                                        <div class='blue-column'>
                                            <h3>GATEWAY</h3>
                                        </div>
                                    </div>
                                    <div class='column'>
                                        <div class='green-column'>
                                            {{this.user.gatewayId}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </md-content>
                    </md-card-content>
                    <div>
                        <form novalidate class="md-layout" @submit.prevent="validateSubscriber" v-if="editing">
                            <md-card class="md-layout-item md-size-300 md-small-size-100">
                                <md-card-header>
                                    <div class="md-title">Update Subscriber</div>
                                </md-card-header>

                                <md-card-content>
                                    <div class="md-layout md-gutter">
                                        <div class="md-layout-item md-size-300 md-small-size-100">
                                            <md-field :class="getValidationClass('id')">
                                                <label for="id">ID (Read Only)</label>
                                                <md-input name="id" id="id" autocomplete="id" v-model="form.id" :disabled="sending" readOnly />
                                                <span class="md-error" v-if="!$v.form.id.required">The id is required</span>
                                                <span class="md-error" v-else-if="!$v.form.id.minlength">Invalid ID</span>
                                            </md-field>
                                        </div>

                                        <div class="md-layout-item md-size-300 md-small-size-100">
                                            <md-field :class="getValidationClass('ssid')">
                                                <label for="ssid">SSID</label>
                                                <md-input name="ssid" id="ssid" autocomplete="ssid" v-model="form.ssid" :disabled="sending" />
                                                <span class="md-error" v-if="!$v.form.ssid.required">The SSID is required</span>
                                                <span class="md-error" v-else-if="!$v.form.ssid.minlength">Invalid SSID</span>
                                            </md-field>
                                        </div>
                                    </div>

                                    <div class="md-layout md-gutter">
                                        <div class="md-layout-item md-size-300 md-small-size-100">
                                            <md-field :class="getValidationClass('name')">
                                                <label for="name">Name</label>
                                                <md-input name="name" id="name" v-model="form.name" md-dense :disabled="sending" />
                                                <span class="md-error">The name is required</span>
                                            </md-field>
                                        </div>

                                        <div class="md-layout-item md-size-300 md-small-size-100">
                                            <md-field :class="getValidationClass('gatewayId')">
                                                <label for="gatewayId">Gateway ID</label>
                                                <md-input  id="gatewayId" name="gatewayId" autocomplete="gatewayId" v-model="form.gatewayId" :disabled="sending" />
                                                <span class="md-error" v-if="!$v.form.gatewayId.required">The gatewayId is required</span>
                                                <span class="md-error" v-else-if="!$v.form.gatewayId.maxlength">Invalid gatewayId</span>
                                            </md-field>
                                        </div>
                                    </div>
                                    <div class="md-layout-item md-size-300 md-small-size-100">
                                    <md-field :class="getValidationClass('registry')">
                                        <label for="registry">Registry (Read Only)</label>
                                        <md-input type="registry" name="registry" id="registry" autocomplete="registry" v-model="form.registry" :disabled="sending" readOnly />
                                        <!--<span class="md-error" v-if="!$v.form.registry.required">The registry is required</span>-->
                                        <!--<span class="md-error" v-else-if="!$v.form.registry.email">Invalid registry</span>-->
                                    </md-field>
                                    </div>
                                </md-card-content>

                                <md-progress-bar md-mode="indeterminate" v-if="sending" />

                                <md-card-actions>
                                    <md-button type="submit" class="md-primary" :disabled="sending">Update</md-button>
                                    <md-button type="submit" class="md-primary" :disabled="sending" @click="editing = false">Cancel</md-button>
                                </md-card-actions>
                            </md-card>
                            <md-snackbar :md-active.sync="subscriberSaved">
                                <span>The subscriber {{ lastSubscriber }} was saved with success!</span>
                                <md-button class="md-primary" @click="subscriberSaved = false">Close</md-button>
                            </md-snackbar>
                        </form>
                    </div>
                </md-card>
            </v-flex>
          </v-layout>
        </v-container>
        <div class="text-xs-center">
            <v-dialog
                    v-model="dialog"
                    width="500"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                            color="red lighten-2"
                            dark
                            v-on="on"
                    >
                        Click Me
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title
                            class="headline grey lighten-2"
                            primary-title
                    >
                        Delete Subscriber
                    </v-card-title>

                    <v-card-text>
                       Are you sure you want to delete the subscriber
                    </v-card-text>
                    <!--<v-divider></v-divider>-->
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                                color="primary"
                                flat
                                @click="deleteUser"
                        >
                            Yes
                        </v-btn>
                        <v-btn
                                color="primary"
                                flat
                                @click="dialog = false"
                        >
                            No
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </v-flex>
  </v-layout>
</template>



<script>
  import Layout from '../components/Layout'
  import { validationMixin } from 'vuelidate'
  import { mapActions, mapMutations } from 'vuex'
  import EventBus from './../event-bus'
  import {
    required,
    minLength
  } from 'vuelidate/lib/validators'

  export default {
    name: 'Users',
    mixins: [validationMixin],
    components: {Layout},
    data: () => ({
      editing: false,
      delete: false,
      dialog: false,
      form: {
        id: '',
        ssid: '',
        name: '',
        gatewayId: '',
        registry: ''
      },
      subscriberSaved: false,
      sending: false,
      lastSubscriber: null
    }),
    validations: {
      form: {
        id: {
          required,
          minLength: minLength(3)
        },
        ssid: {
          required,
          minLength: minLength(3)
        },
        name: {
          required,
          maxLength: minLength(3)
        },
        gatewayId: {
          required
        }
      }
    },
    methods: {
      ...mapMutations(['setUsers', 'setUser']),
      ...mapActions(['fetchUsers', 'upsertUsers', 'deleteUsers']),
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
      },
      updateUser () {
        this.editing = true
        this.form.id = this.user.id
        this.form.ssid = this.user.ssid
        this.form.gatewayId = this.user.gatewayId
        this.form.name = this.user.name
        this.form.registry = this.user.registry
      },
      deleteUser () {
        this.delete = true
        this.dialog = true
        this.deleteUsers(this.user.id).then((data) => {
          EventBus.$emit('deleteUser', data)
        })
      },
      saveUser () {
        this.sending = true
        // Instead of this timeout, here you can call your API
        const method = 'PATCH'
        const upsertData = this.form
        this.upsertUsers({method, upsertData}).then((data) => {
          this.lastSubscriber = `${this.form.id}`
          this.subscriberSaved = true
          this.sending = false
          this.clearForm()
          this.editing = false
          EventBus.$emit('upsertUser', data)
        })
      },
      validateSubscriber () {
        this.$v.$touch()
        if (!this.$v.$invalid) {
          this.saveUser()
        }
      }
    },
    mounted () {
      // this.fetchUsers(this.user.id).then((data) => {
      //   this.user = data
      // })
    },
    created () { },
    computed: {
      binding () {
        const binding = {}
        if (this.$vuetify.breakpoint.mdAndUp) binding.column = true
        return binding
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
  .some-page-wrapper {
      margin: 15px;
      background-color: red;
  }

  .row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
  }

  .column {
      display: flex;
      flex-direction: column;
      flex-basis: 100%;
      flex: 1;
  }

  .blue-column {
      background-color: white;
      height: 30px;
  }

  .green-column {
      height: 30px;
      background-color: white;
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
    @include md-register-theme("orange-card", (
            primary: md-get-palette-color(grey, 600),
            secondary:md-get-palette-color(white, 100)
    ));
    @import "../../node_modules/vue-material/src/base/theme";
    @import "../../node_modules/vue-material/src/components/MdCard/theme";
    @import "../../node_modules/vue-material/src/components/MdField/theme";
    @import "../../node_modules/vue-material/src/components/MdProgress/theme";
    @import "../../node_modules/vue-material/src/components/MdToolbar/theme";
    .md-card {
        width: 820px;
        margin: 4px 80px 20px 80px;
        display: inline-block;
        vertical-align: top;
    }
</style>