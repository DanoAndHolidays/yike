<script setup></script>

<template>
    <div class="container">
        <div class="play">
            <div class="tab" ref="tab">
                <div>
                    <i class="fa-solid fa-heart fa-2xl"></i>
                    <p class="animation-placehoder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                </div>
                <div>
                    <i class="fa-solid fa-star fa-2xl"></i>
                    <p class="animation-placehoder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                </div>
                <div>
                    <i class="fa-solid fa-share fa-2xl"></i>
                    <p class="animation-placehoder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                </div>
                <div>
                    <i class="fa-solid fa-bars-staggered fa-2xl"></i>
                    <p class="animation-placehoder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                </div>
                <div>
                    <i class="fa-solid fa-volume-xmark fa-2xl"></i>
                </div>
            </div>
            <div class="video">
                <div class="loading-container">
                    <div class="loding-div animation-loading"></div>
                    <div class="loding-div animation-loading-reverse"></div>
                </div>
                <div class="text">一刻加载中...</div>
            </div>

            <div class="bottom">
                <h3 class="animation-placehoder">&nbsp;</h3>
                <small class="animation-placehoder">&nbsp;</small>
            </div>
            <div class="placeholder"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.animation-placehoder {
    // background-color: red;
    background-image: linear-gradient(
        80deg,
        $text-color-4 0%,
        #e3e3e369 10%,
        $text-color-4 20%,
        $text-color-4 100%
    );
    animation: bgPos 1s linear infinite;
    background-size: 200% 100%;
    transition: all 0.3s ease;
}

.animation-loading {
    animation: loading 0.5s linear infinite alternate;
}

.animation-loading-reverse {
    animation: loading 0.5s linear infinite alternate-reverse;
}

@keyframes bgPos {
    0% {
        background-position: 200% 0;
        opacity: 0.3;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        background-position: 0% 0;
        opacity: 0.3;
    }
}

@keyframes loading {
    0% {
        transform: translate(-70%, 0);
        // background-color: green;
    }

    100% {
        transform: translate(70%, 0);
        // background-color: red;
    }
}

.container {
    height: 100%;
    width: 100%;
    user-select: none;
    pointer-events: none;
    overflow: hidden;

    .play {
        height: 100%;
        width: 100%;
        position: relative;
        z-index: 10;
        user-select: none;

        .video {
            position: relative;
            background-color: $tiktok-background-color-1;
            height: calc(100% - $tab-bar-height);
            width: 100%;
            // border: red solid 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            .loading-container {
                height: 30px;
                aspect-ratio: 1 / 1;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;

                .loding-div {
                    position: absolute;
                    height: 20px;
                    aspect-ratio: 1 / 1;
                    border-radius: 50%;
                    filter: opacity(70%);
                    background-color: $primary-color;
                }
            }

            .text {
                color: $text-color-4;
                font-size: small;
                text-align: center;
                opacity: 0.7;
            }
        }

        .tab {
            display: flex;
            flex-direction: column;
            color: $text-color-1;
            position: absolute;
            right: 0;
            bottom: $tab-bar-height;
            text-align: center;
            margin-bottom: 20px;
            z-index: 10;

            div {
                margin: 10px;
                margin-top: 17px;

                i {
                    color: $text-color-4;
                    opacity: 0.5;
                }

                p {
                    font-size: small;
                    // background-color: red;
                    // border: red solid 2px;
                    width: 9.5vw;
                    border-radius: 100px;
                    opacity: 0.8;
                    text-align: center;
                    height: 12px;
                }
            }
        }

        .bottom {
            max-width: 350px;
            color: $text-color-1;
            position: absolute;
            left: 0;
            bottom: $tab-bar-height;
            margin-bottom: 20px;
            z-index: 100;
            margin: 10px;
            margin-bottom: 20px;

            h3 {
                margin-bottom: 10px;
                // border: red solid 2px;
                width: 30vw;
                border-radius: 100px;
                opacity: 0.8;
            }

            small {
                display: block;
                // border: red solid 2px;
                width: 50vw;
                border-radius: 100px;
                opacity: 0.8;
            }
        }

        .placeholder {
            display: block;
            height: $tab-bar-height;
        }
    }
}
</style>
