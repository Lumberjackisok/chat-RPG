<script lang="ts">
export default {
  name: 'HomeView',
}
</script>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Configuration, OpenAIApi } from "openai";
import { start, done } from '../utils/myNprogress'
const configuration = new Configuration({
  apiKey: 'your apikeys here',
});
const openai = new OpenAIApi(configuration);

const state = reactive({
  firstSend: true,
  checks: "",
  emojiDisabled: false,
  windowHeight: 0,
  userInput: "",
  isLoading: false,
  chatMSG: [
    {
      msg: "你好,我是text-davinci-003",
      type: 'robot'
    },
    {
      msg: "",
      type: "user"
    }
  ],

})
const welcomEL: any = ref(null);
//当emoj改变时触发
const onEmojChange = () => {
  state.checks = state.checks == "" ? 'on' : "";

  //取消鼠标hover的缩放效果
  welcomEL.value.style.transform = 'scale(1)'

  //定时器实现过度效果
  let left = 50;
  let top = 5;
  let timer = setInterval(() => {
    left -= 6.2;
    top -= 0.5;
    welcomEL.value.style.left = left + "%";
    welcomEL.value.style.top = top + "rem";
    if (top <= 1) {
      clearInterval(timer);
      state.emojiDisabled = true;

      //移动到左上角后将元素尺寸变小，动态修改tailwind的值
      //通过元素的childre[0]拿到对应的节点
      welcomEL.value.children[0].classList.remove("text-5xl");
      welcomEL.value.children[0].classList.add("text-2xl");

    }
  }, 10);
}

//点击发送
const onsend = async () => {
  state.firstSend = false;
  scrollToBottom();
  if (state.userInput != '') {
    let input = state.userInput;
    state.userInput = "";
    let msg = { msg: input, type: "user" };
    let robotmsg = { msg: "Loading", type: "robot" };
    state.chatMSG.push(msg);
    state.chatMSG.push(robotmsg);
    start();
    try {
      state.isLoading = true;
      const completion = await openai.createCompletion({
        "model": "text-davinci-003",
        "prompt": `${input}`,
        // "temperature": 1,
        // "top_p": 1,
        // "n": 1,
        "max_tokens": 2500,
      });
      console.log(completion.data.choices[0].text);
      let robotmsg: any = { msg: completion.data.choices[0].text, type: "robot" };
      state.chatMSG[state.chatMSG.length - 1] = robotmsg;

      scrollToBottom();
      done();
      state.isLoading = false;
    } catch (error: any) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        done();
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        done();
      }
    }
    done();
  }

};

// 进度条触底方法
const homeview: any = ref(null);
const scrollToBottom = () => {
  setTimeout(() => {//使用setTimeout等待滚动容器加载完成后以便滚动到底部
    if (homeview.value) {
      homeview.value.scrollTop = homeview.value.scrollHeight;
    }
  }, 50)
};





onMounted(() => {
  //获取窗口高度
  state.windowHeight = window.innerHeight;

  //监听回车键
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      onsend();
    }
  });
})
</script>

<template>
  <div class="homeview" ref="homeview" :style="`height:${state.windowHeight}px`"  id="homeapp">

    <!-- 首次进入的画面 -->
    <div class="welcome" ref="welcomEL" style="left:45%;top:8rem;">
      <label className="swap swap-flip text-5xl">
        <!-- this hidden checkbox controls the state -->
        <input type="checkbox" @change="onEmojChange" :disabled="state.emojiDisabled"/>
        <div className="swap-on">🕺ON</div>
        <div className="swap-off">🕴️OFF</div>
     </label>
     
    </div>
    <!-- 首次进入的画面 -->

    <!-- 聊天界面 -->
    <div class="chat-view animate__animated animate__zoomInDown"   v-if="state.checks == 'on'">
      <div className="divider">
        <div calss="avatar">
          <div className="w-24 mask mask-squircle">
            <img src="../../public/avatar.jpg" />
          </div>
        </div>
      </div> 

      <!-- 聊天消息 -->
    <template v-for="item, index in state.chatMSG" :key="index">
      <div class="chat-content animate__animated animate__fadeIn" :style="state.firstSend ? 'animation-delay: 1.5s;' : 'animation-delay: 0s;'" v-if="item.msg != ''">
       
        <div :className="item.type == 'robot' ? 'chat chat-start' : 'chat chat-end'">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img :src="item.type == 'robot' ? '../../public/avatar.jpg' : '../../public/user.jpg'" />
            </div>
          </div>
          <div v-if="state.isLoading && item.type == 'robot' && index == state.chatMSG.length - 1" class="loading animate__shakeX chat-bubble">Loading...</div>
          <div v-else className="chat-bubble">{{ item.msg }}</div>
        </div>
      </div>
    </template>
    <!-- 聊天消息 -->

    </div>
    <!-- 聊天界面 -->
    

    

    <!-- 发送消息 -->
    <div class="send-box" :style="`top:${state.windowHeight - 80}px`" v-if="state.checks == 'on'">
      <div class="input-box">
        <input type="text" v-model="state.userInput" className="input input-accent w-full input-md">
      </div>
      <div class="submit-box mt-0.5 ml-1">
        <button  @click="onsend">
         <svg class="w-11 h-11 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
         </svg>
       </button>       
      </div>
     
      
    </div>
    <!-- 发送消息 -->
  </div>
</template>

<style scoped lang="less">
// loading动画


.loading {
  transform: animate__shakeX;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

.homeview::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}

.homeview::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}

.homeview::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;
}

.homeview::-webkit-scrollbar-thumb:hover {
  background: #333;
}

.homeview::-webkit-scrollbar-corner {
  background: #179a16;
}


.homeview {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 1.5rem;
  padding-bottom: 4.5rem;
  overflow-y: scroll;

  .welcome {
    display: inline-block;
    position: absolute;
    transform: scale(0.9);
    transition: transform 0.2s;
  }

  .welcome:hover {
    transform: scale(1);
  }
}

.chat-view {
  display: inline-block;
  width: 100%;
  padding: 1.5rem;
  padding-bottom: 2rem;
  margin-top: 3rem;
  transform: animate__zoomInDown;
  animation-duration: 1s;
}

// 修改滚动条样式



.chat-content {
  margin-top: 3rem;
  // padding: 0.5rem;
  // display: flex;
  transform: animate__fadeIn;
  animation-delay: 1s;
  animation-duration: 1s;
}

.chat-content2 {
  transform: animate__fadeIn;
  animation-duration: 1s;
}

.send-box {
  width: 100%;
  position: fixed;
  padding: 15px;
}

input:focus {
  outline: none;
}

.input-box,
.submit-box {
  float: left;
}

.input-box {
  width: 93%;
}

.submit-box {
  cursor: pointer;
  width: 5%;
  transform: scale(0.8);
  transition: transform 0.2s;
}

.submit-box:hover {
  transform: scale(1);
}
</style>