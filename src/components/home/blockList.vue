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
  export default {
    name: "blockList",
    data() {
      return {}
    },
    created() {
    },
    mounted() {
    },
    methods: {},
    watch: {},
    computed: {},
    components: {},
  }
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
