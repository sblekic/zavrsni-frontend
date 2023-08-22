<script setup>
import { Tickets } from "@/services";
import { ref, watch } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";

let scanToggle = ref(false);
let alertToggle = ref(false);
let timer = ref(null);

watch(
  timer,
  (value) => {
    if (value > 0) {
      setTimeout(() => {
        timer.value--;
      }, 1000);
    }
  },
  { immediate: true }
);

async function onDetect(qrValue) {
  console.log(qrValue[0].rawValue);
  let ticketId = qrValue[0].rawValue;
  //   let res = await Tickets.scanTicket(ticketId);
  //   console.log(res.data);
  alertToggle.value = !alertToggle.value;
  timer.value = 3;

  setTimeout(() => {
    alertToggle.value = !alertToggle.value;
  }, 3000);
}

function onError(err) {
  console.log(err);
}

function start() {
  scanToggle.value = !scanToggle.value;
}

function paintOutline(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
}
</script>

<template>
  <main>
    <div class="container">
      <div class="card mx-auto text-center" style="width: 21rem">
        <div v-if="scanToggle" class="qr-wrapper canvas-position">
          <qrcode-stream
            :track="paintOutline"
            @error="onError"
            @detect="onDetect"
          ></qrcode-stream>
        </div>
        <img
          v-else
          src="https://picsum.photos/200/200"
          class="card-img-top"
          alt="..."
        />
        <div class="card-body">
          <div v-show="alertToggle" class="alert alert-primary" role="alert">
            Ulaznica skenirana! ({{ timer }})
          </div>
          <button @click="start" class="btn btn-primary">QR scan</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.qr-wrapper :deep() video {
  width: 100%;
}
.canvas-position :deep() canvas {
  position: absolute;
  right: 0;
}
</style>
