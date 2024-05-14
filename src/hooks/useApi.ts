import axios, {AxiosError} from "axios";
import {computed} from "vue";
import {useUserStore} from "../store/user";
import generateDeviceId from "@/lib/generateDeviceId.ts";
import {usePushStore} from "@/store/push.ts";

const deviceId = generateDeviceId()

// Получение URL сервера и временного токена из окружения
const SERVER_URL =
    import.meta.env.VITE_DEV_PROXY_PREFIX &&
    !import.meta.env.VITE_SERVER_URL.includes("http")
        ? import.meta.env.VITE_DEV_PROXY_PREFIX + import.meta.env.VITE_SERVER_URL
        : import.meta.env.VITE_SERVER_URL;

const useApi = () => {
    const userStore = useUserStore();
    const push = usePushStore()

    // Создание экземпляра axios с предустановленными параметрами
    const axiosInstance = computed(() =>
        axios.create({
            baseURL: SERVER_URL,
            headers: {
                Authorization: `Bearer ${userStore.token}`,
                DeviceId: deviceId,
                "Content-Type": "application/json",
            },
        })
    );

    const onError = (error: AxiosError<any>) => {
        if (error.response?.data?.name && error.response?.data?.message) {
            const notification = {
                title: error.response.data.name,
                body: error.response.data.message
            }
            push.addNotification({
                notification,
                from: 'system',
                collapseKey: '',
                messageId: crypto.randomUUID(),
            })
        }
    }

    // Функция для отправки запроса
    const request = async (path: string, params?: object) => {
        const body = JSON.stringify(params);
        try {
            const response = await axiosInstance.value.post(path, body);
            return response.data;
        } catch (error: any) {
            onError(error);
            throw error;
        }
    };

    // Функция для выполнения GET запроса
    const get = async <T>(path: string, params?: object): Promise<T> => {
        try {
            const body = JSON.stringify(params);
            const response = await axiosInstance.value.post(path, body);
            return response.data.data;
        } catch (error: any) {
            onError(error);
            throw error;
        }
    };

    return {
        axiosInstance,
        request,
        get,
    };
};

export default useApi