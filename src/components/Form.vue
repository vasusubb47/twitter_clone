<template>
    <div class="From">
        <h3 v-if="title">{{ title }}</h3>
    </div>
</template>

<script lang="ts">
    import { Options, Vue } from 'vue-class-component';

    @Options({
        props: {
            title : String,
        }
    })

    export default class From extends Vue {
        title !: string;
    };
</script>
