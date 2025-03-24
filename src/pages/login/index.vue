<template>
  <div class="select-none">
    <img :src="bg" class="wave" />

    <div class="flex-c absolute right-5 top-3">
      <!-- 切换主题 -->
      <el-switch v-model="dataTheme" inline-prompt :active-icon="dayIcon" :inactive-icon="darkIcon" @change="handleThemeChange" />
    </div>

    <div class="login-container">
      <div class="img">
        <component :is="illustrationComponent" />
      </div>

      <div class="login-box">
        <el-card style="width: 70%; margin-top: 40px">
          <el-space size="default" spacer="|">
            <img src="@/assets/login/avatar.png" width="25" alt="avatar" />

            <div class="card-header">
              <h2>登录</h2>
            </div>
          </el-space>

          <el-form
            ref="ruleFormRef"
            :model="form"
            :rules="loginRules"
            size="large"
            autocomplete="off"
            label-position="top"
            class="mt-8"
          >
            <Motion :delay="100">
              <el-form-item label="账号" prop="username" :rules="[{ required: true, message: '请输入账号', trigger: 'blur' }]">
                <el-input v-model="form.username" clearable placeholder="请输入您的账号" :prefix-icon="userIcon" maxlength="11" />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入账号', trigger: 'blur' }]">
                <el-input
                  v-model="form.password"
                  clearable
                  maxlength="20"
                  show-password
                  placeholder="请输入您的密码"
                  :prefix-icon="lockIcon"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-row justify="space-between">
                <el-form-item prop="isChecked">
                  <el-checkbox v-model="form.isChecked" label="记住密码" />
                </el-form-item>

                <el-form-item>
                  <span class="text-sky-600 hover:text-sky-900">忘记密码 ？</span>
                </el-form-item>
              </el-row>
            </Motion>

            <Motion :delay="250">
              <el-button class="w-full mt-4" size="default" type="primary" :loading="loading" @click="onLogin"> 登录 </el-button>
            </Motion>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRenderIcon } from '@/components/ReIcon/src/hooks';
  import { useDataThemeChange } from '@/layouts/hooks/useDataThemeChange';
  import { useNav } from '@/layouts/hooks/useNav';
  import { getTopMenu, initRouter } from '@/routes/utils';
  import { useUserStoreHook } from '@/stores/modules/user';
  import { message } from '@/utils/message';
  import type { FormInstance } from 'element-plus';
  import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Motion from './utils/motion';
  import { loginRules } from './utils/rule';
  import { bg, illustration } from './utils/static';

  import darkIcon from '@/assets/svg/dark.svg?component';
  import dayIcon from '@/assets/svg/day.svg?component';
  import Lock from '@iconify-icons/ri/lock-fill';
  import User from '@iconify-icons/ri/user-3-fill';

  defineOptions({ name: 'Login' });

  const router = useRouter();
  const loading = ref(false);
  const ruleFormRef = ref<FormInstance>();
  const form = reactive({ username: '', password: '', isChecked: false });

  // 图标
  const userIcon = useRenderIcon(User);
  const lockIcon = useRenderIcon(Lock);

  // 主题
  const { dataTheme, dataThemeChange } = useDataThemeChange();

  // 页面标题
  const { title: pageTitle } = useNav();

  // 插图组件（避免不必要的 toRaw 调用）
  const illustrationComponent = illustration;

  // 处理主题切换
  function handleThemeChange(value: string) {
    dataThemeChange(value);
  }

  // const { initStorage } = useLayout();

  // initStorage();

  // dataThemeChange(overallStyle.value);

  const onLogin = async () => {
    const formEl: FormInstance = ruleFormRef?.value;
    if (!formEl) return;
    await formEl.validate(async (valid) => {
      if (valid) {
        loading.value = true;
        try {
          const res = await useUserStoreHook().loginByUsername(form);
          if (res.success) {
            await initRouter();
            const targetPath = getTopMenu(true).path;
            await router.push(targetPath);
            message('登录成功', { type: 'success' });
          } else {
            message('登录失败', { type: 'error' });
          }
        } catch (error) {
          message(error?.message, { type: 'error' });
        } finally {
          loading.value = false;
        }
      }
    });
  };

  /** 使用公共函数，避免`removeEventListener`失效 */
  function onkeypress({ code }: KeyboardEvent) {
    if (['Enter', 'NumpadEnter'].includes(code)) onLogin();
  }

  onMounted(() => {
    window.document.addEventListener('keypress', onkeypress);
  });

  onBeforeUnmount(() => {
    window.document.removeEventListener('keypress', onkeypress);
  });
</script>

<style lang="scss" scoped>
  @import url('@/styles/login.css');
  :deep(.el-input-group__append, .el-input-group__prepend) {
    padding: 0;
  }
</style>
