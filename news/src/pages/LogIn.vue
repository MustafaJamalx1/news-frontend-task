<template>
    <v-app>
        <v-main>
            <v-container
                dir="rtl"
                fluid
                class="d-flex align-center justify-center"
                style="min-height: 100vh; background: linear-gradient(120deg, #e3f2fd 60%, #f5f7fa 100%);"
            >
                <v-row align="center" justify="center" class="flex-grow-1">
                    <v-col cols="12" sm="8" md="5" lg="4">
                        <v-card elevation="8" rounded="xl" color="white">
                            <v-card-title class="text-center text-primary font-weight-bold py-6" style="font-size: 1.5rem;">
                                <v-icon color="primary" size="32" class="ml-2">mdi-account-circle</v-icon>
                                تسجيل الدخول
                            </v-card-title>
                            <v-divider />
                            <v-card-text>
                                <v-form @submit.prevent="submitLogin" ref="formRef">
                                    <v-text-field
                                        v-model="username"
                                        label="اسم المستخدم"
                                        :rules="usernameRules"
                                        required
                                        variant="solo"
                                        color="primary"
                                        density="comfortable"
                                        prepend-inner-icon="mdi-account"
                                        dir="rtl"
                                        class="mb-3"
                                    />
                                    <v-text-field
                                        v-model="password"
                                        label="كلمة المرور"
                                        :rules="passwordRules"
                                        required
                                        variant="solo"
                                        color="primary"
                                        density="comfortable"
                                        prepend-inner-icon="mdi-lock"
                                        :type="showPassword ? 'text' : 'password'"
                                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                        @click:append-inner="showPassword = !showPassword"
                                        dir="rtl"
                                        class="mb-4"
                                    />
                                    <v-alert
                                        v-if="error"
                                        type="error"
                                        class="mb-4"
                                        border="start"
                                        variant="tonal"
                                        density="compact"
                                    >
                                        {{ error }}
                                    </v-alert>
                                    <v-btn
                                        color="primary"
                                        size="large"
                                        type="submit"
                                        :loading="isSubmitting"
                                        block
                                        rounded="lg"
                                        class="font-weight-bold"
                                        prepend-icon="mdi-login"
                                    >
                                        دخول
                                    </v-btn>
                                </v-form>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { authApi } from '@/services/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const error = ref('');
const formRef = ref();

const usernameRules = [
    (v: string) => !!v || 'اسم المستخدم مطلوب',
    (v: string) => v.length >= 3 || 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
];
const passwordRules = [
    (v: string) => !!v || 'كلمة المرور مطلوبة',
    (v: string) => v.length >= 6 || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
];

async function submitLogin() {
    error.value = '';
    if (formRef.value && !(formRef.value as any).validate()) return;
    isSubmitting.value = true;
    try {
        const response= await authApi.login(username.value, password.value);

        if (!response.ok) throw new Error('فشل تسجيل الدخول. تحقق من البيانات.');
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        router.push('/');
    } catch (err: any) {
        error.value = err.message || 'حدث خطأ أثناء تسجيل الدخول';
    } finally {
        isSubmitting.value = false;
    }
}
</script>
