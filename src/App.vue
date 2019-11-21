<template>
  <div id="app">
    <router-view class="main"></router-view>
  </div>
</template>

<script>
  import "./common/stylus/index.styl";
  export default {
    name: "App",
    mounted() {
    },
    methods: {},
  };
</script>

<style lang="stylus">
  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding 50px 0
    background-color: #040b1c;
    background-image: url('./common/images/bg-top.png'), url('./common/images/bg-bottom.png');
    background-position: top center, top 1080px center;
    background-repeat: no-repeat, repeat-y;
  }
  .main {
    flex: 1;
    box-sizing: border-box;
    margin: 0 auto;
    width 100%
    min-width 1224px
    .pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow: hidden;
      line-height: 1.5;
      span {
        color #666666;
      }
      
      .string {
        color: #666666;
      }
      
      .number {
        color: #666666;
      }
      
      .boolean {
        color: #666666;
      }
      
      .null {
        color: #666666;
      }
      
      .key {
        color: #666666;
      }
    }
  }
</style>

