export function generateRandomPrice(min = 10.0, max = 200.0) {
    const randomValue = Math.random() * (max - min) + min;
    return Number(randomValue.toFixed(2));
}
