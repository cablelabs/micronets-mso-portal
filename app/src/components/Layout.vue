<template>
  <v-app light>
    <v-navigation-drawer
      fixed
      v-model="drawer"
      disable-resize-watcher
      left
      app
    >
      <v-list class="pa-1">
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title>Menu</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-list class="pt-0" dense>
        <v-divider></v-divider>

        <v-list-tile
                v-for="item in items"
                :key="item.title"
                @click="showPage(item.url)"
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="#3A3A3A" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <header class="text-xs-center">
        <router-link to="/"><img class="logo" src="../assets/cablelabs-logo.png"/></router-link>
      </header>
      <v-toolbar-title class="toolbar-title">MSO Portal Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <!--<v-btn flat icon @click.stop="drawer = !drawer">-->
        <!--<img class="logo" src="../assets/console-logo.png"/>-->
      <!--</v-btn>-->
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <slot/>
      </v-container>
    </v-content>
    <v-footer app>
      <span class="black--text">&copy; 2018 CableLabs.</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  export default {
    name: 'Layout',
    computed: {
      ...mapState(['users'])
    },
    data: () => ({
      drawer: false,
      offsetTop: 0,
      items: [
        { title: 'Home', icon: 'dashboard', url: `http://127.0.0.1:8081/#/` },
        { title: 'Subscribers', icon: 'recent_actors', url: `http://127.0.0.1:8081/#/subscribers` }
      ]
    }),
    methods: {
      ...mapActions(['fetchUsers']),
      showPage (url) {
        window.location.href = url
      }
    },
    created () {
      return this.fetchUsers()
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  .toolbar-title {
    font-size: 20px;
    font-family: "Roboto";
    margin-left: 30%
  }
  .message-content {
    font-family: "Roboto";
    font-size: 10px;
    font-weight: bold;
    margin-top: 5px;
    margin-bottom 10px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    display inline-block
  }
  .message-list {
    margin-left: 0px;
    margin-top: 3px
    text-align: left;
    width: 100%
  }
  .message-divider {
    margin-top: 5px;
  }
</style>
