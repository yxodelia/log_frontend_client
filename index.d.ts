import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'

declare module '*.vue' {
  const Comp: any
  export default Comp
}

// vuex.d.ts
declare module '@vue/runtime-core' {
  // declare your own store states
  interface State
  {
    [params: string]: any;
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties
  {
    $store: Store<State>
  }
}
