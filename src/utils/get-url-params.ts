/**
 * 解析 URL 中的所有参数，兼容 Hash 路由
 * @param url - 可选，解析的 URL，默认为当前页面的 location.href
 * @returns 包含所有参数的对象
 */
export function getUrlParams(url: string = location.href): Record<string, string | null> {
  try {
    let queryString = '';

    // 如果是 Hash 路由，提取 Hash 部分的参数
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.slice(hashIndex + 1);
      const queryIndex = hash.indexOf('?');
      if (queryIndex !== -1) {
        queryString = hash.slice(queryIndex + 1);
      }
    } else {
      // 非 Hash 路由，提取 URL 中的查询参数
      const queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
        queryString = url.slice(queryIndex + 1);
      }
    }

    // 解析查询参数
    const params = new URLSearchParams(queryString);

    const result: Record<string, string | null> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return {};
  }
}
