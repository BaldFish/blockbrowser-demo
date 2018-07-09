<template>
  <div class="blockList">
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
        difftime: "",
        partners: "",
        transactionCounts: "",
        saveCounts: "",
        blocks: [],
        click_msg: "",
        blockData:{},
      };
    },
    mounted() {
      // 获取区块数量
      this.getBlockCounts();
      //获取合作方数量
      this.getTradeCounts();
      //获取交易数量
      this.getPartnerCounts();
      //获取资产数量
      this.getSaveCounts();
      //获取区块列表
      this.getNewBlocksList();
      //每隔15秒重新获取数据
      var that = this;
      setInterval(function () {
        //获取最新合作方数量
        that.getTradeCounts();
        //获取最新交易数量
        that.getPartnerCounts();
        //获取最新资产数量
        that.getSaveCounts();
        // 获取最新区块信息和最新区块数
        var blockCounts = that.blockNumbers;
        that.getBlockCounts();
        var newBlockCounts =  that.blockNumbers - blockCounts;
        if (newBlockCounts === 0) {
        } else if (15 > newBlockCounts > 0) {
          for (var i = 1; i <= newBlockCounts; i++) {
            var newInfo = web3.eth.getBlock(i + blockCounts);
            newInfo.timestamp = formatDate(
              new Date(newInfo.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            that.blocks.unshift(newInfo);
            if (that.blocks.length > 15) {
              that.blocks.pop();
            }
          }
        } else {
          for (var i = blockCounts; i > blockCounts - 15; i--) {
            var info = web3.eth.getBlock(i);
            info.timestamp = formatDate(
              new Date(info.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            that.blocks.push(info);
            if (this.blocks.length > 15) {
              that.blocks.pop();
            }
          }
        }
      }, 15000);
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
      getDiffTime() {
        var dateNew = new Date(this.blocks[0].timestamp);
        var dateOld = new Date(this.blocks[1].timestamp);
        this.difftime = (dateNew - dateOld) / 1000 + "s";
      },
      //获取出块数量
      getBlockCounts(){
        this.blockNumbers = web3.eth.blockNumber;
      },
      //获取合作方数量
      getPartnerCounts(){
        this.partners = myContractInstance.partnerNumber().c.toString();
      },
      //获取交易数量
      getTradeCounts(){
        axios
          .get(tradeURL)
          .then(res => {
            this.transactionCounts = res.data.count;
          })
          .catch(error => {
            this.transactionCounts = "";
          });
      },
      //获取资产数量
      getSaveCounts(){
        this.saveCounts = myContractInstance.attestsNunber().c.toString();
      },
      //获取区块列表
      getNewBlocksList(){
        //获取最新10个区块信息
        if (this.blockNumbers > 14) {//如果区块数大于等于10取10块区块信息
          for (var i = this.blockNumbers; i > this.blockNumbers - 15; i--) {
            var info = web3.eth.getBlock(i);
            info.timestamp = formatDate(
              new Date(info.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.blocks.push(info);
          }
          // this.blocks.sort(function(a, b) {
          //         return b.number - a.number;
          //       });
        } else {//如果区块数小10则全部取出区块信息
          for (var i = this.blockNumbers; i > 0; i--) {
            var info = web3.eth.getBlock(i);
            info.timestamp = formatDate(
              new Date(info.timestamp * 1000),
              "yyyy-MM-dd hh:mm:ss"
            );
            this.blocks.push(info);
          }
          // this.blocks.sort(function(a, b) {
          //         return b.number - a.number;
          //       });
        }
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
      //点击区块ID显示对应的区块信息页
      clickBlock() {
        this.click_msg = event.target.innerText;
        this.searchTime = this.getSearchTime();
        var that = this;
        this.searchBlock = _.find(that.blocks, function (o) {
          return o.hash === that.click_msg;
        });
        this.searchBlockjp = this.syntaxHighlight(this.searchBlock);
        this.blockData.searchTime=this.searchTime;
        this.blockData.searchBlock=this.searchBlock;
        this.blockData.searchBlockjp=this.searchBlockjp;
        this.getBlockData();
        window.location.href="#/blockDetails"
      },
      getBlockData(){
        this.$store.commit("changeBlockData",this.blockData);
      },
    },
    components: {}
  };
</script>

<style scoped lang="stylus">
.blockList{
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
</style>
