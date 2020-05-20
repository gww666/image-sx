//一些公用方法
export const rem2px = (rem) => {
    // return document.documentElement.style.fontSize.slice(0, -2) * rem;
    let value = window.getComputedStyle(document.documentElement, null).fontSize.slice(0, -2) * rem;
    return Math.round(value);
}

export const px2rem = (px) => {
    px = px + "";
    if (px.indexOf("px")) px = px.slice(0, -2);
    return (px / window.getComputedStyle(document.documentElement, null).fontSize.slice(0, -2)).toFixed(2);
}