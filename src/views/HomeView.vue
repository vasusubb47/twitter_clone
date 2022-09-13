<template>
  <div class="home">
    <Form title="Welcome" />
    <HelloWorld msg="Hello" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld from "@/components/HelloWorld.vue";
import Form from "@/components/Form.vue";

@Options({
  components: {
    HelloWorld,
    Form
  },
})
export default class HomeView extends Vue {}
</script>
