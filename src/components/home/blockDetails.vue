<template>
  <div class="blockDetails">
    <div class="block_info">
      <div class="block_info_th">
        <h3>区块信息</h3>
        <p>查询时间：{{blockData.searchTime}}</p>
        <div class="block_info_md">
          <span class="left fl" @click="clickPrevious($event)"></span>
          <ul class="middle_left">
            <li>时间戳：</li>
            <li>区块高度：</li>
            <li>区块哈希：</li>
            <li>上一区块：</li>
          </ul>
          <ul class="middle_right">
            <li>{{blockData.searchBlock.timestamp}}</li>
            <li>{{blockData.searchBlock.number}}</li>
            <li>{{blockData.searchBlock.hash}}</li>
            <li>{{blockData.searchBlock.parentHash}}</li>
          </ul>
          <span class="right fr" @click="clickNext($event)"></span>
        </div>
    
      </div>
      <div class="block_info_tb">
        <p class="pre" v-html="blockData.searchBlockjp"></p>
      </div>
    </div>
  </div>
</template>

<script>
  import {baseURL,baseContract,baseABI} from '@/common/js/public.js';
  const reqURL = `${baseURL}`;
  var Web3 = require("web3");
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(reqURL));
  import formatDate from "@/common/js/formatDate.js";
  export default {
    name: "blockDetails",
    data() {
      return {
        blockData:{}
      }
    },
    beforeMount() {
      this.fetchBlockData()
    },
    methods: {
      //获取查询时间
      getSearchTime() {
        return formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
      },
      //取出区块信息
      fetchBlockData(){
        this.blockData=JSON.parse(sessionStorage.getItem("blockData"))
      },
      //json数据格式化
      syntaxHighlight(json) {
        if (typeof json != "string") {
          json = JSON.stringify(json, undefined, 2);
        }
        json = json
          .replace(/&/g, "&")
          .replace(/</g, "<")
          .replace(/>/g, ">");
        return json.replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          function (match) {
            var cls = "number";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "key";
              } else {
                cls = "string";
              }
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return (
              '<span style="word-wrap:break-word;overflow:hidden;" class="' +
              cls +
              '">' +
              match +
              "</span>"
            );
          }
        );
      },
      //查看上一个区块信息
      clickPrevious() {
        var nowNumber = this.blockData.searchBlock.number;
        this.blockData.searchTime = this.getSearchTime();
        if (nowNumber - 1 >= 0) {
          var previousInfo = web3.eth.getBlock(nowNumber - 1);
          previousInfo.timestamp = formatDate(
            new Date(previousInfo.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          this.blockData.searchBlock = previousInfo;
          this.blockData.searchBlockjp = this.syntaxHighlight(this.blockData.searchBlock);
          this.getBlockData()
        } else {
          this.blockData.searchTime = this.getSearchTime();
          this.blockData.searchBlock = {"number": -1};
          this.blockData.searchBlockjp = "区块不存在!!!";
          this.getBlockData()
        }
      },
      //查看下一个区块信息
      clickNext() {
        var nowNumber = this.blockData.searchBlock.number;
        var lastNumber = web3.eth.blockNumber;
        this.blockData.searchTime = this.getSearchTime();
        if (nowNumber + 1 <= lastNumber) {
          var nextInfo = web3.eth.getBlock(nowNumber + 1);
          nextInfo.timestamp = formatDate(
            new Date(nextInfo.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          this.blockData.searchBlock = nextInfo;
          this.blockData.searchBlockjp = this.syntaxHighlight(this.blockData.searchBlock);
          this.getBlockData()
        } else {
          this.blockData.searchTime = this.getSearchTime();
          this.blockData.searchBlock = {"number": lastNumber + 1};
          this.blockData.searchBlockjp = "区块不存在!!!";
          this.getBlockData()
        }
      },
      getBlockData(){
        this.$store.commit("changeBlockData",this.blockData);
      },
    },
    watch: {
      searchInput:function () {
        this.fetchBlockData()
      }
    },
    computed: {
      searchInput:function () {
        return this.$store.state.searchInput
      }
    },
    components: {},
  }
</script>

<style scoped lang="stylus">
.blockDetails{
  .block_info {
    width 1200px
    margin 0 auto
    font-size 0
    padding-top: 50px;
    .block_info_th {
      margin-bottom 20px
      box-sizing border-box
      width 1200px
      height 184px
      background-color: #ffffff;
      border-radius: 10px;
      border: solid 1px #eeeeee;
      h3 {
        font-size: 16px;
        height: 36px;
        line-height: 36px;
        color: #ffffff;
        background-color: rgba(0, 143, 254, 0.77);
        border-radius: 10px 10px 0px 0px;
        background-image: url("./images/xinxi.png");
        background-position: left 10px center;
        background-repeat: no-repeat;
        padding-left 36px
      }
      p {
        font-size 14px
        color: #999999;
        padding-left 10px
        padding-top 8px
      }
      .block_info_md {
        font-size 0px
        color #666666
        padding 15px 10px
        
        .left, .middle_left, .middle_right, .right {
          display inline-block
          font-size 14px
        }
        .middle_left, .middle_right {
          line-height 24px
          height 24px
        }
        .middle_right {
          color #222222
          vertical-align top
          li {
            width 850px
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            height 24px
          }
        }
        .left, .right {
          margin 0 10px
          width 17px
          height 23px
          background-position: top center;
          background-repeat: no-repeat;
          position relative
          top 30px
          cursor pointer
        }
        .left {
          margin-right 20px
          background-image: url("./images/left.png");
        }
        .right {
          background-image: url("./images/right.png");
        }
      }
    }
    .block_info_tb {
      font-size 14px;
      color: #999999;
      width: 1200px;
      min-height 184px
      box-sizing border-box
      border: solid 1px #eeeeee;
      border-radius: 10px;
      background-color: #ffffff;
      padding 20px 25px;
    }
  }
}
</style>
