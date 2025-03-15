export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(val, max));
};

export const round = (num: number, maxPrecision = 0): number => {
  let str = num.toFixed(maxPrecision);
  const isFloat = str.includes(".");

  if (isFloat) {
    for (let i = str.length - 1; i > 0; i--) {
      const char = str[i];

      if (char !== "0") {
        str = str.substring(0, char === "." ? i : i + 1);
        break;
      }
    }
  }

  return Number(str);
};
