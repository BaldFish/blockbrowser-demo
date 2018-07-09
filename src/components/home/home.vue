<template>
  <div class="home_wrap">
    <div class="home">
      <div class="browser_log">
        <img src="./images/logo.png" alt="车链" @click="turnHome">
      </div>
      <div class="search_box">
        <div class="search_select_box" @mouseleave="leaveHide">
          <div @click="showType($event)" :class="{ search_select:!togglebg,showdown:togglebg,}">{{searchType}}</div>
          <div style="height: 3px;width: 176px"></div>
          <ul ref="select" :class="{search_type:!togglebg,showv:togglebg,}" @mouseleave="leaveHide">
            <li @click="changType($event)">区块高度</li>
            <li @click="changType($event)">区块哈希</li>
          </ul>
        </div>
        <input class="search_ipt" type="text" placeholder="请输入您要查找的内容" v-model.trim="search_content">
        <button class="btn" @click.prevent="search"></button>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
  import formatDate from "@/common/js/formatDate.js";
  import {baseURL,baseContract,baseABI} from '@/common/js/public.js';
  const reqURL = `${baseURL}`;
  //实例化web3对象
  var Web3 = require("web3");
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(reqURL));
  export default {
    name: "home",
    data() {
      return {
        togglebg: false,
        searchType: "区块高度",
        search_content: "",
        searchTime: "",
        searchBlock: {},
        searchBlockjp: {},
        blockData:{}
      };
    },
    methods: {
      //跳转主页
      turnHome(){
        window.location.href="/"
      },
      //点击切换显示隐藏下拉列表和更换背景
      showType(event) {
        this.togglebg = !this.togglebg;
      },
      //离开元素隐藏下拉列表
      leaveHide() {
        this.togglebg = false;
      },
      //更改搜索类型，并隐藏下拉列表
      changType(event) {
        this.searchType = event.target.innerText;
        this.togglebg = false;
        this.search_content=""
      },
      //获取查询时间
      getSearchTime() {
        return formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
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
      clearSearch() {
        this.search_content=""
      },
      search() {
        if (this.search_content === "") {
          return
        } else if (this.searchType === "区块高度") {//按区块高度或者区块哈希查询区块信息
          this.searchTime = this.getSearchTime();
          this.searchBlock = web3.eth.getBlock(this.search_content);
          if (this.searchBlock === null) {
            this.searchBlock = "";
            this.searchBlockjp = "您输入的区块高度有误!!!"
          } else {
            this.searchBlock.timestamp = formatDate(
              new Date(this.searchBlock.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.searchBlockjp = this.syntaxHighlight(this.searchBlock);
          }
        } else if (this.searchType === "区块哈希") {
          this.searchTime = this.getSearchTime();
          this.searchBlock = web3.eth.getBlock(this.search_content);
          if (this.searchBlock === null) {
            this.searchBlock = "";
            this.searchBlockjp = "您输入的区块哈希有误!!!";
          } else {
            this.searchBlock.timestamp = formatDate(
              new Date(this.searchBlock.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.searchBlockjp = this.syntaxHighlight(this.searchBlock);
          }
        }
        this.blockData.searchTime=this.searchTime;
        this.blockData.searchBlock=this.searchBlock;
        this.blockData.searchBlockjp=this.searchBlockjp;
        this.getBlockData();
        this.getSearchInput();
        this.clearSearch();
        window.location.href="#/blockDetails"
      },
      getBlockData(){
        this.$store.commit("changeBlockData",this.blockData);
      },
      getSearchInput(){
        this.$store.commit("changeSearchInput",this.search_content);
      },
    },
    components: {}
  };
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.home_wrap{
  .home{
    width: 1224px;
    margin: 0 auto;
    .browser_log {
      text-align: center;
      img{
        cursor pointer
      }
    }
    .search_box {
      box-sizing: border-box;
      text-align: center;
      padding-top: 40px;
      padding-bottom: 40px;
      font-size: 0;
      position: relative;
      .search_select_box, .search_ipt, .btn {
        outline: none;
        border: none;
        box-sizing: border-box;
        display: inline-block;
        height: 50px;
        line-height: 50px;
        background-color: #ffffff;
        box-shadow: 0px 3px 14px 1px rgba(255, 255, 255, 0.39);
        vertical-align: top;
        color: #222222;
        margin: 0 4px;
      }
    
      .search_select_box {
        border-radius: 25px 0px 0px 0px;
        .search_select {
          margin: 0px;
          width: 126px;
          font-size: 18px;
          line-height: 50px;
          text-align: left;
          padding-left: 50px;
          box-shadow: 0px 3px 14px 1px rgba(255, 255, 255, 0.39);
          border-radius: 25px 0px 0px 0px;
          cursor: pointer;
          background-image: url('./images/up.png');
          background-position: top 17px right 15px;
          background-repeat: no-repeat;
        }
        .showdown {
          margin: 0;
          width: 126px;
          font-size: 18px;
          line-height: 50px;
          text-align: left;
          padding-left: 50px;
          box-shadow: 0px 3px 14px 1px rgba(255, 255, 255, 0.39);
          border-radius: 25px 0px 0px 0px;
          cursor: pointer;
          background-image: url('./images/down.png');
          background-position: top 17px right 15px;
          background-repeat: no-repeat;
        }
        .search_type {
          position: absolute;
          top: 93px;
          left: 0;
          box-sizing: border-box;
          width: 176px;
          line-height: 24px;
          background-color: #ffffff;
          border-radius: 0px 0px 25px 0px;
          font-size: 14px;
          text-align: left;
          padding-top: 10px;
          padding-bottom: 10px;
          margin-left: 169px;
          color: #222222;
          visibility: hidden
          li {
            cursor: pointer;
            padding-left: 50px;
          }
        
          li:hover {
            color: #008ffe;
          }
        }
        .showv {
          position: absolute;
          top: 93px;
          left: 0;
          box-sizing: border-box;
          width: 176px;
          line-height: 24px;
          background-color: #ffffff;
          border-radius: 0px 0px 25px 0px;
          font-size: 14px;
          text-align: left;
          padding-top: 10px;
          padding-bottom: 10px;
        
          margin-left: 169px;
          color: #222222;
          visibility: visible
          li {
            cursor: pointer;
            padding-left: 50px;
          }
        
          li:hover {
            color: #008ffe;
          }
        }
      }
    
      .search_ipt {
        width: 604px;
        line-height: 50px;
        padding-left: 15px;
        padding-right: 15px;
        font-size: 14px;
      }
    
      .btn {
        width: 90px;
        border-radius: 0px 0px 25px 0px;
        cursor: pointer;
        background-image: url('./images/search.png');
        background-position: top 12px left 26px;
        background-repeat: no-repeat;
      }
    }
    
  }
}
</style>
