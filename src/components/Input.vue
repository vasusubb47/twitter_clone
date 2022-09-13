<template>
    <div class="Input">

    </div>
</template>

<script lang="ts">
    import { Options, Vue } from 'vue-class-component';

    @Options({
        props: {

        }
    })

    export default class Input extends Vue {
        type !: String

    };

</script>
