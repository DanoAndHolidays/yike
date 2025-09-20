<script setup></script>

<template>
    <div class="container">
        <div class="icon">
            <img src="/src/assets/icon.png" alt="图标" />
        </div>

        <div class="text">
            <span style="letter-spacing: 0">「 </span>一<span style="letter-spacing: 0">刻 </span
            ><span style="letter-spacing: 0">」 短剧</span>
        </div>
        <div class="placeholder"></div>

        <div class="footer">
            Copyright &copy;2025 Dano
            <br />
            <span style="font-size: 0.7rem; opacity: 0.8"
                >「一刻」短剧&nbsp;&nbsp;|&nbsp;&nbsp;由Dano开发，仅学习使用</span
            >
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 100vh;
    width: 100vw;
    background-color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    user-select: none;
    pointer-events: none;

    min-width: 375px;
    min-height: 667px;
    max-width: 500px;
    overflow: hidden;

    .icon {
        height: 200px;
        width: 200px;
        img {
            height: 100%;
            width: 100%;
            margin: 0;
        }
    }

    .text {
        display: inline;
        margin: 0;
        color: $text-color-1;
        font-size: 1.5rem;
        letter-spacing: 0px;
        font-weight: bolder;
        font-style: italic;
        filter: blur(0.4px);
    }
    .placeholder {
        height: 100px;
        width: 100%;
    }

    .footer {
        position: absolute;
        bottom: 0;
        margin: 64px 0;
        color: $text-color-2;
        font-size: 0.8rem;
        text-align: center;
        opacity: 0.8;
    }
}
</style>
