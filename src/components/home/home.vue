<template>
  <div class="home_wrap">
    <div class="home">
      <div class="browser_log">
        <img src="./images/logo.png" alt="车链">
      </div>
      <div class="search_box">
        <div class="search_select_box" @mouseleave="leaveHid">
          <div @click="showType($event)" :class="{ search_select:!togglebg,showdown:togglebg,}">{{searchType}}</div>
          <div style="height: 3px;width: 176px"></div>
          <ul ref="select" :class="{search_type:!togglebg,showv:togglebg,}" @mouseleave="leaveHid">
            <li @click="changType($event)">区块高度</li>
            <li @click="changType($event)">区块哈希</li>
          </ul>
        </div>
        <input class="search_ipt" type="text" placeholder="请输入您要查找的内容" v-model.trim="search_content">
        <button class="btn" @click.prevent="search"></button>
      </div>
      <router-view></router-view>
      <div class="container_box">
        <div class="count_box">
          <ul class="count">
            <li>
              <span>当前区块高度：</span>
              <span>{{blockNumbers}}</span>
            </li>
            <li>
              <span>最新出块时间：</span>
              <span>{{difftime}}</span>
            </li>
            <li>
              <span>合作方数量：</span>
              <span>{{partners}}</span>
            </li>
            <li>
              <span>交易数量：</span>
              <span>{{transactionCounts}}</span>
            </li>
            <li>
              <span>资产数量：</span>
              <span>{{saveCounts}}</span>
            </li>
          </ul>
        </div>
        <div class="info_box">
          <div class="info_title">
            <h2>最新区块</h2>
          </div>
          <div class="info">
            <ul class="info_th">
              <li style="width:164px">区块高度</li>
              <li style="width:716px">区块ID</li>
              <li style="width:152px">交易笔数</li>
              <li style="width:168px">出块时间</li>
            </ul>
            <ul class="info_tb" v-for="(item,index) in blocks" :class="index%2?'even':''" :key="item.number">
              <li style="width:164px">{{item.number}}</li>
              <li style="width:716px;cursor:pointer" @click="clickBlock($event)">{{item.hash}}</li>
              <li style="width:152px">{{item.transactions.length}}</li>
              <li style="width:168px">{{item.timestamp}}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import formatDate from "@/common/js/formatDate.js";
  import axios from "axios";
  import _ from "lodash";
  import {baseURL,baseContract,baseABI} from '@/common/js/public.js';
  const reqURL = `${baseURL}`;
  const tradeURL = `${baseURL}/v1/txn`;
  const contractAddress = `${baseContract}`;
  //实例化web3对象
  var Web3 = require("web3");
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(reqURL));
  //定义abi及调用合约
  var abi = baseABI;
  var MyContract = web3.eth.contract(abi);
  var myContractInstance = MyContract.at(contractAddress);
  export default {
    name: "home",
    data() {
      return {
        blockNumbers: "",
        partners: "",
        difftime: "",
        transactionCounts: "",
        saveCounts: "",
        blocks: [],
        saves: [],
        transactions: [],
        togglebg: false,
        searchType: "区块高度",
        search_content: "",
        searchTime: "",
        click_msg: "",
        searchBlock: {},
        searchBlockjp: {},
        searchSaveHash: {},
        searchSaveHashjp: {},
        searchTradeHash: {},
        searchTradeHashjp: {},
        searchAccountBalance: {
          id: "",
          result: ""
        },
        searchAccountBalancejp: {},
        home_seen: true,
        block_seen: false,
        save_seen: false,
        trade_seen: false,
        account_seen: false,
      };
    },
    mounted() {
      var blocks = [];
      var transactions = [];
      var saves = [];
      // 获取区块数量
      this.blockNumbers = web3.eth.blockNumber;
      //获取合作方数量
      this.partners = myContractInstance.partnerNumber().c.toString();
      //获取交易数量
      axios
        .get(tradeURL)
        .then(res => {
          this.transactionCounts = res.data.count;
        })
        .catch(error => {
          this.transactionCounts = "";
        });
      //获取存证数量
      this.saveCounts = myContractInstance.attestsNunber().c.toString();
      
      //获取最新10个区块信息
      var blockCounts = this.blockNumbers;
      //如果区块数大于等于10取10块区块信息
      if (blockCounts > 9) {
        for (var i = blockCounts; i > blockCounts - 10; i--) {
          var info = web3.eth.getBlock(i);
          info.timestamp = formatDate(
            new Date(info.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          blocks.push(info);
        }
        this.blocks = blocks;
        // .sort(function(a, b) {
        //         return b.number - a.number;
        //       });
      } else {//如果区块数小10则全部取出区块信息
        for (var i = blockCounts; i > 0; i--) {
          var info = web3.eth.getBlock(i);
          info.timestamp = formatDate(
            new Date(info.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          blocks.push(info);
        }
        this.blocks = blocks;
        // .sort(function(a, b) {
        //         return b.number - a.number;
        //       });
      }
      
      //获取最新10个存证信息
      var counts = this.saveCounts - 1;
      if (counts > 8) {//如果存证数大于等于10取10个存证信息
        for (var i = counts; i > counts - 10; i--) {
          saves.push(myContractInstance.attestByIndex(i));
          this.saves = saves.sort(function (a, b) {
            return b[4] - a[4];
          });
        }
      } else {//如果存证数小于10全部取出存证信息
        for (var i = counts; i > -1; i--) {
          saves.push(myContractInstance.attestByIndex(i));
          this.saves = saves.sort(function (a, b) {
            return b[4] - a[4];
          });
        }
      }
      //每隔15秒重新获取数据
      var that = this;
      setInterval(function () {
        //获取最新合作方数量
        that.partners = myContractInstance.partnerNumber().c.toString();
        //获取最新交易数量
        axios
          .get(tradeURL)
          .then(res => {
            that.transactionCounts = res.data.count;
          })
          .catch(error => {
            that.transactionCounts = "";
          });
        //获取最新区块数和区块信息
        var newBlockNumbers = web3.eth.blockNumber;
        var newBlockCounts = newBlockNumbers - blockCounts;
        that.blockNumbers = newBlockNumbers;
        if (newBlockCounts === 0) {
        } else if (10 > newBlockCounts > 0) {
          for (var i = 1; i <= newBlockCounts; i++) {
            var newInfo = web3.eth.getBlock(i + blockCounts);
            newInfo.timestamp = formatDate(
              new Date(newInfo.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            blocks.unshift(newInfo);
            // blocks.pop();
            if (blocks.length > 10) {
              blocks.pop();
            }
          }
          that.blocks = blocks;
          // .sort(function(a, b) {
          //   return b.number - a.number;
          // });
        } else {
          var blockCounts = newBlockNumbers;
          var blocks = [];
          for (var i = blockCounts; i > blockCounts - 10; i--) {
            var info = web3.eth.getBlock(i);
            info.timestamp = formatDate(
              new Date(info.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            blocks.push(info);
            if (blocks.length > 10) {
              blocks.pop();
            }
          }
          that.blocks = blocks;
          // .sort(function(a, b) {
          //   return b.number - a.number;
          // });
        }
        //获取最新存证数量
        that.saveCounts = myContractInstance.attestsNunber().c.toString();
        //获取最新存证信息
        var newSaveCounts = myContractInstance.attestsNunber().c.toString();
        var newCounts = newSaveCounts - that.saveCounts;
        if (newCounts === 0) {
        } else if (newCounts > 0) {
          if (newCounts < 10) {
            for (var i = 0; i < newCounts; i++) {
              saves.unshift(
                myContractInstance.attestByIndex(parseInt(that.saveCounts) + i)
              );
              // saves.pop();
              if (saves.length > 10) {
                saves.pop();
              }
              that.saves = saves.sort(function (a, b) {
                return b[4] - a[4];
              });
            }
          } else {
            for (var i = 0; i < 10; i++) {
              saves.unshift(
                myContractInstance.attestByIndex(parseInt(that.saveCounts) + i)
              );
              // saves.pop();
              if (saves.length > 10) {
                saves.pop();
              }
              that.saves = saves.sort(function (a, b) {
                return b[4] - a[4];
              });
            }
          }
          that.saveCounts = newSaveCounts;
        }
      }, 10000);
    },
    watch: {
      //获取最新出块时间
      blocks: function () {
        if (this.blocks.length > 1) {
          //方法2，可以直接在watch下写监听到变量发生变化后要运行的代码
          // var dateNew=new Date(this.blocks[0].timestamp)
          // var dateOld=new Date(this.blocks[1].timestamp)
          // this.difftime=(dateNew-dateOld)/1000+"s"
          this.getDiffTime();
        }
      }
    },
    methods: {
      //获取最新出块时间
      getDiffTime: function () {
        var dateNew = new Date(this.blocks[0].timestamp);
        var dateOld = new Date(this.blocks[1].timestamp);
        this.difftime = (dateNew - dateOld) / 1000 + "s";
      },
      //点击切换显示隐藏下拉列表和更换背景
      showType: function (event) {
        this.togglebg = !this.togglebg;
      },
      //离开元素隐藏下拉列表
      leaveHid: function () {
        if (this.togglebg === true) {
          this.togglebg = false;
        }
      },
      //更改搜索类型，并隐藏下拉列表
      changType: function (event) {
        this.searchType = event.target.innerText;
        this.togglebg = false;
      },
      //获取查询时间
      getSearchTime: function () {
        var searchTime = new Date();
        searchTime = formatDate(searchTime, "yyyy-MM-dd hh:mm:ss");
        return searchTime;
      },
      //json数据格式化
      syntaxHighlight: function (json) {
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
      //点击区块ID显示对应的区块信息页
      clickBlock: function () {
        this.click_msg = event.target.innerText;
        this.home_seen = false;
        this.save_seen = false;
        this.block_seen = true;
        this.searchTime = this.$options.methods.getSearchTime();
        var that = this;
        this.searchBlock = _.find(that.blocks, function (o) {
          return o.hash === that.click_msg;
        });
        this.searchBlockjp = this.$options.methods.syntaxHighlight(this.searchBlock);
        console.log(this.search_content)
      },
      //查看上一个区块信息
      clickPrevious: function () {
        var nowNumber = this.searchBlock.number;
        this.searchTime = this.$options.methods.getSearchTime();
        if (nowNumber - 1 >= 0) {
          var previousInfo = web3.eth.getBlock(nowNumber - 1);
          previousInfo.timestamp = formatDate(
            new Date(previousInfo.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          this.searchBlock = previousInfo;
          this.searchBlockjp = this.$options.methods.syntaxHighlight(this.searchBlock);
        } else {
          this.searchBlock = {"number": -1};
          this.searchBlockjp = "区块不存在!!!"
        }
      },
      //查看下一个区块信息
      clickNext: function () {
        var nowNumber = this.searchBlock.number;
        var lastNumber = web3.eth.blockNumber;
        this.searchTime = this.$options.methods.getSearchTime();
        if (nowNumber + 1 <= lastNumber) {
          var nextInfo = web3.eth.getBlock(nowNumber + 1);
          nextInfo.timestamp = formatDate(
            new Date(nextInfo.timestamp * 1000),
            "yyyy-MM-dd hh:mm:ss"
          );
          this.searchBlock = nextInfo;
          this.searchBlockjp = this.$options.methods.syntaxHighlight(this.searchBlock);
        } else {
          this.searchBlock = {"number": lastNumber + 1};
          this.searchBlockjp = "区块不存在!!!"
        }
        
      },
      //点击存证哈希显示对应的存证信息页
      clickSave: function () {
        this.click_msg = event.target.innerText;
        var that = this;
        this.home_seen = false;
        this.block_seen = false;
        this.save_seen = true;
        this.searchSaveHash = _.find(that.saves, function (o) {
          return o[3] === that.click_msg;
        });
        this.searchSaveHashjp = this.$options.methods.syntaxHighlight(this.searchSaveHash);
      },
      clearSearch: function () {
        this.home_seen = false;
        this.block_seen = false;
        this.save_seen = false;
        this.trade_seen = false;
        this.account_seen = false;
      },
      search: function () {
        /*this.$options.methods.clearSearch();*/
        if (this.search_content === "") {
          return
        } else if (this.searchType === "区块高度") {
          //按区块高度或者区块哈希查询区块信息
          this.home_seen = false;
          this.block_seen = true;
          this.save_seen = false;
          this.trade_seen = false;
          this.account_seen = false;
          this.searchTime = this.$options.methods.getSearchTime();
          this.searchBlock = web3.eth.getBlock(this.search_content);
          if (this.searchBlock === null) {
            this.searchBlock = ""
            this.searchBlockjp = "您输入的区块高度有误!!!"
          } else {
            this.searchBlock.timestamp = formatDate(
              new Date(this.searchBlock.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.searchBlockjp = this.$options.methods.syntaxHighlight(this.searchBlock);
          }
        } else if (this.searchType === "区块哈希") {
          this.home_seen = false;
          this.block_seen = true;
          this.save_seen = false;
          this.trade_seen = false;
          this.account_seen = false;
          this.searchTime = this.$options.methods.getSearchTime();
          this.searchBlock = web3.eth.getBlock(this.search_content);
          if (this.searchBlock === null) {
            this.searchBlock = "";
            this.searchBlockjp = "您输入的区块哈希有误!!!";
          } else {
            this.searchBlock.timestamp = formatDate(
              new Date(this.searchBlock.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.searchBlockjp = this.$options.methods.syntaxHighlight(this.searchBlock);
          }
        } else if (this.searchType === "存证哈希") {
          //按存证哈希查询存证信息
          this.home_seen = false;
          this.block_seen = false;
          this.save_seen = true;
          this.trade_seen = false;
          this.account_seen = false;
          this.searchTime = this.$options.methods.getSearchTime();
          this.searchSaveHash = myContractInstance.acquireVerify(
            this.search_content
          );
          if (this.searchSaveHash[0] === "0x0000000000000000000000000000000000000000") {
            this.searchSaveHash[0] = "";
            this.searchSaveHashjp = "您输入的存证信息有误!!!";
          } else {
            this.searchSaveHashjp = this.$options.methods.syntaxHighlight(
              this.searchSaveHash
            );
          }
        } else if (this.searchType === "交易哈希") {
          //按交易哈希查询交易信息
          this.home_seen = false;
          this.block_seen = false;
          this.save_seen = false;
          this.trade_seen = true;
          this.account_seen = false;
          this.searchTime = this.$options.methods.getSearchTime();
          try {
            this.searchTradeHash = web3.eth.getTransaction(this.search_content);
            this.searchTradeHashjp = this.$options.methods.syntaxHighlight(
              this.searchTradeHash
            );
          } catch (e) {
            this.searchTradeHash = "";
            this.searchTradeHashjp = "您输入的交易哈希有误!!!";
          }
        } else if (this.searchType === "账户余额") {
          //按账户地址查询余额
          this.home_seen = false;
          this.block_seen = false;
          this.save_seen = false;
          this.trade_seen = false;
          this.account_seen = true;
          this.searchTime = this.$options.methods.getSearchTime();
          try {
            this.searchAccountBalance.result = web3.eth.getBalance(this.search_content);
            this.searchAccountBalance.id = this.search_content;
            this.searchAccountBalance.result = this.searchAccountBalance.result.dividedBy(1e+18).toString();
          } catch (e) {
            this.searchAccountBalance.id = "您输入的账户地址有误!!!";
            this.searchAccountBalance.result = "";
          }
        }
      }
      
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
  
    .container_box {
      padding-top: 50px;
      .count_box {
        width: 1200px;
        margin-bottom: 36px;
        margin-left: auto;
        margin-right: auto;
        background-color: rgba(0, 143, 254, 0.73);
      
        .count {
          display: flex;
        
          li {
            display: inline-block;
            flex: 1;
            text-align: center;
            height: 40px;
            line-height: 40px;
            span {
              display: inline-block;
              color: #ffffff;
              font-size: 16px;
            }
          }
        }
      }
    
      .info_box {
        margin-top: 0px;
        margin-bottom: 25px;
        margin-left: auto;
        margin-right: auto;
      
        .info_title {
          margin-left: 12px;
          margin-bottom: 2px;
          width: 120px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          background-color: #0d50f9;
          border-radius: 15px 15px 0px 0px;
        }
      
        .info {
          width: 1200px;
          margin: 0 auto;
          background-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0px 3px 26px 2px rgba(255, 255, 255, 0.31);
          border-radius: 0px 0px 25px 0px;
        
          ul {
            font-size: 0;
            margin: 0 auto;
            box-sizing: border-box;
          
            li {
              box-sizing: border-box;
              display: inline-block;
              font-size: 14px;
            }
          }
        
          .info_th {
            text-align: center;
            background-color: #a0a0a0;
            height: 30px;
            line-height: 30px;
          }
        
          .info_tb {
            height: 36px;
            line-height: 36px;
            color: #222222;
          
            li {
              border-right: 1px solid #a0a0a0;
              padding-left: 12px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          
            li:last-child {
              border-right: none;
            }
          
            .apply {
              padding-left: 0px;
              text-align: center;
              line-height: normal;
            
              a {
                display: inline-block;
                padding-top: 8px;
              }
            }
          }
          .even {
            background-color: #ffffff;
          }
        
          .even:last-child {
            border-radius: 0px 0px 25px 0px;
          }
        
          .info_tb:last-child {
            li {
              border-bottom: none;
            }
          }
        
          .info_tb:hover {
            background-color: #00e0dd;
            color: #ffffff;
            box-shadow: 0px 3px 7px 0px rgba(0, 198, 255, 0.39);
          
            li {
              border: none;
            }
          }
        
          .info_tb:last-child:hover {
            border-radius: 0px 0px 25px 0px;
          }
        }
      }
    }
  }
}
</style>
