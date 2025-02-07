import useApi from "../hooks/useApi.ts";

// Функция открытия двери по id домофона
const openDoor = (domophoneId: number, doorId?: number) => {
    const { request } = useApi();
    // Вызов функции request для открытия двери по указанному id
    return request("address/openDoor", { domophoneId, doorId });
};

export default openDoor;
