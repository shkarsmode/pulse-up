export const toCumulative = (input: number[]) => {
    return input.map((_, i) => input.slice(0, i + 1).reduce((sum, item) => sum + item, 0));
};
