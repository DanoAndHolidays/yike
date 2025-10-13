<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { login, logout } from '@/apis/login'
import { useRouter } from 'vue-router'
const router = useRouter()

const userStore = useUserStore()

const loginData = ref({})
const logoutData = ref({})

const username = ref('')
const password = ref('')

const mockLogin = async () => {
    const res = await login()
    loginData.value = res
}

const mockLogout = async () => {
    const res = await logout()
    logoutData.value = res
}

const handleLogin = () => {
    // mockLogin()
    userStore.setIsLogin()
    router.push('/mine')
}

const handleLogout = () => {
    mockLogout()
    userStore.setIsLogout()
}
</script>

<template>
    <div class="container">
        <div class="header">
            <!-- 给图标添加背景颜色，字体颜色为白色 -->
            <img src="/icon.png" alt="logo" class="logo" />
        </div>
        <form class="auth-form" @submit.prevent="handleLogin">
            <div class="input-group">
                <label for="username">用户名：</label>
                <input
                    v-model="username"
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    required
                    class="input-field"
                />
            </div>
            <div class="input-group">
                <label for="password">密码：</label>
                <input
                    v-model="password"
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    required
                    class="input-field"
                />
            </div>
            <button type="submit" class="action-button login">登录</button>

            <div class="small">
                <div @click="handleLogout" class="logout">新用户注册</div>
                <div @click="handleLogin" class="skip">跳过注册</div>
            </div>
        </form>
        <div class="footer">
            登录功能需要启用服务器，跳过注册与登录体验相同
            <br />
            <br />
            Copyright &copy;2025 Dano
            <br />
            <span style="font-size: 0.7rem; opacity: 0.8"
                >「一刻」短剧&nbsp;&nbsp;|&nbsp;&nbsp;由Dano开发，仅学习使用</span
            >
        </div>
    </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
.footer {
    position: absolute;
    bottom: 20px;
    margin: 64px 0;
    color: $text-color-1;
    font-size: 0.8rem;
    text-align: center;
    opacity: 0.85;
}
/* 基础样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    background-color: $tiktok-background-color-1;
    position: absolute;
    color: $text-color-1;
}

/* 图标样式 */
.header {
    margin-bottom: 2rem;
}

.logo {
    width: 100px;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: $primary-color; /* 背景色为primary */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.logo img {
    width: 50px;
    height: 50px;
}

/* 表单样式 */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: #2a2b2e; /* 暗色背景 */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 输入框样式 */
.input-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-field {
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid $text-color-4;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
    background-color: #3c3f44; /* 更暗的背景，和暗色主题匹配 */
    color: $text-color-1;

    &:focus {
        outline: none;
        border-color: $text-color-1;
        background-color: #444c53;
    }
}

/* 按钮样式 */
.action-button {
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    width: 100%;

    &:focus {
        outline: none;
    }

    &.login {
        background-color: $primary-color;
        color: $text-color-1;
        &:hover {
            background-color: color.adjust($primary-color, $lightness: -10%);
        }
    }

    &.logout {
        background-color: $like-color;
        color: $text-color-1;
        &:hover {
            background-color: color.adjust($like-color, $lightness: -10%);
        }
    }

    &.skip {
        background-color: $secondary-color;
        color: $text-color-2;
        &:hover {
            background-color: color.adjust($secondary-color, $lightness: -10%);
        }
    }
}

.action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 小文字样式 */
.small {
    width: inherit;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
    color: $text-color-3;
    opacity: 0.8;

    .logout {
        cursor: pointer;
        color: $favorite-color;
        text-align: center;
        text-decoration: underline;
    }

    .skip {
        cursor: pointer;
        color: $primary-color;

        text-align: center;
        text-decoration: underline;
    }
}
</style>
