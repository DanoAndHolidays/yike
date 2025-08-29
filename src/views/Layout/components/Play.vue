<script setup>
</script>

<template>
    <div class="play">
        <div class="video">
            视频
        </div>
        <div class="tab">
            <div>
                <i class="fa-solid fa-heart fa-2xl"></i>
                <p>12.3万</p>
            </div>
            <div>
                <i class="fa-solid fa-star fa-2xl"></i>
                <p>1.9万</p>
            </div>
            <div>
                <i class="fa-solid fa-bars-staggered fa-2xl"></i>
                <p>120集</p>
            </div>
            <div>
                <i class="fa-solid fa-share fa-2xl"></i>
                <p>0.9万</p>
            </div>
            <div>
                <i class="fa-solid fa-volume-xmark fa-2xl"></i>
            </div>
        </div>
        <div class="bottom">
            <h3>剧名剧名剧名</h3>
            <small>当前剧集 2</small>
        </div>
    </div>
</template>

<style scoped lang="scss">
.play {
    height: 100%;
    width: 100%;
    position: relative;

    .video {
        background-color: rgb(90, 90, 155);
        height: 100%;
        width: 100%;
    }

    .tab {
        display: flex;
        flex-direction: column;
        color: $text-color-1;
        position: absolute;
        right: 0;
        bottom: 0;
        text-align: center;
        margin-bottom: 20px;
        z-index: 100;

        div {
            margin: 10px;

            p {
                font-size: small;
            }
        }

    }

    .bottom {
        max-width: 350px;
        color: $text-color-1;
        position: absolute;
        left: 0;
        bottom: 0;
        margin-bottom: 20px;
        z-index: 100;
        margin: 10px;
        margin-bottom: 20px;

        h3 {
            margin-bottom: 10px;
        }
    }
}
</style>